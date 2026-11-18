from dataclasses import dataclass, field

CATEGORIAS = ("iluminação", "acessibilidade", "limpeza", "conservação")
STATUS = ("aberta", "em análise", "concluída")


@dataclass(frozen=True)
class Ocorrencia:
    id: str
    categoria: str
    descricao: str
    bairro: str
    data: str
    status: str
    ordem_fila: int = 0
    origem: str = "simulado"
    tipo: str | None = None
    etiquetas: list[str] = field(default_factory=list)
    publicado_em: str | None = None
    localidade: str | None = None
    possui_anexo: bool = False
    referencia: str = ""


@dataclass(frozen=True)
class Atualizacao:
    ocorrencia_id: str
    status_anterior: str
    status_novo: str
    data: str
    observacao: str
