import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = path.resolve('src/assets/art');
const targetDir = path.resolve('public/images/artcraft');

const isDemo = process.argv.includes('--demo') || process.env.DEMO === 'true';

const SUPPORTED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.tiff',
  '.tif',
  '.avif',
  '.heic',
]);

async function optimizeArt() {
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const entries = fs.readdirSync(sourceDir);
  const imageFiles = entries
    .filter((file) => {
      if (file.startsWith('.')) return false;
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_EXTENSIONS.has(ext);
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  if (imageFiles.length === 0) {
    console.log('[art:optimize] No images found in src/assets/art/. Place original photos there and run again.');
    return;
  }

  console.log(`[art:optimize] Found ${imageFiles.length} image(s) in ${sourceDir} (mode: ${isDemo ? 'demo' : 'standard'})`);

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const inputPath = path.join(sourceDir, file);
    const parsed = path.parse(file);

    const outputFileName = isDemo
      ? `demo-${String(i + 1).padStart(2, '0')}.webp`
      : `${parsed.name}.webp`;
    const outputPath = path.join(targetDir, outputFileName);

    try {
      await sharp(inputPath)
        .rotate() // auto-orient based on EXIF
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside', // long edge at most 1600px
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toFile(outputPath);

      const inSize = (fs.statSync(inputPath).size / 1024).toFixed(1);
      const outSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`  ✓ ${file} (${inSize} KB) -> public/images/artcraft/${outputFileName} (${outSize} KB)`);
    } catch (err) {
      console.error(`  ✕ Error converting ${file}:`, err);
    }
  }

  console.log('[art:optimize] Done.');
}

optimizeArt().catch((err) => {
  console.error('[art:optimize] Fatal error:', err);
  process.exit(1);
});
