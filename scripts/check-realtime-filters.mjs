import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '..', 'src');

let failures = 0;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  // Allow admin inbox overview to observe global support queues
  const isExcluded = filePath.includes(path.join('pages', 'admin'));
  const content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('postgres_changes')) return;

  // Regex to match .on('postgres_changes', { ... }) blocks
  const regex = /\.on\(\s*['"]postgres_changes['"]\s*,\s*\{([^}]+)\}/gs;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const block = match[1];
    const hasFilter = /\bfilter\s*:/.test(block);

    if (!hasFilter && !isExcluded && !block.includes('allow-unfiltered')) {
      const relPath = path.relative(path.join(__dirname, '..'), filePath);
      console.error(`❌ [Realtime Filter Guard] Unfiltered subscription found in ${relPath}:`);
      console.error(`   ${block.replace(/\s+/g, ' ').trim()}`);
      failures++;
    }
  }
}

console.log('🔍 Checking for unfiltered postgres_changes subscriptions...');
walk(srcDir);

if (failures > 0) {
  console.error(`\n❌ Failed: ${failures} unfiltered realtime subscription(s) detected.`);
  console.error('All client postgres_changes subscriptions must specify a `filter:` clause to prevent Supabase quota exhaustion.');
  process.exit(1);
} else {
  console.log('✅ All non-admin postgres_changes subscriptions are properly filtered.');
}
