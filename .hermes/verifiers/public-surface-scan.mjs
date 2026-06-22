import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const failures = [];
const globalForbidden = ['homepage / hero', 'lab / flagship card', 'signal room / episode log', 'OpenClaw'];
const primarySurfaceForbidden = ['operator stack', 'familyos', 'bishop-bench'];

function files(path) {
  const stat = statSync(path);
  if (stat.isDirectory()) return readdirSync(path).flatMap((entry) => files(join(path, entry)));
  return /\.(html|xml|css|js)$/.test(path) ? [path] : [];
}

for (const path of files(dist)) {
  const rel = path.replace(root + '/', '');
  const text = readFileSync(path, 'utf8');
  const lower = text.toLowerCase();
  for (const term of globalForbidden) {
    const haystack = term === 'OpenClaw' ? text : lower;
    const needle = term === 'OpenClaw' ? term : term.toLowerCase();
    if (haystack.includes(needle)) failures.push(`${rel}: forbidden marker '${term}'`);
  }
  const isSignalRoomEpisode = rel.startsWith('dist/signal-room/') && rel !== 'dist/signal-room/index.html';
  if (!isSignalRoomEpisode) {
    for (const term of primarySurfaceForbidden) {
      if (lower.includes(term)) failures.push(`${rel}: retired primary-surface marker '${term}'`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('public surface scan passed');
