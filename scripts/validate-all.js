#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const { rootDir } = require('./lib/site-check-utils');

const steps = [
  { label: 'Syntax check | js/site.js', command: process.execPath, args: ['--check', 'js/site.js'] },
  { label: 'Syntax check | scripts/generate-share-pages.js', command: process.execPath, args: ['--check', 'scripts/generate-share-pages.js'] },
  { label: 'Syntax check | scripts/lint-paths.js', command: process.execPath, args: ['--check', 'scripts/lint-paths.js'] },
  { label: 'Syntax check | scripts/routes-check.js', command: process.execPath, args: ['--check', 'scripts/routes-check.js'] },
  { label: 'Syntax check | scripts/health-browser-json.js', command: process.execPath, args: ['--check', 'scripts/health-browser-json.js'] },
  { label: 'Generate share pages', command: process.execPath, args: ['scripts/generate-share-pages.js'] },
  { label: 'Lint local asset paths', command: process.execPath, args: ['scripts/lint-paths.js'] },
  { label: 'Check category + project routes', command: process.execPath, args: ['scripts/routes-check.js'] },
  { label: 'Run full site health monitor', command: process.execPath, args: ['.local/site-health/site-health-monitor.js', '--config', '.local/site-health/site-health.config.js'] }
];

function runStep(step) {
  console.log(`\n> ${step.label}`);
  const result = spawnSync(step.command, step.args, {
    cwd: rootDir,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    throw new Error(`${step.label} failed with exit code ${result.status || 1}`);
  }
}

function main() {
  steps.forEach(runStep);
  console.log(`\nPASS validate:all | ${steps.length} step(s) completed`);
  console.log(`Saved reports: ${path.join('.', 'routes-check-report.json')}, ${path.join('.', 'site-health-report.json')} when generated`);
}

try {
  main();
} catch (error) {
  console.error(`\nFAIL validate:all | ${error.message}`);
  process.exitCode = 1;
}
