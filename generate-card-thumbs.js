const fs = require('fs');
const path = require('path');
const vm = require('vm');
const sharp = require('sharp');

const ROOT = __dirname;
const SITE_SCRIPT_PATH = path.join(ROOT, 'js', 'site.js');
const OUTPUT_DIR = path.join(ROOT, 'images', '_card');
const CARD_WIDTH = 960;
const CARD_HEIGHT = 600;
const CARD_QUALITY = 72;
const EXTRA_CARD_PROJECTS = [
  {
    id: 'p03',
    image: 'images/UI/Hipicon/3045a34b-7d15-4e97-80b1-7c4169b84e62_rw_1200.webp'
  }
];

function extractProjectsFromSiteScript(siteScript) {
  const match = siteScript.match(/const projects = \[([\s\S]*?)\n\];/);
  if (!match) throw new Error('Could not find projects array in js/site.js');
  const snippet = `const projects = [${match[1]}\n];`;
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${snippet}\nthis.projects = projects;`, sandbox);
  return Array.isArray(sandbox.projects) ? sandbox.projects : [];
}

async function ensureDir(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function buildCardThumb(project) {
  const inputPath = path.join(ROOT, String(project.image || '').replace(/\//g, path.sep));
  const outputPath = path.join(OUTPUT_DIR, `${project.id}.webp`);
  await sharp(inputPath)
    .rotate()
    .resize(CARD_WIDTH, CARD_HEIGHT, {
      fit: 'cover',
      position: 'attention'
    })
    .webp({
      quality: CARD_QUALITY,
      effort: 4
    })
    .toFile(outputPath);

  const stats = await fs.promises.stat(outputPath);
  return {
    id: project.id,
    outputPath,
    bytes: stats.size
  };
}

async function main() {
  const siteScript = await fs.promises.readFile(SITE_SCRIPT_PATH, 'utf8');
  const projects = [
    ...extractProjectsFromSiteScript(siteScript),
    ...EXTRA_CARD_PROJECTS
  ]
    .filter((project) => project && project.id && project.image)
    .filter((project, index, list) => list.findIndex((item) => item.id === project.id) === index);
  await ensureDir(OUTPUT_DIR);

  const built = [];
  for (const project of projects) {
    built.push(await buildCardThumb(project));
  }

  const summary = built
    .map((item) => `${item.id}: ${path.relative(ROOT, item.outputPath)} (${item.bytes} bytes)`)
    .join('\n');
  console.log(`Generated ${built.length} card thumbnails.\n${summary}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
