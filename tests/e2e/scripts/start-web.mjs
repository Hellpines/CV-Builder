import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

function startDev() {
  return spawn(process.execPath, [nextBin, 'dev', '--port', '3000'], {
    stdio: 'inherit',
    cwd: root,
    env: process.env,
    windowsHide: true,
  });
}

function attach(child) {
  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });

  for (const event of ['SIGINT', 'SIGTERM']) {
    process.on(event, () => child.kill(event));
  }
}

const first = startDev();

first.on('exit', (code) => {
  if (code === 1) {
    const second = startDev();
    attach(second);
    return;
  }
  process.exit(code ?? 0);
});
