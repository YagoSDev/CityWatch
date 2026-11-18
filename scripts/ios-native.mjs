import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
const env = { ...process.env };
try {
  const gemBin = join(execFileSync('ruby', ['-e', 'print Gem.user_dir'], { encoding: 'utf8' }).trim(), 'bin');
  if (existsSync(join(gemBin, 'pod'))) env.PATH = `${gemBin}:${env.PATH}`;
  // CocoaPods com ActiveSupport 6 no Ruby fornecido pelo macOS necessita logger explícito.
  env.RUBYOPT = [env.RUBYOPT, '-rlogger'].filter(Boolean).join(' ');
} catch { /* O Expo informa como instalar Ruby/CocoaPods se estiverem ausentes. */ }
const child = spawn('npx', ['expo', 'run:ios', ...process.argv.slice(2)], { stdio: 'inherit', env });
child.on('exit', code => { process.exitCode = code ?? 1; });
