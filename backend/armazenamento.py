from contextlib import contextmanager
import json
import os
from pathlib import Path
import sqlite3

from .dados_iniciais import PASTA_DADOS, carregar_dados


def caminho_banco() -> Path:
    padrao = PASTA_DADOS / "citywatch.sqlite3"
    return Path(os.environ.get("CITYWATCH_DB", padrao)).expanduser()


class Armazenamento:
    """Mantém a lista e a pilha em um snapshot transacional para este conjunto pequeno."""

    erros = (sqlite3.Error,)

    def __init__(self, caminho: Path | None = None, pasta_dados: Path = PASTA_DADOS):
        self.caminho = caminho if caminho is not None else caminho_banco()
        self.caminho.parent.mkdir(parents=True, exist_ok=True)
        with self.conexao() as conexao:
            conexao.execute("BEGIN IMMEDIATE")
            conexao.execute(
                "CREATE TABLE IF NOT EXISTS estado (id INTEGER PRIMARY KEY CHECK (id = 1), dados TEXT NOT NULL)"
            )
            conexao.execute("CREATE TABLE IF NOT EXISTS evidencias (ocorrencia_id TEXT PRIMARY KEY, mime TEXT NOT NULL, conteudo BLOB NOT NULL)")
            if conexao.execute("SELECT 1 FROM estado WHERE id = 1").fetchone() is None:
                dados = json.dumps(carregar_dados(pasta_dados), ensure_ascii=False)
                conexao.execute("INSERT INTO estado VALUES (1, ?)", (dados,))

    @contextmanager
    def conexao(self):
        conexao = sqlite3.connect(self.caminho, timeout=10)
        try:
            with conexao:
                yield conexao
        finally:
            conexao.close()

    @contextmanager
    def transacao_com_conexao(self, escrita: bool = False):
        with self.conexao() as conexao:
            conexao.execute("BEGIN IMMEDIATE" if escrita else "BEGIN")
            conteudo = conexao.execute("SELECT dados FROM estado WHERE id = 1").fetchone()[0]
            dados = json.loads(conteudo)
            yield dados, conexao
            if escrita:
                conexao.execute("UPDATE estado SET dados = ? WHERE id = 1",
                                (json.dumps(dados, ensure_ascii=False),))

    @contextmanager
    def transacao(self, escrita: bool = False):
        with self.transacao_com_conexao(escrita) as (dados, _):
            yield dados
