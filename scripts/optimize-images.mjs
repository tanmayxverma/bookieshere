import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const psScript = path.join(__dirname, 'optimize-icons.ps1');

try {
  console.log('Generating optimized icons...');
  execSync(`powershell -ExecutionPolicy Bypass -File "${psScript}"`, { stdio: 'inherit' });
  console.log('Icon optimization completed successfully.');
} catch (err) {
  console.error('Failed to run icon optimization script:', err);
  process.exit(1);
}
