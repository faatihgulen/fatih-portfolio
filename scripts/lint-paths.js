#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  listFilesRecursive,
  resolveRepoPath,
  rootDir,
  stripQueryHash
} = require('./lib/site-check-utils');

const htmlFiles = [
  path.join(rootDir, 'index.html'),
  path.join(rootDir, '3d', 'index.html'),
  path.join(rootDir, 'ai', 'index.html'),
  path.join(rootDir, 'architecture', 'index.html'),
  path.join(rootDir, 'uiux', 'index.html'),
  path.join(rootDir, 'ui-ux', 'index.html'),
  path.join(rootDir, 'vr', 'index.html'),
  path.join(rootDir, 'vr-ar', 'index.html'),
  ...listFilesRecursive(path.join(rootDir, 'project'), (filePath) => filePath.toLowerCase().endsWith('.html'))
].filter((filePath, index, list) => fs.existsSync(filePath) && list.indexOf(filePath) === index);

const scriptFiles = [
  path.join(rootDir, 'js', 'site.js')
].filter((filePath) => fs.existsSync(filePath));

const htmlRefPattern = /\b(?:src|href|content)\s*=\s*(["'])([^"']+)\1/gi;
const jsAssetPattern = /(["'`])((?:\/)?(?:images|Video|css|js|data|uploads)[^"'`\r\n]*\.(?:html?|json|xml|txt|css|js|mjs|webp|png|jpe?g|gif|svg|mp4|webm|mov|woff2?))\1/g;

function isExternalRef(value) {
  return /^(?:[a-z]+:)?\/\//i.test(value) || /^(mailto:|tel:|data:|blob:|javascript:)/i.test(value) || value.startsWith('#');
}

function isLocalCandidate(value) {
  const clean = String(value || '').trim();
  if (!clean || isExternalRef(clean)) return false;
  if (clean.includes('${')) return false;
  if (/^(?:\?|&)/.test(clean)) return false;
  if (/^\/?(?:images|Video|css|js|data|uploads)\//.test(clean)) return true;
  return /\.(?:html?|json|xml|txt|css|js|mjs|webp|png|jpe?g|gif|svg|mp4|webm|mov|woff2?)$/i.test(stripQueryHash(clean));
}

function findSiblingSuggestion(filePath) {
  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, ext);
  if (!fs.existsSync(dir)) return '';
  const sibling = fs.readdirSync(dir).find((name) => path.basename(name, path.extname(name)) === base);
  return sibling ? path.join(dir, sibling) : '';
}

function collectHtmlIssues() {
  const issues = [];
  htmlFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = htmlRefPattern.exec(content))) {
      const ref = String(match[2] || '').trim();
      if (!isLocalCandidate(ref)) continue;
      const resolvedPath = resolveRepoPath(ref, filePath);
      if (fs.existsSync(resolvedPath)) continue;
      issues.push({
        kind: 'html',
        file: path.relative(rootDir, filePath),
        ref,
        resolved: path.relative(rootDir, resolvedPath),
        suggestion: findSiblingSuggestion(resolvedPath)
      });
    }
  });
  return issues;
}

function collectScriptIssues() {
  const issues = [];
  const seen = new Set();
  scriptFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = jsAssetPattern.exec(content))) {
      const ref = String(match[2] || '').trim();
      if (!isLocalCandidate(ref)) continue;
      const cleanRef = stripQueryHash(ref).replace(/^\/+/, '').replace(/^\.?\//, '');
      const resolvedPath = path.join(rootDir, cleanRef);
      if (fs.existsSync(resolvedPath)) continue;
      const key = `${filePath}::${ref}`;
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push({
        kind: 'script',
        file: path.relative(rootDir, filePath),
        ref,
        resolved: path.relative(rootDir, resolvedPath),
        suggestion: findSiblingSuggestion(resolvedPath)
      });
    }
  });
  return issues;
}

function printIssue(issue) {
  const base = `[${issue.kind}] ${issue.file} -> ${issue.ref} (missing: ${issue.resolved || issue.ref})`;
  if (!issue.suggestion) {
    console.log(base);
    return;
  }
  console.log(`${base} | maybe: ${path.relative(rootDir, issue.suggestion)}`);
}

function main() {
  const issues = [
    ...collectHtmlIssues(),
    ...collectScriptIssues()
  ];

  if (!issues.length) {
    console.log(`PASS lint:paths | checked ${htmlFiles.length} html file(s) and ${scriptFiles.length} script file(s)`);
    return;
  }

  console.log(`FAIL lint:paths | found ${issues.length} broken local path reference(s)`);
  issues.forEach(printIssue);
  process.exitCode = 1;
}

main();
