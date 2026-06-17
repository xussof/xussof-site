import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync('public/og-image.svg');
await sharp(svg, { density: 150 })
  .resize(1200, 630)
  .png()
  .toFile('public/og-image.png');
console.log('Generated public/og-image.png (1200x630)');
