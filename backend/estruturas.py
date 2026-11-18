from collections import deque

from .modelos import CATEGORIAS, STATUS, Atualizacao, Ocorrencia


class Estruturas:
    def __init__(self, ocorrencias: list[Ocorrencia], atualizacoes: list[Atualizacao]):
        self.ocorrencias = ocorrencias
        self.por_id = {item.id: item for item in ocorrencias}
        self.fila: deque[str] = deque(
            item.id for item in sorted(ocorrencias, key=lambda item: item.ordem_fila)
            if item.status == "aberta"
        )
        self.pilha = atualizacoes
        self.por_bairro: dict[str, dict[str, list[Ocorrencia]]] = {}
        self.matriz = [[0 for _ in STATUS] for _ in CATEGORIAS]

        for item in ocorrencias:
            categorias = self.por_bairro.setdefault(item.bairro, {})
            categorias.setdefault(item.categoria, []).append(item)
            self.matriz[CATEGORIAS.index(item.categoria)][STATUS.index(item.status)] += 1

    def historico_lifo(self, identificador: str | None = None) -> list[Atualizacao]:
        pilha = self.pilha.copy()
        resultado = []
        while pilha:
            evento = pilha.pop()
            if identificador is None or evento.ocorrencia_id == identificador:
                resultado.append(evento)
        return resultado
