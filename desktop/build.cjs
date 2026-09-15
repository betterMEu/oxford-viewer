const { buildSync } = require('esbuild');
const { mkdirSync, copyFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, '../dist/desktop');
mkdirSync(output, { recursive: true });
buildSync({ entryPoints: [path.join(__dirname, 'scripts.ts')], bundle: true,
  platform: 'node', format: 'cjs', outfile: path.join(output, 'scripts.cjs') });
for (const file of ['main.cjs', 'preload.cjs', 'shell-preload.cjs', 'index.html', 'shell.js', 'shell.css', 'smoke.cjs']) {
  copyFileSync(path.join(__dirname, file), path.join(output, file));
}
writeFileSync(path.join(output, 'package.json'), JSON.stringify({
  name: 'oxford-viewer-desktop', productName: 'Oxford Viewer',
  version: require('../package.json').version, main: 'main.cjs',
}));
