import csv
from dataclasses import asdict, replace
from pathlib import Path

from .modelos import Atualizacao, Ocorrencia
from .validacoes import (
    DuplicadoErro, ValidacaoErro, id_normalizado, obrigatorio,
    validar_categoria, validar_data, validar_status,
)

PASTA_DADOS = Path(__file__).with_name("dados")


def carregar_dados(pasta: Path = PASTA_DADOS) -> dict:
    ocorrencias: dict[str, Ocorrencia] = {}
    historico: list[Atualizacao] = []
    avisos: list[dict] = []
    with (pasta / "ocorrencias.csv").open(encoding="utf-8-sig", newline="") as arquivo:
        for linha, campos in enumerate(csv.DictReader(arquivo), start=2):
            try:
                identificador = id_normalizado(campos.get("id"))
                if identificador in ocorrencias:
                    raise DuplicadoErro(f"Identificador duplicado: {identificador}.")
                item = Ocorrencia(
                    identificador, validar_categoria(campos.get("categoria")),
                    obrigatorio(campos.get("descricao"), "descrição"),
                    obrigatorio(campos.get("bairro"), "bairro"),
                    validar_data(campos.get("data")), validar_status(campos.get("status")),
                )
                ocorrencias[item.id] = item
            except ValidacaoErro as erro:
                avisos.append({"arquivo": "ocorrencias.csv", "linha": linha,
                               "id": campos.get("id"), "erro": str(erro)})

    ultimos: dict[str, Atualizacao] = {}
    with (pasta / "historico.csv").open(encoding="utf-8-sig", newline="") as arquivo:
        for linha, campos in enumerate(csv.DictReader(arquivo), start=2):
            try:
                identificador = id_normalizado(campos.get("ocorrencia_id"))
                if identificador not in ocorrencias:
                    raise ValidacaoErro("Ocorrência do histórico inexistente.")
                anterior = validar_status(campos.get("status_anterior"))
                novo = validar_status(campos.get("status_novo"))
                data = validar_data(campos.get("data"))
                ultimo = ultimos.get(identificador)
                esperado = ultimo.status_novo if ultimo else "aberta"
                inicio = ultimo.data if ultimo else ocorrencias[identificador].data
                if anterior != esperado or novo == anterior or data < inicio:
                    raise ValidacaoErro("Sequência de estados ou datas inválida no histórico.")
                evento = Atualizacao(identificador, anterior, novo, data,
                                     obrigatorio(campos.get("observacao"), "observação"))
                historico.append(evento)
                ultimos[identificador] = evento
            except ValidacaoErro as erro:
                avisos.append({"arquivo": "historico.csv", "linha": linha,
                               "id": campos.get("ocorrencia_id"), "erro": str(erro)})

    incompativeis = {item.id for item in ocorrencias.values()
                     if item.status != (ultimos[item.id].status_novo if item.id in ultimos else "aberta")}
    for identificador in sorted(incompativeis):
        avisos.append({"arquivo": "historico.csv", "linha": None, "id": identificador,
                       "erro": "O último status do histórico diverge da ocorrência. Histórico ignorado."})
    historico = sorted((evento for evento in historico if evento.ocorrencia_id not in incompativeis),
                       key=lambda evento: evento.data)
    entradas = {item.id: item.data for item in ocorrencias.values()}
    for evento in historico:
        if evento.status_novo == "aberta":
            entradas[evento.ocorrencia_id] = evento.data
    ordem = {identificador: indice for indice, identificador in enumerate(
        sorted(entradas, key=lambda identificador: (entradas[identificador], identificador)), start=1)}
    return {
        "ocorrencias": [asdict(replace(item, ordem_fila=ordem[item.id])) for item in ocorrencias.values()],
        "historico": [asdict(evento) for evento in historico],
        "avisos": avisos,
    }
