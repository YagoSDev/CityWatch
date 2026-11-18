"""Persistência acadêmica em memória/JSON, sem banco e sem serviços externos."""
from contextlib import contextmanager
from copy import deepcopy
import json
from pathlib import Path
from threading import RLock

from .dados_iniciais import PASTA_DADOS, carregar_dados
from .validacoes import ValidacaoErro


class ArmazenamentoArquivo:
    def __init__(self, caminho: Path | None = None, pasta_dados: Path = PASTA_DADOS):
        self.caminho = caminho
        self.trava = RLock()
        if caminho is not None and caminho.exists():
            try:
                self.dados = json.loads(caminho.read_text(encoding="utf-8"))
                if not isinstance(self.dados, dict) or any(
                    not isinstance(self.dados.get(chave), list)
                    for chave in ("ocorrencias", "historico", "avisos")
                ):
                    raise ValueError("Formato do estado inválido")
            except (ValueError, OSError) as erro:
                raise ValidacaoErro("Não foi possível ler o arquivo de estado. Preserve-o e escolha outro caminho ou confira o JSON.") from erro
        else:
            self.dados = carregar_dados(pasta_dados)

    @contextmanager
    def transacao(self, escrita: bool = False):
        # Uma cópia impede que uma operação rejeitada modifique o estado válido.
        with self.trava:
            copia = deepcopy(self.dados)
            yield copia
            if escrita:
                if self.caminho is not None:
                    self.caminho.parent.mkdir(parents=True, exist_ok=True)
                    temporario = self.caminho.with_suffix(self.caminho.suffix + ".tmp")
                    try:
                        temporario.write_text(json.dumps(copia, ensure_ascii=False, indent=2), encoding="utf-8")
                        temporario.replace(self.caminho)
                    finally:
                        temporario.unlink(missing_ok=True)
                self.dados = copia
