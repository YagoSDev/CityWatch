import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const children = [];
function launch(command, args, options = {}) {
  const child = spawn(command, args, { stdio: 'inherit', ...options });
  children.push(child);
  return child;
}
function close(code = 0) {
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
  process.exitCode = code;
}
process.on('SIGINT', () => close());
process.on('SIGTERM', () => close());
async function status() {
  try {
    const response = await fetch('http://127.0.0.1:8000/health', { signal: AbortSignal.timeout(1000) });
    if (!response.ok || (await response.json()).origem !== 'citywatch-python') throw new Error('foreign');
    return true;
  } catch (error) {
    if (error.message === 'foreign') throw new Error('A porta 8000 está ocupada por outro servidor. Libere-a antes de iniciar o CityWatch.');
    return false;
  }
}
try {
  if (!(await status())) {
    const python = resolve('.venv/bin/python');
    if (!existsSync(python)) throw new Error('Prepare o ambiente Python seguindo backend/README.md antes de iniciar.');
    const backend = launch(python, ['-m', 'uvicorn', 'backend.api:app', '--host', '0.0.0.0', '--port', '8000']);
    let ready = false;
    for (let attempt = 0; attempt < 30 && backend.exitCode === null; attempt++) {
      await new Promise(done => setTimeout(done, 250));
      if (await status()) { ready = true; break; }
    }
    if (!ready) throw new Error('Não foi possível iniciar o backend Python. Confira o erro acima.');
  }
  console.log('CityWatch Python pronto. Mantenha o iPhone e o Mac na mesma rede Wi-Fi.');
  const metro = launch('npx', ['expo', 'start', '--lan', '--go', ...process.argv.slice(2)]);
  metro.on('exit', code => close(code ?? 0));
} catch (error) { console.error(error.message); close(1); }
