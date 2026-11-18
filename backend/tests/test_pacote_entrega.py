from pathlib import Path
import runpy
from tempfile import TemporaryDirectory
import unittest
import zipfile

RAIZ = Path(__file__).resolve().parents[2]
SCRIPT = runpy.run_path(str(RAIZ / 'scripts/preparar_entrega.py'))


class TestPacoteEntrega(unittest.TestCase):
    def test_filtro_exclui_credenciais_estado_banco_e_dependencias(self):
        permitido = SCRIPT['permitido']
        for nome in ['.env.local', '.env', 'backend/dados/citywatch.sqlite3', 'data/estado-local.json', 'node_modules/pacote/index.js', 'ios/.xcode.env.local']:
            self.assertFalse(permitido(RAIZ / nome), nome)
        for nome in ['.env.example', 'src/sistema.py', 'data/ocorrencias.csv', 'docs/uso_ia.md']:
            self.assertTrue(permitido(RAIZ / nome), nome)

    def test_links_rejeitam_incompletos_e_preservam_apenas_urls(self):
        validar = SCRIPT['validar_links']
        with self.assertRaises(ValueError):
            validar('https://github.com/YagoSDev', 'https://youtu.be/abc')
        with self.assertRaises(ValueError):
            validar('https://github.com/YagoSDev/citywatch?token=teste', 'https://youtu.be/abcdefghijk')
        repo, video = validar('https://github.com/YagoSDev/citywatch/', 'https://youtu.be/abcdefghijk?t=10')
        self.assertEqual(repo, 'https://github.com/YagoSDev/citywatch')
        self.assertEqual(video, 'https://www.youtube.com/watch?v=abcdefghijk')

    def test_pacote_limpo_executa_menu_sem_pacotes(self):
        import subprocess
        import sys
        with TemporaryDirectory() as pasta:
            destino = Path(pasta) / 'publicacao'
            quantidade, arquivo = SCRIPT['pacote'](destino)
            self.assertGreater(quantidade, 100)
            with zipfile.ZipFile(arquivo) as pacote:
                self.assertTrue(any(n.endswith('/src/sistema.py') for n in pacote.namelist()))
                self.assertFalse(any('/.env.local' in n or n.endswith('.sqlite3') or '/node_modules/' in n for n in pacote.namelist()))
            resultado = subprocess.run([sys.executable, '-S', str(destino / 'src/sistema.py')], cwd=pasta, input='8\n0\n', capture_output=True, text=True, timeout=20)
            self.assertEqual(resultado.returncode, 0, resultado.stderr)
            self.assertIn('Tempo médio de conclusão: 5.33 dias.', resultado.stdout)
