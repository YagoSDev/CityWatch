from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest

from backend.armazenamento_arquivo import ArmazenamentoArquivo
from backend.ocorrencias import ServicoOcorrencias
from backend.validacoes import DuplicadoErro, ValidacaoErro

RAIZ = Path(__file__).resolve().parents[2]


class TestModoAcademico(unittest.TestCase):
    def servico(self, caminho=None):
        return ServicoOcorrencias(armazenamento=ArmazenamentoArquivo(caminho, RAIZ / "data"))

    def test_csv_entrega_igual_ao_original(self):
        for nome in ("ocorrencias.csv", "historico.csv"):
            self.assertEqual((RAIZ / "data" / nome).read_bytes(), (RAIZ / "backend/dados" / nome).read_bytes())

    def test_base_indicadores_e_inconsistencia(self):
        s = self.servico()
        r = s.indicadores()
        self.assertEqual((r['total'], r['pendencias'], r['tempo_medio_conclusao_dias']), (12, 9, 5.33))
        self.assertEqual(len(s.historico()), 10)
        self.assertEqual(s.avisos()[0]['id'], 'OC-013')

    def test_regras_filtros_e_historico_compartilhados(self):
        s = self.servico()
        s.cadastrar('A-1', 'limpeza', 'Teste fictício', 'Bairro Teste', '2026-11-18')
        self.assertEqual(s.buscar('a-1').status, 'aberta')
        self.assertIn('A-1', [i.id for i in s.listar('limpeza', 'aberta')])
        with self.assertRaises(DuplicadoErro):
            s.cadastrar('A-1', 'limpeza', 'Outro', 'Bairro Teste')
        with self.assertRaises(ValidacaoErro):
            s.atualizar_status('A-1', 'desconhecido')
        self.assertEqual(s.buscar('A-1').status, 'aberta')
        s.atualizar_status('A-1', 'em análise', '2026-11-19', 'Revisão simulada')
        self.assertEqual(s.historico()[0].ocorrencia_id, 'A-1')

    def test_fifo_e_lifo_sem_banco(self):
        s = self.servico()
        primeiro = s.fila()[0].id
        self.assertEqual(s.examinar_proxima('2026-11-18').id, primeiro)
        self.assertNotIn(primeiro, [i.id for i in s.fila()])
        self.assertEqual(s.historico()[0].ocorrencia_id, primeiro)

    def test_json_persiste_e_erro_nao_grava_alteracao_parcial(self):
        with TemporaryDirectory() as pasta:
            arquivo = Path(pasta) / 'estado.json'
            s = self.servico(arquivo)
            s.cadastrar('A-1', 'limpeza', 'Teste', 'Bairro', '2026-11-18')
            anterior = arquivo.read_bytes()
            with self.assertRaises(ValidacaoErro):
                s.atualizar_status('A-1', 'em análise', '2026-10-01')
            self.assertEqual(arquivo.read_bytes(), anterior)
            self.assertEqual(self.servico(arquivo).buscar('A-1').status, 'aberta')

    def test_json_corrompido_e_preservado(self):
        with TemporaryDirectory() as pasta:
            arquivo = Path(pasta) / 'estado.json'
            arquivo.write_text('{ inválido', encoding='utf-8')
            with self.assertRaisesRegex(ValidacaoErro, 'arquivo de estado'):
                self.servico(arquivo)
            self.assertEqual(arquivo.read_text(encoding='utf-8'), '{ inválido')

    def test_entrada_funciona_fora_da_pasta_sem_dependencias(self):
        with TemporaryDirectory() as pasta:
            r = subprocess.run([sys.executable, '-S', str(RAIZ / 'src/sistema.py')], cwd=pasta,
                               input='8\n10\n0\n', text=True, capture_output=True, timeout=20)
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertIn('Tempo médio de conclusão: 5.33 dias.', r.stdout)
            self.assertIn('OC-013', r.stdout)
            self.assertNotIn('Traceback', r.stdout)

    def test_entrada_nao_importa_sqlite_fastapi_ou_supabase(self):
        r = subprocess.run([sys.executable, '-S', '-c',
                            "import runpy,sys; runpy.run_path('src/sistema.py'); assert not any(n in sys.modules for n in ['sqlite3','fastapi','supabase'])"],
                           cwd=RAIZ, text=True, capture_output=True)
        self.assertEqual(r.returncode, 0, r.stderr)
