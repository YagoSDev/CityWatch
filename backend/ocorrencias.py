from dataclasses import asdict, replace
from datetime import date, datetime, timezone
from pathlib import Path

from .dados_iniciais import PASTA_DADOS
from .estruturas import Estruturas
from .indicadores import calcular
from .modelos import Atualizacao, Ocorrencia
from .validacoes import (
    DuplicadoErro, NaoEncontradaErro, ValidacaoErro, id_normalizado,
    obrigatorio, validar_categoria, validar_data, validar_status,
)


class ServicoOcorrencias:
    def __init__(self, caminho: Path | None = None, pasta_dados: Path = PASTA_DADOS, *, armazenamento=None):
        if armazenamento is None:
            from .armazenamento import Armazenamento
            self.armazenamento = Armazenamento(caminho, pasta_dados)
        else:
            self.armazenamento = armazenamento

    @staticmethod
    def estruturas(dados: dict) -> Estruturas:
        return Estruturas([Ocorrencia(**item) for item in dados["ocorrencias"]],
                          [Atualizacao(**item) for item in dados["historico"]])

    @staticmethod
    def localizar(estruturas: Estruturas, identificador: str) -> Ocorrencia:
        chave = id_normalizado(identificador)
        item = estruturas.por_id.get(chave)
        if item is None:
            raise NaoEncontradaErro(f"Ocorrência não encontrada: {chave}.")
        return item

    @staticmethod
    def proxima_ordem(estruturas: Estruturas) -> int:
        return max((item.ordem_fila for item in estruturas.ocorrencias), default=0) + 1

    def cadastrar(self, identificador: str, categoria: str, descricao: str,
                  bairro: str, data: str | None = None) -> Ocorrencia:
        item = Ocorrencia(id_normalizado(identificador), validar_categoria(categoria),
                          obrigatorio(descricao, "descrição"), obrigatorio(bairro, "bairro"),
                          validar_data(date.today().isoformat() if data is None else data), "aberta")
        with self.armazenamento.transacao(escrita=True) as dados:
            estruturas = self.estruturas(dados)
            if item.id in estruturas.por_id:
                raise DuplicadoErro(f"Identificador duplicado: {item.id}.")
            item = replace(item, ordem_fila=self.proxima_ordem(estruturas))
            estruturas.ocorrencias.append(item)
            dados["ocorrencias"] = [asdict(ocorrencia) for ocorrencia in estruturas.ocorrencias]
        return item

    def listar(self, categoria: str | None = None, status: str | None = None) -> list[Ocorrencia]:
        categoria = validar_categoria(categoria) if categoria is not None else None
        status = validar_status(status) if status is not None else None
        with self.armazenamento.transacao() as dados:
            return [item for item in self.estruturas(dados).ocorrencias
                    if (categoria is None or item.categoria == categoria)
                    and (status is None or item.status == status)]

    def buscar(self, identificador: str) -> Ocorrencia:
        with self.armazenamento.transacao() as dados:
            return self.localizar(self.estruturas(dados), identificador)

    def por_bairro(self) -> dict[str, dict[str, list[Ocorrencia]]]:
        with self.armazenamento.transacao() as dados:
            return self.estruturas(dados).por_bairro

    def fila(self) -> list[Ocorrencia]:
        with self.armazenamento.transacao() as dados:
            estruturas = self.estruturas(dados)
            return [estruturas.por_id[identificador] for identificador in estruturas.fila]

    def examinar_proxima(self, data: str | None = None) -> Ocorrencia | None:
        with self.armazenamento.transacao(escrita=True) as dados:
            estruturas = self.estruturas(dados)
            if not estruturas.fila:
                return None
            primeiro = estruturas.por_id[estruturas.fila.popleft()]
            return self.registrar_status(dados, estruturas, primeiro, "em análise", data, "Examinada na fila FIFO.")

    def atualizar_status(self, identificador: str, status: str, data: str | None = None,
                         observacao: str = "") -> Ocorrencia:
        status = validar_status(status)
        with self.armazenamento.transacao(escrita=True) as dados:
            estruturas = self.estruturas(dados)
            item = self.localizar(estruturas, identificador)
            return self.registrar_status(dados, estruturas, item, status, data, observacao)

    def registrar_status(self, dados: dict, estruturas: Estruturas, item: Ocorrencia,
                         status: str, data: str | None, observacao: str) -> Ocorrencia:
        if data is None:
            dia = datetime.now(timezone.utc).date() if item.origem == "cidadao" else date.today()
            data = dia.isoformat()
        momento = validar_data(data)
        ultima_data = next((evento.data for evento in reversed(estruturas.pilha)
                            if evento.ocorrencia_id == item.id), item.data)
        if momento < ultima_data:
            raise ValidacaoErro("A alteração não pode ser anterior ao último registro da ocorrência.")
        elif status == item.status:
            raise ValidacaoErro("A ocorrência já está nesse status.")
        else:
            ordem = self.proxima_ordem(estruturas) if status == "aberta" else item.ordem_fila
            atualizado = replace(item, status=status, ordem_fila=ordem)
        estruturas.pilha.append(Atualizacao(item.id, item.status, status, momento,
                                             observacao.strip() or "Status atualizado."))
        dados["historico"] = [asdict(evento) for evento in estruturas.pilha]
        dados["ocorrencias"] = [asdict(atualizado if registro.id == item.id else registro)
                                for registro in estruturas.ocorrencias]
        return atualizado

    def historico(self, identificador: str | None = None) -> list[Atualizacao]:
        with self.armazenamento.transacao() as dados:
            estruturas = self.estruturas(dados)
            chave = self.localizar(estruturas, identificador).id if identificador is not None else None
            return estruturas.historico_lifo(chave)

    def indicadores(self) -> dict:
        with self.armazenamento.transacao() as dados:
            resultado = calcular(self.estruturas(dados))
            resultado["origem"]["registros_rejeitados"] = len(dados["avisos"])
            return resultado

    def avisos(self) -> list[dict]:
        with self.armazenamento.transacao() as dados:
            return dados["avisos"]
