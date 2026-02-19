const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, 'images');

function getAllImages(dir) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllImages(fullPath));
    } else {
      const ext = path.extname(item.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.jfif', '.gif', '.bmp', '.tiff'].includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function convertAll() {
  const images = getAllImages(imagesDir);
  console.log(`Found ${images.length} images to convert`);

  let converted = 0;
  let failed = 0;

  for (const imgPath of images) {
    const dir = path.dirname(imgPath);
    const name = path.basename(imgPath, path.extname(imgPath));
    const webpPath = path.join(dir, name + '.webp');

    // Skip if webp already exists
    if (fs.existsSync(webpPath)) {
      console.log(`SKIP (exists): ${path.relative(imagesDir, webpPath)}`);
      continue;
    }

    try {
      await sharp(imgPath)
        .webp({ quality: 80 })
        .toFile(webpPath);

      const origSize = fs.statSync(imgPath).size;
      const webpSize = fs.statSync(webpPath).size;
      const savings = Math.round((1 - webpSize / origSize) * 100);
      console.log(`OK: ${path.relative(imagesDir, webpPath)} (${savings}% smaller)`);
      converted++;
    } catch (err) {
      console.error(`FAIL: ${path.relative(imagesDir, imgPath)} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Converted: ${converted}, Failed: ${failed}, Total: ${images.length}`);
}

convertAll();
