const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.join(__dirname, '..');
const siteDataPath = path.join(rootDir, 'data', 'site.json');
const siteScriptPath = path.join(rootDir, 'js', 'site.js');
const siteOrigin = 'https://fatihgulen.com';
const defaultImage = 'images/3D/Whaf/image (3).webp';
const defaultImageAlt = 'Selected realtime experience design work by Fatih Gulen';
const defaultDescription = 'Fatih Gulen is a realtime experience designer creating UI/UX, 3D, AI, VR/AR, and architectural visualization work from Germany.';

const categoryConfig = {
  'ui-ux': {
    canonicalPath: '/uiux',
    aliases: ['/uiux', '/ui-ux'],
    label: 'UI/UX',
    description: 'Product, dashboard, and interface design case studies by Fatih Gulen spanning mobile, SaaS, and automotive UI.'
  },
  '3d': {
    canonicalPath: '/3d',
    aliases: ['/3d'],
    label: '3D',
    description: 'Realtime and high-fidelity 3D visualization work covering product visuals, materials, assets, and VFX.'
  },
  'ai': {
    canonicalPath: '/ai',
    aliases: ['/ai'],
    label: 'AI',
    description: 'AI-assisted creative pipelines, generative visuals, and research-driven workflows by Fatih Gulen.'
  },
  'vr-ar': {
    canonicalPath: '/vr-ar',
    aliases: ['/vr-ar', '/vr'],
    label: 'VR/AR',
    description: 'Immersive VR and AR work including training, prototyping, spatial UI, and interactive experiences.'
  },
  'architecture': {
    canonicalPath: '/architecture',
    aliases: ['/architecture'],
    label: 'Architecture',
    description: 'Architectural visualization, interior design, and presentation work for residential and commercial spaces.'
  }
};

function readSiteData() {
  const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf8'));
  siteData.projects = readProjectsFromSiteScript();
  return siteData;
}

function readProjectsFromSiteScript() {
  const siteScript = fs.readFileSync(siteScriptPath, 'utf8');
  const match = siteScript.match(/const projects = \[[\s\S]*?\n\];/);
  if (!match) {
    throw new Error('Could not find projects array in js/site.js');
  }
  const projectExpression = match[0]
    .replace(/^const projects = /, '')
    .replace(/;$/, '');
  const projects = vm.runInNewContext(projectExpression, {}, { timeout: 1000 });
  if (!Array.isArray(projects)) {
    throw new Error('Projects array in js/site.js did not evaluate to an array');
  }
  return projects;
}

function normalizePath(filePath) {
  return String(filePath || '').trim().replace(/\\/g, '/');
}

function toAbsoluteUrl(filePath) {
  const normalizedPath = normalizePath(filePath);
  const relativePath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  return new URL(relativePath, siteOrigin).toString();
}

function stripMetaFormatting(text) {
  return String(text || '')
    .replace(/\*\*/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampDescription(text, maxLength = 180) {
  const normalized = stripMetaFormatting(text);
  if (normalized.length <= maxLength) return normalized;
  const clipped = normalized.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > 72 ? clipped.slice(0, lastSpace) : clipped).trim()}...`;
}

function slugifyProject(project) {
  const raw = `${project.id}-${project.title}`;
  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function getProjectCardImage(project) {
  const derived = project.cardImage || `images/_card/${project.id}.webp`;
  const derivedPath = path.join(rootDir, normalizePath(derived));
  return fs.existsSync(derivedPath) ? normalizePath(derived) : normalizePath(project.image || defaultImage);
}

function writeFile(relativePath, content) {
  const targetPath = path.join(rootDir, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
}

function renderMetaRedirectPage({ title, description, canonicalUrl, imageUrl, imageAlt, redirectUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Fatih Gulen Portfolio">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta property="og:image" content="${escapeHtml(imageUrl)}">
<meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(imageUrl)}">
<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}">
<meta http-equiv="refresh" content="0; url=${escapeHtml(redirectUrl)}">
<title>${escapeHtml(title)}</title>
<script>
  window.location.replace(${JSON.stringify(redirectUrl)});
</script>
</head>
<body></body>
</html>
`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generateCategoryPages(siteData) {
  Object.entries(categoryConfig).forEach(([categoryId, config]) => {
    const categoryProjects = (siteData.projects || []).filter((project) => Array.isArray(project.categories) && project.categories.includes(categoryId));
    const leadProject = categoryProjects[0] || null;
    const imagePath = leadProject ? getProjectCardImage(leadProject) : defaultImage;
    const canonicalUrl = toAbsoluteUrl(config.canonicalPath);
    const redirectUrl = `${siteOrigin}/?category=${encodeURIComponent(categoryId)}`;
    const html = renderMetaRedirectPage({
      title: `${config.label} Projects | Fatih Gulen`,
      description: config.description,
      canonicalUrl,
      imageUrl: toAbsoluteUrl(imagePath),
      imageAlt: `${config.label} portfolio work by Fatih Gulen`,
      redirectUrl
    });

    config.aliases.forEach((aliasPath) => {
      writeFile(path.join(aliasPath.replace(/^\//, ''), 'index.html'), html);
    });
  });
}

function generateProjectPages(siteData) {
  (siteData.projects || []).forEach((project) => {
    const primaryCategory = Array.isArray(project.categories) ? project.categories[0] || '' : '';
    const shareSlug = slugifyProject(project);
    const sharePath = `/project/${shareSlug}`;
    const redirectParams = new URLSearchParams();
    if (primaryCategory) redirectParams.set('category', primaryCategory);
    redirectParams.set('project', project.id);

    const canonicalUrl = toAbsoluteUrl(sharePath);
    const imagePath = getProjectCardImage(project);
    const html = renderMetaRedirectPage({
      title: `${stripMetaFormatting(project.title)} | Fatih Gulen`,
      description: clampDescription(project.description || defaultDescription),
      canonicalUrl,
      imageUrl: toAbsoluteUrl(imagePath),
      imageAlt: `${stripMetaFormatting(project.title)} by Fatih Gulen`,
      redirectUrl: `${siteOrigin}/?${redirectParams.toString()}`
    });

    writeFile(path.join('project', shareSlug, 'index.html'), html);
  });
}

function generateSitemap(siteData) {
  const urls = [];
  urls.push(toAbsoluteUrl('/'));

  Object.values(categoryConfig).forEach((config) => {
    urls.push(toAbsoluteUrl(config.canonicalPath));
  });

  (siteData.projects || []).forEach((project) => {
    urls.push(toAbsoluteUrl(`/project/${slugifyProject(project)}`));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${escapeHtml(url)}</loc>\n  </url>`).join('\n')}
</urlset>
`;

  writeFile('sitemap.xml', xml);
}

function main() {
  const siteData = readSiteData();
  generateCategoryPages(siteData);
  generateProjectPages(siteData);
  generateSitemap(siteData);
  console.log(`Generated category share pages for ${Object.keys(categoryConfig).length} categories.`);
  console.log(`Generated project share pages for ${(siteData.projects || []).length} projects.`);
  console.log('Updated sitemap.xml');
}

main();
