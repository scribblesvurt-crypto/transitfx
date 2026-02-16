import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconDir = join(__dirname, '..', 'public', 'icon');
const svgPath = join(iconDir, '128.svg');

const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(join(iconDir, `${size}.png`));
  console.log(`Generated ${size}x${size} PNG`);
}

console.log('Done!');
