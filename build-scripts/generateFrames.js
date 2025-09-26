// build-scripts/generateFrames.js
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const framesDir = path.join(__dirname, '../frames'); // pasta dos PNGs
const outputFile = path.join(__dirname, '../frames.js'); // arquivo gerado
const RAMP = "$@#%*+=-:. `'";
const scaleX = 0.25; // igual ao canvas /4
const scaleY = 0.1667; // igual ao canvas /6

async function imageToASCII(filePath) {
  const image = await Jimp.read(filePath);
  const w = Math.max(2, Math.floor(image.bitmap.width * scaleX));
  const h = Math.max(2, Math.floor(image.bitmap.height * scaleY));
  image.resize(w, h);

  let ascii = '';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
      const lum = 0.299*r + 0.587*g + 0.114*b;
      const idx = Math.floor((lum / 255) * (RAMP.length - 1));
      ascii += RAMP[idx];
    }
    ascii += '\n';
  }
  return ascii;
}

async function generate() {
  const files = fs.readdirSync(framesDir)
    .filter(f => f.endsWith('.png'))
    .sort(); // garante ordem

  const framesArray = [];
  for (const file of files) {
    process.stdout.write(`Processing ${file}...\r`);
    const ascii = await imageToASCII(path.join(framesDir, file));
    framesArray.push(ascii.replace(/\`/g,'\\`')); // escapar crase
  }

  const fileContent = `export const frames = [\n` +
    framesArray.map(f => `\`${f}\``).join(',\n') +
    `\n];\n`;

  fs.writeFileSync(outputFile, fileContent);
  console.log(`\n✅ frames.js generated with ${framesArray.length} frames.`);
}

generate().catch(err => console.error(err));