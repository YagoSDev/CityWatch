"""Executa uma demonstração real do menu com dados fictícios, sem tocar no banco do app."""
from pathlib import Path
import subprocess
import sys

RAIZ = Path(__file__).resolve().parents[1]
ENTRADAS = [
    '8', '10', '3', 'OC-007', '4', 'limpeza', 'em análise',
    '1', 'DEMO-014', 'iluminação', 'Poste apagado próximo à praça fictícia', 'Bairro Norte', '2026-10-20',
    '3', 'DEMO-014',
    '5', 'DEMO-014', 'em análise', '2026-10-21', 'Exame comunitário simulado',
    '6', 'DEMO-014',
    '5', 'DEMO-014', 'resolvida',
    '7', 'n', '9', '8', '0', '',
]


def main():
    resultado = subprocess.run([sys.executable, '-S', str(RAIZ / 'src/sistema.py')],
                               input='\n'.join(ENTRADAS), text=True, capture_output=True, cwd=RAIZ, timeout=30)
    if resultado.returncode or 'Traceback' in resultado.stdout + resultado.stderr:
        raise RuntimeError(resultado.stderr or resultado.stdout)
    for esperado in ['Ocorrência cadastrada.', 'Status atualizado.', 'DEMO-014 | iluminação',
                     'Status desconhecido(a)', 'Tempo médio de conclusão: 5.33 dias.', 'OC-013']:
        if esperado not in resultado.stdout:
            raise RuntimeError(f'Demonstração não produziu a evidência esperada: {esperado}')
    destino = RAIZ / 'docs/evidencias/menu-demonstracao.txt'
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text('TRANSCRIÇÃO REAL DO MENU — DADOS SIMULADOS\n'
                       'Gerada por scripts/demonstracao_academica.py; nenhum banco do aplicativo foi alterado.\n'
                       'Entradas usadas: ver ENTRADAS no script e docs/roteiro_video.md.\n\n'
                       + resultado.stdout, encoding='utf-8')
    print(f'Demonstração concluída sem erros não tratados: {destino.relative_to(RAIZ)}')


if __name__ == '__main__':
    main()
