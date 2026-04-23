#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { rootDir, writeJson } = require('./lib/site-check-utils');

const fullReportPath = path.join(rootDir, 'site-health-report.json');
const browserReportPath = path.join(rootDir, 'browser-health-report.json');

function runHealthMonitor() {
  const result = spawnSync(process.execPath, [
    '.local/site-health/site-health-monitor.js',
    '--config',
    '.local/site-health/site-health.config.js',
    '--json-file',
    'site-health-report.json'
  ], {
    cwd: rootDir,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function buildBrowserReport(fullReport) {
  const browserCheck = Array.isArray(fullReport.checks)
    ? fullReport.checks.find((check) => check && check.id === 'browser')
    : null;

  return {
    generatedAt: new Date().toISOString(),
    sourceReport: path.basename(fullReportPath),
    overallState: browserCheck ? browserCheck.state : 'SKIP',
    summary: browserCheck ? browserCheck.summary : 'Browser check not found in site health report.',
    detailLines: browserCheck ? browserCheck.detailLines || [] : [],
    desktop: browserCheck && browserCheck.details ? browserCheck.details.desktop || null : null,
    mobile: browserCheck && browserCheck.details ? browserCheck.details.mobile || null : null,
    combinedConsoleErrors: browserCheck && browserCheck.details ? browserCheck.details.combinedConsoleErrors || [] : [],
    combinedPageErrors: browserCheck && browserCheck.details ? browserCheck.details.combinedPageErrors || [] : [],
    combinedRequestFailures: browserCheck && browserCheck.details ? browserCheck.details.combinedRequestFailures || [] : []
  };
}

function main() {
  runHealthMonitor();

  if (!fs.existsSync(fullReportPath)) {
    throw new Error('site-health-report.json was not generated');
  }

  const fullReport = JSON.parse(fs.readFileSync(fullReportPath, 'utf8'));
  const browserReport = buildBrowserReport(fullReport);
  writeJson(browserReportPath, browserReport);

  console.log(`Saved ${path.relative(rootDir, browserReportPath)}`);
}

try {
  main();
} catch (error) {
  console.error(`FAIL health:browser:json | ${error.message}`);
  process.exitCode = 1;
}
