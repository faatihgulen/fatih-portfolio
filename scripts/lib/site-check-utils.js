const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..', '..');
const siteScriptPath = path.join(rootDir, 'js', 'site.js');
const defaultBaseUrl = process.env.SITE_HEALTH_BASE_URL || 'http://localhost:3000';

function stripQueryHash(value) {
  return String(value || '').split(/[?#]/, 1)[0].trim();
}

function normalizeSlashes(value) {
  return String(value || '').replace(/\\/g, '/');
}

function isExternalUrl(value) {
  const normalized = String(value || '').trim();
  return /^(?:[a-z]+:)?\/\//i.test(normalized) || /^(mailto:|tel:|data:|blob:|javascript:)/i.test(normalized);
}

function isSkippableRef(value) {
  const normalized = String(value || '').trim();
  return !normalized || normalized.startsWith('#') || isExternalUrl(normalized);
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

function slugifyProject(project) {
  const raw = `${project && project.id ? project.id : 'project'}-${project && project.title ? project.title : ''}`;
  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function getProjectRoutePaths() {
  return readProjectsFromSiteScript().map((project) => `/project/${slugifyProject(project)}`);
}

function resolveRepoPath(ref, fromFile) {
  const cleanRef = stripQueryHash(normalizeSlashes(ref));
  if (!cleanRef) return '';
  if (cleanRef.startsWith('/')) {
    return path.join(rootDir, cleanRef.slice(1));
  }
  return path.resolve(path.dirname(fromFile), cleanRef);
}

function listFilesRecursive(dir, predicate, collector = []) {
  if (!fs.existsSync(dir)) return collector;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFilesRecursive(fullPath, predicate, collector);
      return;
    }
    if (!predicate || predicate(fullPath)) collector.push(fullPath);
  });
  return collector;
}

async function isUrlReachable(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'site-check-utils/1.0'
      }
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 12000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isUrlReachable(url)) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

async function startLocalServer(options = {}) {
  const baseUrl = String(options.baseUrl || defaultBaseUrl).trim();
  const entry = String(options.entry || 'server.js').trim();
  const startupTimeoutMs = Number(options.startupTimeoutMs || 12000);
  const alreadyRunning = await isUrlReachable(baseUrl);
  if (alreadyRunning) {
    return { baseUrl, process: null, started: false };
  }

  const child = spawn(process.execPath, [entry], {
    cwd: rootDir,
    stdio: 'ignore',
    windowsHide: true
  });

  const ready = await waitForServer(baseUrl, startupTimeoutMs);
  if (!ready) {
    child.kill();
    throw new Error(`Local server did not become ready at ${baseUrl} within ${startupTimeoutMs}ms`);
  }

  return { baseUrl, process: child, started: true };
}

async function stopLocalServer(handle) {
  if (!handle || !handle.process) return;
  if (handle.process.exitCode != null || handle.process.killed) return;
  handle.process.kill();
  await new Promise((resolve) => setTimeout(resolve, 200));
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

module.exports = {
  defaultBaseUrl,
  isExternalUrl,
  isSkippableRef,
  getProjectRoutePaths,
  listFilesRecursive,
  normalizeSlashes,
  readProjectsFromSiteScript,
  readText,
  resolveRepoPath,
  rootDir,
  slugifyProject,
  startLocalServer,
  stopLocalServer,
  stripQueryHash,
  writeJson
};
