from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from backend.estruturas import Estruturas
from backend.indicadores import calcular
from backend.ocorrencias import ServicoOcorrencias
from backend.validacoes import DuplicadoErro, NaoEncontradaErro, ValidacaoErro


class TestOcorrencias(unittest.TestCase):
    def setUp(self):
        pasta = self.enterContext(TemporaryDirectory())
        self.db = Path(pasta) / "teste.sqlite3"
        self.servico = ServicoOcorrencias(self.db)

    def cadastrar(self, identificador="T-1", descricao="Bueiro com resíduos"):
        return self.servico.cadastrar(identificador, "LIMPEZA", descricao, "Bairro Teste", "2026-10-20")

    def test_cadastro_valido_e_persistencia(self):
        item = self.cadastrar("t-1")
        self.assertEqual((item.id, item.status, item.categoria), ("T-1", "aberta", "limpeza"))
        self.assertEqual(ServicoOcorrencias(self.db).buscar("t-1"), item)
        self.assertEqual(self.servico.por_bairro()["Bairro Teste"]["limpeza"], [item])

    def test_cadastro_rejeita_campos_vazios(self):
        campos = ["T-1", "limpeza", "Descrição", "Bairro", "2026-10-20"]
        for indice in range(len(campos)):
            invalidos = campos.copy()
            invalidos[indice] = " "
            with self.subTest(campo=indice), self.assertRaisesRegex(ValidacaoErro, "obrigatório"):
                self.servico.cadastrar(*invalidos)
        self.assertEqual(len(self.servico.listar()), 12)

    def test_cadastro_rejeita_id_duplicado_sem_diferenciar_caixa(self):
        self.cadastrar("t-1")
        with self.assertRaisesRegex(DuplicadoErro, "duplicado"):
            self.cadastrar(" T-1 ")

    def test_cadastro_rejeita_categoria_data_e_id_invalidos(self):
        for campos in [("T-1", "drenagem", "2026-10-20"), ("T-1", "limpeza", "2026-02-30"),
                       ("T/1", "limpeza", "2026-10-20")]:
            identificador, categoria, data = campos
            with self.subTest(campos=campos), self.assertRaises(ValidacaoErro):
                self.servico.cadastrar(identificador, categoria, "Descrição", "Bairro", data)

    def test_cadastros_concorrentes_nao_duplicam_id(self):
        def tentar(_):
            try:
                self.cadastrar()
            except DuplicadoErro:
                return False
            return True
        with ThreadPoolExecutor(max_workers=2) as tarefas:
            self.assertEqual(sorted(tarefas.map(tentar, range(2))), [False, True])

    def test_busca_por_id(self):
        self.assertEqual(self.servico.buscar(" oc-004 ").bairro, "Bairro Norte")
        with self.assertRaises(NaoEncontradaErro):
            self.servico.buscar("OC-999")

    def test_filtros_por_categoria_status_e_combinacao(self):
        self.assertEqual(len(self.servico.listar(categoria="iluminacao")), 3)
        self.assertEqual(len(self.servico.listar(status="em analise")), 4)
        self.assertEqual([item.id for item in self.servico.listar("limpeza", "em análise")], ["OC-007"])
        self.assertEqual(self.servico.listar("limpeza", "concluída"), [])

    def test_atualizacao_valida_e_persistida(self):
        item = self.servico.atualizar_status("OC-003", "concluida", "2026-10-20", "Resolvido")
        self.assertEqual(item.status, "concluída")
        self.assertEqual(ServicoOcorrencias(self.db).buscar("OC-003").status, "concluída")
        self.assertEqual(self.servico.historico("OC-003")[0].observacao, "Resolvido")

    def test_status_desconhecido_repetido_e_data_anterior(self):
        for status, data in [("desconhecido", "2026-10-20"), ("aberta", "2026-10-20"),
                             ("em análise", "2026-09-30")]:
            with self.subTest(status=status, data=data), self.assertRaises(ValidacaoErro):
                self.servico.atualizar_status("OC-003", status, data)
        self.assertEqual(self.servico.buscar("OC-003").status, "aberta")
        self.assertEqual(self.servico.historico("OC-003"), [])

    def test_fifo_ordem_triagem_e_reabertura_no_final(self):
        iniciais = ["OC-003", "OC-005", "OC-008", "OC-010", "OC-011"]
        self.assertEqual([item.id for item in self.servico.fila()], iniciais)
        novo = self.cadastrar()
        primeiro = self.servico.examinar_proxima("2026-10-20")
        self.assertEqual((primeiro.id, primeiro.status), ("OC-003", "em análise"))
        self.servico.atualizar_status("OC-003", "aberta", "2026-10-21")
        self.assertEqual([item.id for item in self.servico.fila()], iniciais[1:] + [novo.id, "OC-003"])

    def test_fila_vazia(self):
        for _ in range(5):
            self.servico.examinar_proxima("2026-10-20")
        self.assertIsNone(self.servico.examinar_proxima("2026-10-20"))

    def test_historico_lifo_e_filtro_por_id(self):
        self.assertEqual(len(self.servico.historico()), 10)
        self.servico.atualizar_status("OC-003", "em análise", "2026-10-20")
        self.servico.atualizar_status("OC-003", "concluída", "2026-10-20")
        historico = self.servico.historico("OC-003")
        self.assertEqual([evento.status_novo for evento in historico], ["concluída", "em análise"])
        self.assertEqual(self.servico.historico()[:2], historico)

    def test_indicadores_com_dados_de_origem_e_matriz(self):
        resultado = self.servico.indicadores()
        self.assertEqual((resultado["total"], resultado["pendencias"]), (12, 9))
        self.assertEqual(resultado["por_categoria"]["limpeza"], {"quantidade": 3, "percentual": 25.0})
        self.assertEqual(resultado["por_status"]["aberta"], {"quantidade": 5, "percentual": 41.67})
        self.assertEqual(resultado["matriz"]["valores"], [[1, 1, 1], [1, 1, 1], [2, 1, 0], [1, 1, 1]])
        self.assertEqual(resultado["tempo_medio_conclusao_dias"], 5.33)
        self.assertEqual([item["dias"] for item in resultado["origem"]["duracoes_concluidas"]], [4, 6, 6])

    def test_indicador_vazio_sem_divisao_por_zero(self):
        relatorio = calcular(Estruturas([], []))
        self.assertIsNone(relatorio["tempo_medio_conclusao_dias"])
        self.assertEqual(relatorio["por_categoria"]["limpeza"]["percentual"], 0)

    def test_csv_rejeita_e_exibe_o_registro_inconsistente(self):
        aviso, = self.servico.avisos()
        self.assertEqual((aviso["arquivo"], aviso["linha"], aviso["id"]), ("ocorrencias.csv", 14, "OC-013"))
        self.assertIn("descrição", aviso["erro"])
        with self.assertRaises(NaoEncontradaErro):
            self.servico.buscar("OC-013")
