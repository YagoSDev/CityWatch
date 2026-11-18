from datetime import date

from .estruturas import Estruturas
from .modelos import CATEGORIAS, STATUS


def calcular(estruturas: Estruturas) -> dict:
    total = len(estruturas.ocorrencias)

    def distribuicao(rotulos, quantidades):
        return {nome: {"quantidade": quantidade, "percentual": round(100 * quantidade / total, 2) if total else 0}
                for nome, quantidade in zip(rotulos, quantidades)}

    categorias = distribuicao(CATEGORIAS, [sum(linha) for linha in estruturas.matriz])
    status = distribuicao(STATUS, [sum(linha[coluna] for linha in estruturas.matriz)
                                  for coluna in range(len(STATUS))])
    pendencias = status["aberta"]["quantidade"] + status["em análise"]["quantidade"]

    conclusoes = {}
    for evento in estruturas.historico_lifo():
        if evento.status_novo == "concluída":
            conclusoes.setdefault(evento.ocorrencia_id, evento.data)
    duracoes = []
    for item in estruturas.ocorrencias:
        if item.status == "concluída" and item.id in conclusoes:
            fim = conclusoes[item.id]
            dias = (date.fromisoformat(fim) - date.fromisoformat(item.data)).days
            duracoes.append({"id": item.id, "abertura": item.data, "conclusao": fim, "dias": dias})
    media = round(sum(item["dias"] for item in duracoes) / len(duracoes), 2) if duracoes else None
    if not total:
        interpretacao = "Ainda não há ocorrências para interpretar."
    elif pendencias > total / 2:
        interpretacao = f"A maioria dos registros permanece pendente ({pendencias} de {total})."
    else:
        interpretacao = f"Até metade dos registros permanece pendente ({pendencias} de {total})."
    return {
        "total": total, "por_categoria": categorias, "por_status": status,
        "pendencias": pendencias, "tempo_medio_conclusao_dias": media,
        "matriz": {"categorias": list(CATEGORIAS), "status": list(STATUS), "valores": estruturas.matriz},
        "origem": {"registros_validos": total, "eventos_historicos": len(estruturas.pilha),
                   "duracoes_concluidas": duracoes, "concluidas_sem_historico": status["concluída"]["quantidade"] - len(duracoes)},
        "formulas": {
            "total": "contagem dos registros válidos",
            "quantidade": "soma da linha (categoria) ou da coluna (status) na matriz",
            "percentual": "quantidade / total × 100",
            "pendencias": "ocorrências abertas + ocorrências em análise",
            "tempo_medio": "soma dos dias da abertura até a última conclusão / concluídas com histórico válido",
        },
        "interpretacao": interpretacao,
    }
