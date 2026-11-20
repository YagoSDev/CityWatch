import base64
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timezone
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from backend.api import criar_app
from backend.ocorrencias import ServicoOcorrencias
from backend.relatos import TIPOS, ETIQUETAS, publicar


class TestRelatos(unittest.TestCase):
    def setUp(self):
        self.path = Path(self.enterContext(TemporaryDirectory())) / "teste.sqlite3"
        self.client = self.enterContext(TestClient(criar_app(self.path)))
        self.draft = {"chave": "teste-idempotencia-001", "tipo": "alagamento", "descricao": "Água obstruindo a passagem",
                      "localidade": "Entrada da praça fictícia", "bairro": "Bairro Teste", "etiquetas": ["clima_alagamento"]}

    def test_publicacao_confirmada_utc_e_integracao_estruturas(self):
        # Em São Paulo ainda é 19/11 quando a publicação em UTC já é de 20/11.
        agora_utc = datetime(2026, 11, 20, 1, 30, tzinfo=timezone.utc)
        self.enterContext(patch('backend.relatos.datetime', wraps=datetime)).now.return_value = agora_utc
        self.enterContext(patch('backend.ocorrencias.datetime', wraps=datetime)).now.return_value = agora_utc
        self.enterContext(patch('backend.ocorrencias.date', wraps=date)).today.return_value = date(2026, 11, 19)
        result = self.client.post('/relatos', json=self.draft)
        self.assertEqual(result.status_code, 201, result.text)
        item = result.json()
        self.assertTrue(item['id'].startswith('CW-'))
        self.assertEqual(item['status'], 'aberta')
        self.assertEqual(item['tipo'], 'alagamento')
        self.assertEqual(item['categoria'], 'conservação')
        self.assertEqual(item['origem'], 'cidadao')
        stamp = datetime.fromisoformat(item['publicado_em'])
        self.assertEqual(stamp.utcoffset(), timezone.utc.utcoffset(stamp))
        self.assertEqual(self.client.get('/ocorrencias/' + item['id']).json(), item)
        self.assertEqual(self.client.get('/fila').json()[-1]['id'], item['id'])
        self.assertEqual(self.client.get('/indicadores').json()['total'], 13)
        self.assertEqual(self.client.get('/bairros').json()['Bairro Teste']['conservação'][0]['id'], item['id'])
        changed = self.client.patch('/ocorrencias/' + item['id'] + '/status', json={'status': 'em análise'})
        self.assertEqual(changed.status_code, 200, changed.text)
        evento = self.client.get('/historico').json()[0]
        self.assertEqual(evento['ocorrencia_id'], item['id'])
        self.assertEqual(evento['data'], '2026-11-20')
        self.assertEqual(len(self.client.get('/validacao').json()), 1)

    def test_retry_e_concorrencia_nao_duplicam(self):
        payload = {**self.draft, 'anexo': None, 'localizacao': None}
        with ThreadPoolExecutor(max_workers=4) as pool:
            ids = list(pool.map(lambda _: publicar(ServicoOcorrencias(self.path), payload)['id'], range(4)))
        self.assertEqual(len(set(ids)), 1)
        self.assertEqual(len(self.client.get('/ocorrencias').json()), 13)
        self.assertEqual(self.client.post('/relatos', json=self.draft).json()['id'], ids[0])
        self.assertEqual(self.client.post('/relatos', json={**self.draft, 'descricao': 'Outro relato'}).status_code, 422)

    def test_campos_tipo_tamanho_etiquetas_data_e_coordenadas_invalidas(self):
        cases = [{'tipo': ''}, {'tipo': 'inexistente'}, {'descricao': '  '}, {'descricao': 'x' * 301},
                 {'localidade': ' '}, {'etiquetas': ['inexistente']}, {'etiquetas': ['clima_chuva'] * 2},
                 {'etiquetas': list(ETIQUETAS)[:6]}, {'publicado_em': '1900-01-01'},
                 {'localizacao': {'latitude': 91, 'longitude': 0, 'capturada_em': '2026-11-18T12:00:00Z'}}]
        for fields in cases:
            with self.subTest(fields=fields):
                self.assertEqual(self.client.post('/relatos', json={**self.draft, **fields}).status_code, 422)
        self.assertEqual(len(self.client.get('/ocorrencias').json()), 12)

    def test_mapeamento_tipos_e_categorias(self):
        for index, (tipo, categoria) in enumerate(TIPOS.items()):
            item = self.client.post('/relatos', json={**self.draft, 'tipo': tipo, 'chave': f'mapeamento-tipo-{index}'}).json()
            self.assertEqual(item['tipo'], tipo)
            self.assertEqual(item['categoria'], categoria)

    def test_evidencia_e_gps_persistidos_sem_exposicao_publica(self):
        image = b'\x89PNG\r\n\x1a\n' + b'exemplo de assinatura para teste de transporte'
        gps = {'latitude': -23.55, 'longitude': -46.63, 'precisao': 17.5, 'capturada_em': '2026-11-18T12:34:56Z'}
        item = self.client.post('/relatos', json={**self.draft, 'anexo': {'mime': 'image/png', 'base64': base64.b64encode(image).decode()}, 'localizacao': gps}).json()
        self.assertTrue(item['possui_anexo'])
        # Nova instância consulta a mesma persistência, sem guardar coordenadas no modelo público.
        service = ServicoOcorrencias(self.path)
        with service.armazenamento.transacao() as data:
            self.assertEqual(data['relatos'][item['id']]['localizacao_privada']['precisao'], 17.5)
        with service.armazenamento.conexao() as conn:
            self.assertEqual(conn.execute('SELECT conteudo FROM evidencias WHERE ocorrencia_id = ?', (item['id'],)).fetchone()[0], image)
        for path in ['/ocorrencias', '/ocorrencias/' + item['id'], '/bairros', '/fila', '/indicadores']:
            response = json.dumps(self.client.get(path).json())
            self.assertNotIn('latitude', response)
            self.assertNotIn('base64', response)

    def test_anexo_invalido_sem_cadastro_parcial(self):
        for mime, content in [('image/png', '???'), ('image/png', base64.b64encode(b'nao e imagem').decode()), ('audio/mp3', 'AAAA'), ('image/jpeg', '')]:
            with self.subTest(mime=mime, content=content):
                self.assertEqual(self.client.post('/relatos', json={**self.draft, 'anexo': {'mime': mime, 'base64': content}}).status_code, 422)
        self.assertEqual(len(self.client.get('/ocorrencias').json()), 12)
        with ServicoOcorrencias(self.path).armazenamento.conexao() as conn:
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM evidencias').fetchone()[0], 0)

    def test_anexo_real_tamanho_e_video(self):
        image = (Path(__file__).resolve().parents[2] / 'assets' / 'ibirapuera.jpg').read_bytes()
        encoded = base64.b64encode(image).decode()
        result = self.client.post('/relatos', json={**self.draft, 'anexo': {'mime': 'image/jpeg', 'base64': encoded}})
        self.assertEqual(result.status_code, 201)
        with ServicoOcorrencias(self.path).armazenamento.conexao() as conn:
            self.assertEqual(conn.execute('SELECT conteudo FROM evidencias').fetchone()[0], image)
        oversized = base64.b64encode(b'\xff\xd8\xff' + b'x' * (8 * 1024 * 1024)).decode()
        invalid = self.client.post('/relatos', json={**self.draft, 'chave': 'tamanho-invalido-002', 'anexo': {'mime': 'image/jpeg', 'base64': oversized}})
        self.assertEqual(invalid.status_code, 422)
        # Assinatura de contêiner para verificar o transporte, não uma reprodução de vídeo.
        video = b'\x00\x00\x00\x20ftypisom' + b'\x00' * 20
        result = self.client.post('/relatos', json={**self.draft, 'chave': 'teste-video-assinatura', 'anexo': {'mime': 'video/mp4', 'base64': base64.b64encode(video).decode()}})
        self.assertEqual(result.status_code, 201)

    def test_gps_sem_endereco_ou_bairro_e_complemento_opcional(self):
        gps = {'latitude': -23.55, 'longitude': -46.63, 'precisao': 1800, 'capturada_em': '2026-11-18T12:34:56Z'}
        draft = {key: value for key, value in self.draft.items() if key not in ('localidade', 'bairro')}
        item = self.client.post('/relatos', json={**draft, 'localizacao': gps, 'referencia': 'Ao lado do portão azul'}).json()
        self.assertEqual(item['status'], 'aberta')
        self.assertEqual(item['localidade'], 'Localização por GPS')
        self.assertEqual(item['referencia'], 'Ao lado do portão azul')
        self.assertNotIn('latitude', item)
        other = self.client.post('/relatos', json={**draft, 'chave': 'gps-sem-complemento-002', 'localizacao': gps})
        self.assertEqual(other.status_code, 201)
        self.assertEqual(other.json()['referencia'], '')
        with ServicoOcorrencias(self.path).armazenamento.transacao() as data:
            self.assertEqual(data['relatos'][item['id']]['localizacao_privada'], gps)
        self.assertEqual(self.client.post('/relatos', json={**draft, 'chave': 'sem-local-invalido-003'}).status_code, 422)
