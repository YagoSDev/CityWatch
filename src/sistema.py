"""Entrada acadêmica: python src/sistema.py (somente biblioteca padrão)."""
import argparse
from pathlib import Path
import sys

# Permite executar a partir de qualquer diretório, sem instalar o projeto.
RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ))

from backend.armazenamento_arquivo import ArmazenamentoArquivo
from backend.main import menu
from backend.ocorrencias import ServicoOcorrencias
from backend.validacoes import ValidacaoErro


def main():
    parser = argparse.ArgumentParser(description="CityWatch acadêmico: CSV, estruturas e menu Python local")
    parser.add_argument("--estado", type=Path, help="JSON opcional para persistir alterações. Sem ele, usa apenas memória.")
    parser.add_argument("--dados", type=Path, default=RAIZ / "data", help="pasta com ocorrencias.csv e historico.csv")
    args = parser.parse_args()
    try:
        armazenamento = ArmazenamentoArquivo(args.estado, args.dados)
        servico = ServicoOcorrencias(armazenamento=armazenamento)
        print("Modo acadêmico · dados simulados · sem banco, API, conta ou rede.")
        print("Alterações em memória nesta sessão." if args.estado is None else f"Persistência local: {args.estado}")
        menu(servico)
    except (ValidacaoErro, OSError, ValueError, TypeError, KeyError) as erro:
        print(f"Erro ao executar o sistema acadêmico: {erro}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
