const fs = require('fs');
const path = require('path');

function loadEnv(file = '.env') {
  if (!fs.existsSync(file)) {
    console.warn('⚠️  No .env file found — building with placeholders.');
    return {};
  }
  const env = {};
  fs.readFileSync(file, 'utf8').split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const i = line.indexOf('=');
    if (i === -1) return;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  });
  return env;
}

const env = loadEnv();
const src = fs.readFileSync('index.html', 'utf8');

const output = src
  .replace(/__EMAILJS_PUBLIC_KEY__/g,  env.EMAILJS_PUBLIC_KEY  || '__EMAILJS_PUBLIC_KEY__')
  .replace(/__EMAILJS_SERVICE_ID__/g,  env.EMAILJS_SERVICE_ID  || '__EMAILJS_SERVICE_ID__')
  .replace(/__EMAILJS_TEMPLATE_ID__/g, env.EMAILJS_TEMPLATE_ID || '__EMAILJS_TEMPLATE_ID__');

if (!fs.existsSync('dist')) fs.mkdirSync('dist');

/* Copy assets folder into dist so images work */
function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(name => {
    const s = path.join(from, name);
    const d = path.join(to, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  });
}
copyDir('assets', 'dist/assets');

fs.writeFileSync('dist/index.html', output);

console.log('✅ Built dist/index.html');
console.log('   Public key:', (env.EMAILJS_PUBLIC_KEY || '(missing)').slice(0, 8) + '…');
console.log('   Service ID:', env.EMAILJS_SERVICE_ID || '(missing)');
console.log('   Template ID:', env.EMAILJS_TEMPLATE_ID || '(missing)');