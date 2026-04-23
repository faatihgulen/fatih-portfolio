#!/usr/bin/env node

const path = require('path');
const {
  defaultBaseUrl,
  getProjectRoutePaths,
  rootDir,
  startLocalServer,
  stopLocalServer,
  writeJson
} = require('./lib/site-check-utils');

const publicSiteOrigin = process.env.SITE_PUBLIC_ORIGIN || 'https://fatihgulen.com';
const categoryRoutes = ['/', '/uiux', '/3d', '/ai', '/vr-ar', '/architecture'];
const allRoutes = [...categoryRoutes, ...getProjectRoutePaths()];
const reportPath = path.join(rootDir, 'routes-check-report.json');

function extractTagContent(html, pattern) {
  const match = html.match(pattern);
  return match ? String(match[1] || '').trim() : '';
}

function buildAbsoluteUrl(baseUrl, routePath) {
  return new URL(routePath, baseUrl).toString();
}

function buildPublicUrl(routePath) {
  return new URL(routePath, publicSiteOrigin).toString();
}

async function fetchRoute(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'routes-check/1.0'
      }
    });
    const html = await response.text();
    return { status: response.status, ok: response.ok, html };
  } finally {
    clearTimeout(timeoutId);
  }
}

function inspectRoute(routePath, html) {
  const title = extractTagContent(html, /<title>([^<]*)<\/title>/i);
  const description = extractTagContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const canonical = extractTagContent(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  const ogTitle = extractTagContent(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
  const ogDescription = extractTagContent(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
  const ogUrl = extractTagContent(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']*)["']/i);
  const ogImage = extractTagContent(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);

  const issues = [];
  if (!title) issues.push('missing <title>');
  if (!description) issues.push('missing description');
  if (!canonical) issues.push('missing canonical');
  if (!ogTitle) issues.push('missing og:title');
  if (!ogDescription) issues.push('missing og:description');
  if (!ogUrl) issues.push('missing og:url');
  if (!ogImage) issues.push('missing og:image');

  const expectedCanonical = buildPublicUrl(routePath);
  if (canonical && canonical !== expectedCanonical) {
    issues.push(`canonical mismatch (${canonical})`);
  }
  if (ogUrl && canonical && ogUrl !== canonical) {
    issues.push(`og:url mismatch (${ogUrl})`);
  }
  if (ogImage && !/^https?:\/\//i.test(ogImage)) {
    issues.push(`og:image is not absolute (${ogImage})`);
  }

  if (routePath === '/') {
    if (!/id=["']responseArea["']/i.test(html)) issues.push('homepage render surface missing');
    if (!/js\/site\.js\?v=/i.test(html)) issues.push('homepage script tag missing');
  } else {
    if (!/window\.location\.replace\(/i.test(html)) issues.push('redirect script missing');
    if (!/<meta[^>]+http-equiv=["']refresh["']/i.test(html)) issues.push('meta refresh missing');
  }

  return {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogUrl,
    ogImage,
    issues
  };
}

async function main() {
  let serverHandle = null;
  try {
    serverHandle = await startLocalServer({ baseUrl: defaultBaseUrl, entry: 'server.js', startupTimeoutMs: 12000 });
    const results = [];

    for (const routePath of allRoutes) {
      const url = buildAbsoluteUrl(defaultBaseUrl, routePath);
      const { status, ok, html } = await fetchRoute(url);
      const inspection = inspectRoute(routePath, html);
      results.push({
        route: routePath,
        url,
        status,
        ok: Boolean(ok && inspection.issues.length === 0),
        ...inspection
      });
    }

    writeJson(reportPath, {
      generatedAt: new Date().toISOString(),
      baseUrl: defaultBaseUrl,
      checkedRoutes: results.length,
      failedRoutes: results.filter((result) => !result.ok).length,
      results
    });

    const failures = results.filter((result) => !result.ok);
    if (!failures.length) {
      console.log(`PASS routes:check | ${results.length} route(s) verified`);
      console.log(`Saved ${path.relative(rootDir, reportPath)}`);
      return;
    }

    console.log(`FAIL routes:check | ${failures.length} route(s) have status or meta issues`);
    failures.forEach((failure) => {
      console.log(`${failure.route} | status ${failure.status} | ${failure.issues.join('; ')}`);
    });
    console.log(`Saved ${path.relative(rootDir, reportPath)}`);
    process.exitCode = 1;
  } finally {
    await stopLocalServer(serverHandle);
  }
}

main().catch((error) => {
  console.error(`FAIL routes:check | ${error.message}`);
  process.exitCode = 1;
});
