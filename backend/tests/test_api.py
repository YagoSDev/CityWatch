from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from fastapi.testclient import TestClient

from backend.api import criar_app


class TestAPI(unittest.TestCase):
    def setUp(self):
        pasta = self.enterContext(TemporaryDirectory())
        self.client = self.enterContext(TestClient(criar_app(Path(pasta) / "teste.sqlite3")))

    def test_leitura_filtros_hierarquia_e_avisos(self):
        self.assertEqual(self.client.get("/health").json()["origem"], "citywatch-python")
        self.assertEqual(len(self.client.get("/ocorrencias").json()), 12)
        resposta = self.client.get("/ocorrencias", params={"categoria": "limpeza", "status": "em análise"})
        self.assertEqual([item["id"] for item in resposta.json()], ["OC-007"])
        self.assertEqual(self.client.get("/ocorrencias/oc-004").json()["bairro"], "Bairro Norte")
        self.assertEqual(self.client.get("/ocorrencias/OC-013").status_code, 404)
        norte = self.client.get("/bairros").json()["Bairro Norte"]
        self.assertEqual(norte["iluminação"][0]["id"], "OC-001")
        self.assertEqual(self.client.get("/validacao").json()[0]["id"], "OC-013")

    def test_cadastro_atualizacao_historico_e_indicadores(self):
        dados = {"id": "T-1", "categoria": "limpeza", "descricao": "Resíduo em via",
                 "bairro": "Bairro Teste", "data": "2026-10-20"}
        self.assertEqual(self.client.post("/ocorrencias", json=dados).status_code, 201)
        self.assertEqual(self.client.post("/ocorrencias", json=dados).status_code, 409)
        alteracao = {"status": "concluída", "data": "2026-10-24", "observacao": "Limpeza simulada"}
        resposta = self.client.patch("/ocorrencias/T-1/status", json=alteracao)
        self.assertEqual(resposta.json()["status"], "concluída")
        historico = self.client.get("/historico", params={"identificador": "T-1"}).json()
        self.assertEqual(historico[0]["observacao"], "Limpeza simulada")
        relatorio = self.client.get("/indicadores").json()
        self.assertEqual(relatorio["total"], 13)
        self.assertEqual(relatorio["tempo_medio_conclusao_dias"], 5.0)

    def test_erro_de_campos_e_status_desconhecido(self):
        resposta = self.client.post("/ocorrencias", json={"id": "T-1"})
        self.assertEqual(resposta.status_code, 422)
        self.assertIn("Campo obrigatório ausente: descrição", resposta.json()["detail"])
        resposta = self.client.patch("/ocorrencias/OC-003/status", json={"status": "aprovada"})
        self.assertEqual(resposta.status_code, 422)
        self.assertIn("desconhecido", resposta.json()["detail"])

    def test_examina_fifo_e_registra_no_topo_do_historico(self):
        fila = self.client.get("/fila").json()
        examinada = self.client.post("/fila/examinar", params={"data": "2026-10-20"}).json()
        self.assertEqual(examinada["id"], fila[0]["id"])
        self.assertEqual(examinada["status"], "em análise")
        self.assertEqual(self.client.get("/fila").json(), fila[1:])
        self.assertEqual(self.client.get("/historico").json()[0]["ocorrencia_id"], examinada["id"])
