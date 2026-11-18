from contextlib import asynccontextmanager
from dataclasses import asdict
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict, AwareDatetime
from typing import Literal
from .relatos import publicar

from .ocorrencias import ServicoOcorrencias
from .validacoes import DuplicadoErro, NaoEncontradaErro, ValidacaoErro


class Cadastro(BaseModel):
    id: str
    categoria: str
    descricao: str
    bairro: str
    data: str | None = None


class LocalizacaoPrivada(BaseModel):
    model_config = ConfigDict(extra="forbid")
    latitude: float = Field(ge=-90, le=90, allow_inf_nan=False)
    longitude: float = Field(ge=-180, le=180, allow_inf_nan=False)
    precisao: float | None = Field(default=None, ge=0, allow_inf_nan=False)
    capturada_em: AwareDatetime


class Evidencia(BaseModel):
    model_config = ConfigDict(extra="forbid")
    mime: Literal["image/jpeg", "image/png", "image/heic", "image/heif", "video/mp4", "video/quicktime"]
    base64: str = Field(max_length=11184812)


class RelatoCidadao(BaseModel):
    model_config = ConfigDict(extra="forbid")
    chave: str = Field(min_length=16, max_length=80)
    tipo: str = Field(max_length=40)
    descricao: str = Field(max_length=300)
    localidade: str = Field(default="", max_length=200)
    referencia: str = Field(default="", max_length=200)
    bairro: str = Field(default="", max_length=120)
    etiquetas: list[str] = Field(default_factory=list, max_length=5)
    localizacao: LocalizacaoPrivada | None = None
    anexo: Evidencia | None = None


class MudancaStatus(BaseModel):
    status: str
    data: str | None = None
    observacao: str = ""


def ficha(item):
    dados = asdict(item)
    del dados["ordem_fila"]
    return dados


def criar_app(caminho: Path | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app):
        app.state.servico = ServicoOcorrencias(caminho)
        yield

    app = FastAPI(title="CityWatch • Ocorrências acadêmicas", version="1.0.0", lifespan=lifespan)

    @app.exception_handler(ValidacaoErro)
    async def erro_de_dominio(_request: Request, erro: ValidacaoErro):
        if isinstance(erro, NaoEncontradaErro):
            codigo = 404
        elif isinstance(erro, DuplicadoErro):
            codigo = 409
        else:
            codigo = 422
        return JSONResponse({"detail": str(erro)}, status_code=codigo)

    @app.exception_handler(RequestValidationError)
    async def erro_de_requisicao(_request: Request, erro: RequestValidationError):
        campos = {"id": "identificador", "descricao": "descrição", "observacao": "observação"}
        mensagens = []
        for item in erro.errors():
            campo = item["loc"][-1]
            if item["type"] == "json_invalid":
                mensagens.append("O corpo da requisição deve ser um JSON válido.")
            elif item["type"] == "missing":
                mensagens.append(f"Campo obrigatório ausente: {campos.get(campo, campo)}.")
            else:
                mensagens.append(f"Valor inválido para {campos.get(campo, campo)}.")
        return JSONResponse({"detail": " ".join(mensagens)}, status_code=422)

    @app.get("/health")
    def saude():
        return {"status": "ok", "origem": "citywatch-python"}

    @app.post("/relatos", status_code=201)
    def publicar_relato(dados: RelatoCidadao):
        resultado = publicar(app.state.servico, dados.model_dump(mode="json"))
        resultado.pop("ordem_fila", None)
        return resultado

    @app.get("/ocorrencias")
    def listar(categoria: str | None = None, status: str | None = None):
        return [ficha(item) for item in app.state.servico.listar(categoria, status)]

    @app.post("/ocorrencias", status_code=201)
    def cadastrar(dados: Cadastro):
        return ficha(app.state.servico.cadastrar(dados.id, dados.categoria, dados.descricao, dados.bairro, dados.data))

    @app.get("/ocorrencias/{identificador}")
    def buscar(identificador: str):
        return ficha(app.state.servico.buscar(identificador))

    @app.patch("/ocorrencias/{identificador}/status")
    def atualizar(identificador: str, dados: MudancaStatus):
        return ficha(app.state.servico.atualizar_status(identificador, dados.status, dados.data, dados.observacao))

    @app.get("/historico")
    def historico(identificador: str | None = None):
        return app.state.servico.historico(identificador)

    @app.get("/bairros")
    def bairros():
        return {
            bairro: {categoria: [ficha(item) for item in itens] for categoria, itens in categorias.items()}
            for bairro, categorias in app.state.servico.por_bairro().items()
        }

    @app.get("/fila")
    def fila():
        return [ficha(item) for item in app.state.servico.fila()]

    @app.post("/fila/examinar")
    def examinar(data: str | None = None):
        item = app.state.servico.examinar_proxima(data)
        if item is None:
            raise NaoEncontradaErro("Não há ocorrências abertas na fila.")
        return ficha(item)

    @app.get("/indicadores")
    def indicadores():
        return app.state.servico.indicadores()

    @app.get("/validacao")
    def avisos():
        return app.state.servico.avisos()

    return app


app = criar_app()
