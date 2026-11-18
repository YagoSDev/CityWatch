"""Gera pacote publicável por lista permitida; TXT só aceita URLs reais informadas."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
from urllib.parse import urlparse, parse_qs
import zipfile

RAIZ = Path(__file__).resolve().parents[1]
PASTAS = {'src', 'backend', 'data', 'docs', 'assets', 'tests', 'scripts', 'patches', 'supabase'}
EXTENSOES = {'.py', '.ts', '.tsx', '.mjs', '.js', '.json', '.md', '.txt', '.csv', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.patch', '.sql'}
RAIZ_ARQUIVOS = {'.gitignore', '.env.example', 'README.md', 'app.json', 'package.json', 'package-lock.json', 'tsconfig.json', 'eslint.config.js'}
ARQUIVOS_EXTRAS = {'entrega/PENDENCIAS.md'}


def permitido(path: Path):
    relative = path.relative_to(RAIZ)
    if relative.as_posix() in ARQUIVOS_EXTRAS:
        return True
    if len(relative.parts) == 1:
        return relative.name in RAIZ_ARQUIVOS
    if relative.parts[0] not in PASTAS or path.suffix.lower() not in EXTENSOES:
        return False
    if any(part in {'__pycache__', 'node_modules', 'rascunhos'} for part in relative.parts):
        return False
    if relative.parts[0] == 'data' and path.name not in {'ocorrencias.csv', 'historico.csv', 'README.md'}:
        return False
    if relative.parts[:2] == ('backend', 'dados') and path.suffix not in {'.csv', '.md'}:
        return False
    return True


def validar_links(repo: str, video: str):
    r = urlparse(repo); v = urlparse(video)
    if r.scheme != 'https' or r.netloc != 'github.com' or not re.fullmatch(r'/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?', r.path) or r.query or r.fragment:
        raise ValueError('Informe o link HTTPS direto do repositório público GitHub, sem tokens ou parâmetros.')
    video_id = v.path.strip('/') if v.netloc == 'youtu.be' else parse_qs(v.query).get('v', [''])[0] if v.netloc in {'youtube.com', 'www.youtube.com'} and v.path == '/watch' else ''
    if v.scheme != 'https' or not re.fullmatch(r'[A-Za-z0-9_-]{11}', video_id):
        raise ValueError('Informe um link HTTPS válido do vídeo YouTube. Não use placeholders.')
    return repo.rstrip('/'), f'https://www.youtube.com/watch?v={video_id}'


def pacote(destino: Path):
    if destino.exists():
        raise ValueError('A pasta de saída já existe. Escolha outro destino para preservar o pacote anterior.')
    files = [RAIZ / name for name in sorted(RAIZ_ARQUIVOS | ARQUIVOS_EXTRAS) if (RAIZ / name).is_file()]
    for name in sorted(PASTAS):
        folder = RAIZ / name
        if folder.is_dir():
            files.extend(p for p in folder.rglob('*') if p.is_file() and permitido(p))
    manifest = {}
    for source in files:
        rel = source.relative_to(RAIZ)
        # Bloqueia padrões de credenciais; nunca imprime o conteúdo encontrado.
        if source.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.gif', '.webp'}:
            content = source.read_text(encoding='utf-8')
            if re.search(r'(?:sk-proj-[A-Za-z0-9_-]{20,}|sb_secret_[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)', content):
                raise ValueError(f'Possível credencial em {rel}. Revise antes de publicar.')
        target = destino / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        manifest[rel.as_posix()] = hashlib.sha256(source.read_bytes()).hexdigest()
    (destino / 'MANIFESTO.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    zip_path = destino.with_suffix('.zip')
    if zip_path.exists():
        raise ValueError('ZIP de saída já existe. Escolha outro destino.')
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(destino.rglob('*')):
            if path.is_file():
                archive.write(path, Path(destino.name) / path.relative_to(destino))
    return len(manifest), zip_path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pacote', type=Path, help='pasta nova para exportação sanitizada e ZIP')
    parser.add_argument('--repositorio', help='URL pública e direta do GitHub')
    parser.add_argument('--video', help='URL real do vídeo publicado pelo autor')
    parser.add_argument('--txt', type=Path, help='arquivo TXT novo com exatamente os dois links')
    args = parser.parse_args()
    if args.pacote:
        count, archive = pacote(args.pacote)
        print(f'Pacote preparado: {count} arquivos. ZIP: {archive}')
    if args.txt or args.repositorio or args.video:
        if not all((args.txt, args.repositorio, args.video)):
            parser.error('--txt, --repositorio e --video devem ser informados juntos; vídeo ainda pendente não gera TXT final.')
        repo, video = validar_links(args.repositorio, args.video)
        if args.txt.exists():
            parser.error('O TXT já existe. Escolha outro nome para preservar o anterior.')
        args.txt.parent.mkdir(parents=True, exist_ok=True)
        args.txt.write_text(f'{repo}\n{video}\n', encoding='utf-8')
        print('TXT gerado. Confira acesso público, visibilidade Não Listado e links antes de enviar. A validação de formato não verifica a visibilidade no YouTube.')
    if not args.pacote and not args.txt:
        parser.print_help()


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError) as error:
        raise SystemExit(f'Erro: {error}')
