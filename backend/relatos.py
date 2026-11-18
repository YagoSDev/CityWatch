"""Cadastro cidadão: metadados privados e evidências não entram nas consultas públicas."""
import base64
import binascii
import hashlib
import json
from dataclasses import asdict
from datetime import datetime, timezone
from uuid import uuid4

from .modelos import Ocorrencia
from .validacoes import ValidacaoErro

TIPOS = {
    "acidente": "acessibilidade", "perigo": "conservação",
    "danos_urbanos": "conservação", "limpeza": "limpeza",
    "alagamento": "conservação", "outros": "conservação",
    "iluminacao": "iluminação", "acessibilidade": "acessibilidade",
}
ETIQUETAS = {
    "transito_acidente", "transito_obstrucao", "transito_sinalizacao",
    "seguranca_risco", "seguranca_area_atencao", "clima_alagamento", "clima_chuva",
    "urbano_iluminacao", "urbano_lixo", "urbano_calcada", "urbano_buraco",
    "acesso_rampa", "acesso_piso_tatil", "acesso_passagem",
}
LIMITE_ANEXO = 8 * 1024 * 1024


def validar_anexo(anexo):
    if anexo is None:
        return None
    try:
        conteudo = base64.b64decode(anexo["base64"], validate=True)
    except (ValueError, binascii.Error, KeyError) as erro:
        raise ValidacaoErro("Evidência inválida. Selecione o arquivo novamente.") from erro
    if not conteudo or len(conteudo) > LIMITE_ANEXO:
        raise ValidacaoErro("A evidência deve ter entre 1 byte e 8 MB.")
    mime = anexo["mime"]
    imagem = ((mime == "image/jpeg" and conteudo.startswith(b"\xff\xd8\xff")) or
              (mime == "image/png" and conteudo.startswith(b"\x89PNG\r\n\x1a\n")))
    marcas = conteudo[8:32]
    heic = mime in ("image/heic", "image/heif") and any(m in marcas for m in (b"heic", b"heix", b"mif1"))
    video = mime in ("video/mp4", "video/quicktime") and any(m in marcas for m in (b"isom", b"mp4", b"avc1", b"qt  ", b"M4V "))
    if not (imagem or (conteudo[4:8] == b"ftyp" and (heic or video))):
        raise ValidacaoErro("Formato da evidência incompatível. Use JPEG, PNG, HEIC, MP4 ou MOV.")
    return (mime, conteudo)


def publicar(servico, entrada):
    entrada = {"referencia": "", **entrada}
    tipo = entrada["tipo"]
    descricao = entrada["descricao"].strip()
    gps = entrada.get("localizacao")
    local = entrada["localidade"].strip() or ("Localização por GPS" if gps else "")
    bairro = entrada["bairro"].strip() or ("Localização por GPS" if gps else local)
    etiquetas = entrada["etiquetas"]
    if tipo not in TIPOS:
        raise ValidacaoErro("Selecione um tipo de ocorrência válido.")
    if not descricao or len(descricao) > 300:
        raise ValidacaoErro("A descrição deve ter entre 1 e 300 caracteres.")
    if not local and not gps:
        raise ValidacaoErro("Informe e revise a localização antes de publicar.")
    if len(etiquetas) > 5 or len(set(etiquetas)) != len(etiquetas) or not set(etiquetas) <= ETIQUETAS:
        raise ValidacaoErro("Escolha até cinco etiquetas válidas, sem duplicações.")
    anexo = validar_anexo(entrada.get("anexo"))
    fingerprint = hashlib.sha256(json.dumps(entrada, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    with servico.armazenamento.transacao_com_conexao(escrita=True) as (dados, conexao):
        relatos = dados.setdefault("relatos", {})
        anterior = next((registro for registro in relatos.values() if registro["chave"] == entrada["chave"]), None)
        if anterior:
            if anterior["fingerprint"] != fingerprint:
                raise ValidacaoErro("Esta chave já foi usada com outros dados. Inicie outro relato.")
            return asdict(servico.localizar(servico.estruturas(dados), anterior["id"]))
        estruturas = servico.estruturas(dados)
        momento = datetime.now(timezone.utc).isoformat()
        identificador = "CW-" + uuid4().hex[:16].upper()
        item = Ocorrencia(identificador, TIPOS[tipo], descricao, bairro, momento[:10], "aberta",
                          servico.proxima_ordem(estruturas), origem="cidadao", tipo=tipo,
                          etiquetas=etiquetas, publicado_em=momento, localidade=local,
                          possui_anexo=anexo is not None, referencia=entrada.get("referencia", "").strip())
        dados["ocorrencias"].append(asdict(item))
        relatos[identificador] = {"id": identificador, "chave": entrada["chave"], "fingerprint": fingerprint,
                                  "localizacao_privada": entrada.get("localizacao")}
        if anexo:
            conexao.execute("INSERT INTO evidencias (ocorrencia_id, mime, conteudo) VALUES (?, ?, ?)",
                            (identificador, *anexo))
        return asdict(item)
