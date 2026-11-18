from datetime import date
import re
import unicodedata

from .modelos import CATEGORIAS, STATUS


class ValidacaoErro(ValueError):
    pass


class DuplicadoErro(ValidacaoErro):
    pass


class NaoEncontradaErro(ValidacaoErro):
    pass


def obrigatorio(valor: str | None, campo: str) -> str:
    if not valor or not valor.strip():
        raise ValidacaoErro(f"Campo obrigatório ausente: {campo}.")
    return valor.strip()


def id_normalizado(valor: str | None) -> str:
    identificador = obrigatorio(valor, "identificador").upper()
    if not re.fullmatch(r"[A-Z0-9_-]{1,32}", identificador):
        raise ValidacaoErro("O identificador deve ter até 32 letras, números, hífens ou sublinhados.")
    return identificador


def normalizar(valor: str) -> str:
    sem_acentos = unicodedata.normalize("NFD", valor.casefold())
    return "".join(letra for letra in sem_acentos if not unicodedata.combining(letra))


def opcao(valor: str | None, campo: str, valores: tuple[str, ...]) -> str:
    digitado = normalizar(obrigatorio(valor, campo))
    for permitido in valores:
        if digitado == normalizar(permitido):
            return permitido
    raise ValidacaoErro(f"{campo.capitalize()} desconhecido(a). Use: {', '.join(valores)}.")


def validar_categoria(valor: str | None) -> str:
    return opcao(valor, "categoria", CATEGORIAS)


def validar_status(valor: str | None) -> str:
    return opcao(valor, "status", STATUS)


def validar_data(valor: str | None) -> str:
    texto = obrigatorio(valor, "data")
    try:
        convertida = date.fromisoformat(texto)
        if convertida.isoformat() != texto:
            raise ValueError
    except ValueError as erro:
        raise ValidacaoErro("Data inválida. Use AAAA-MM-DD.") from erro
    return texto
