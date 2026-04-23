const THEME_TIMEZONE = 'Europe/Berlin';
const THEME_LIGHT_START_HOUR = 7;
const THEME_DARK_START_HOUR = 19;
let themeManualOverride = null;
let themeSyncTimer = 0;

function getActiveTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function getGermanyTimeParts(now = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: THEME_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);
    const readPart = (type, fallback) => {
      const part = parts.find((entry) => entry.type === type);
      return part ? Number(part.value) : fallback;
    };
    return {
      hour: readPart('hour', 12),
      minute: readPart('minute', 0),
      second: readPart('second', 0),
    };
  } catch (err) {
    return { hour: 12, minute: 0, second: 0 };
  }
}

function getGermanyTheme(now = new Date()) {
  const { hour } = getGermanyTimeParts(now);
  return hour >= THEME_LIGHT_START_HOUR && hour < THEME_DARK_START_HOUR ? 'light' : 'dark';
}

function setThemeMeta(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute('content', theme === 'light' ? '#f8f4ec' : '#14161a');
}

function syncThemeToggle(theme) {
  const toggle = document.getElementById('themeToggle');
  const label = document.getElementById('themeToggleLabel');
  if (!toggle || !label) return;
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  toggle.dataset.theme = theme;
  toggle.setAttribute('aria-label', 'Switch to ' + nextTheme + ' mode');
  toggle.setAttribute('title', 'Switch to ' + nextTheme + ' mode');
  label.textContent = theme === 'light' ? 'Light' : 'Dark';
}

function applyTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  syncThemeToggle(nextTheme);
  setThemeMeta(nextTheme);
  document.dispatchEvent(new CustomEvent('site-theme-change', { detail: { theme: nextTheme } }));
}

function syncThemeWithGermanyTime(force = false) {
  const germanyTheme = getGermanyTheme();
  if (force) {
    themeManualOverride = null;
  }
  if (themeManualOverride) {
    if (themeManualOverride === germanyTheme) {
      themeManualOverride = null;
    } else {
      syncThemeToggle(getActiveTheme());
      setThemeMeta(getActiveTheme());
      return;
    }
  }
  if (force || getActiveTheme() !== germanyTheme) {
    applyTheme(germanyTheme);
    return;
  }
  syncThemeToggle(germanyTheme);
  setThemeMeta(germanyTheme);
}

function scheduleThemeSync() {
  if (themeSyncTimer) {
    clearTimeout(themeSyncTimer);
  }
  const { second } = getGermanyTimeParts();
  const delay = Math.max(1000, ((60 - second) * 1000) + 120);
  themeSyncTimer = window.setTimeout(() => {
    syncThemeWithGermanyTime();
    scheduleThemeSync();
  }, delay);
}

function toggleTheme() {
  themeManualOverride = getActiveTheme() === 'light' ? 'dark' : 'light';
  applyTheme(themeManualOverride);
}

syncThemeWithGermanyTime(true);
scheduleThemeSync();

const vrHeroLayerDefaults = {
  dark: {
    alphaMode: 'luma-key',
    scaleBoost: 1.58,
    sourceInset: 0,
    drawInset: 0,
    offsetX: 0,
    offsetY: 0,
    keyLow: 18,
    keyHigh: 54,
    alphaGamma: 0,
    alphaErodeIterations: 0,
    edgeFeather: 0,
    edgeSoftFeather: 0,
    edgeSoftAlphaMax: 0,
    whiteKeyLow: 246,
    whiteKeyHigh: 255
  },
  light: {
    alphaMode: 'luma-key',
    scaleBoost: 1.58,
    sourceInset: 1,
    drawInset: 2,
    offsetX: 0,
    offsetY: 0,
    keyLow: 24,
    keyHigh: 76,
    alphaGamma: 1.16,
    alphaErodeIterations: 1,
    edgeFeather: 0.68,
    edgeSoftFeather: 0.3,
    edgeSoftAlphaMax: 224,
    edgeMatteColor: null,
    edgeMatteStrength: 0,
    edgeMatteMaxAlpha: 0,
    clipWhiteLow: 0,
    clipWhiteHigh: 0,
    whiteKeyLow: 246,
    whiteKeyHigh: 255
  }
};

const uiUxHeroAssets = {
  dark: buildVideoSourceList(
    'Video/UI_AI_Dark.webm',
    'Video/UI_AI_Dark.mp4'
  ),
  light: buildVideoSourceList(
    'Video/UI_AI_Light.webm',
    'Video/UI_AI_Light.mp4'
  )
};

const architectureHeroAssets = {
  dark: buildVideoSourceList(
    'Video/DARK_arch.webm',
    'Video/DARK_arch.mp4'
  ),
  light: buildVideoSourceList(
    'Video/ARCH_light.webm',
    'Video/ARCH_light.mp4'
  )
};

const uiAiHeroMobileOverrides = {
  dark: {
    mobileScaleBoost: 0.84,
    mobileSourceInset: 3,
    mobileDrawInset: 0,
    mobileOffsetY: 30
  },
  light: {
    mobileScaleBoost: 0.82,
    mobileSourceInset: 5,
    mobileDrawInset: 1,
    mobileOffsetY: 30
  }
};

const spatialHeroMobileOverrides = {
  dark: {
    mobileScaleBoost: 0.82,
    mobileSourceInset: 0,
    mobileDrawInset: 0,
    mobileOffsetY: 30
  },
  light: {
    mobileScaleBoost: 0.78,
    mobileSourceInset: 0,
    mobileDrawInset: 0,
    mobileOffsetY: 30
  }
};

const spatialHeroMp4BlueFallback = {
  keyLow: 0,
  keyHigh: 6,
  alphaGamma: 1,
  alphaErodeIterations: 1,
  edgeFeather: 0.84,
  edgeSoftFeather: 0.74,
  edgeSoftAlphaMax: 208,
  colorKey: {
    r: 0,
    g: 0,
    b: 255,
    distanceLow: 34,
    distanceHigh: 98,
    minBlue: 132,
    dominanceLow: 24
  }
};

const spatialHeroMp4BlueFallbackLight = {
  ...spatialHeroMp4BlueFallback,
  sourceInset: 1,
  edgeFeather: 0.8,
  edgeSoftFeather: 0.66,
  edgeSoftAlphaMax: 188
};

const spatialHeroMp4BlueFallbackDark = {
  ...spatialHeroMp4BlueFallback,
  sourceInset: 1,
  edgeFeather: 0.82,
  edgeSoftFeather: 0.68,
  edgeSoftAlphaMax: 192
};

const vrArHeroMobileOverrides = {
  dark: {
    mobileScaleBoost: 1.74,
    mobileOffsetY: 30
  },
  light: {
    mobileScaleBoost: 1.74,
    mobileOffsetY: 30
  }
};

const vrHeroShowcaseConfig = {
  'vr-ar': {
    kicker: 'VR / AR',
    caption: 'Immersive motion',
    layers: {
      dark: {
        ...vrHeroLayerDefaults.dark,
        ...vrArHeroMobileOverrides.dark,
        sources: buildVideoSourceList(
          'Video/Firefly A cinematic animation of a futuristic LEGO micro-city made of black and neon green LEGO piec (1).mp4?v=20260420133639'
        )
      },
      light: {
        ...vrHeroLayerDefaults.light,
        ...vrArHeroMobileOverrides.light,
        sources: buildVideoSourceList(
          'Video/Firefly A clean, futuristic animation of a VR headset placed in the center, surrounded by multiple c.mp4?v=20260420174305'
        )
      }
    }
  },
'ui-ux': {
  kicker: 'UI / UX',
  caption: 'Interface motion',
  layers: {
    dark: {
      ...vrHeroLayerDefaults.dark,
      alphaMode: 'source-alpha',
      scaleBoost: 0.48,
      sourceInset: 4,
      drawInset: 1,
      ...uiAiHeroMobileOverrides.dark,
      edgeFeather: 0.48,
      edgeSoftFeather: 0.44,
      clipWhiteLow: 162,
      clipWhiteHigh: 255,
      mp4Fallback: {
        keyLow: 14,
        keyHigh: 72,
        edgeFeather: 0.62,
        edgeSoftFeather: 0.38,
        edgeSoftAlphaMax: 190
      },
      sources: uiUxHeroAssets.dark
    },
    light: {
      ...vrHeroLayerDefaults.light,
      alphaMode: 'source-alpha',
      scaleBoost: 0.46,
      sourceInset: 8,
      drawInset: 3,
      ...uiAiHeroMobileOverrides.light,
      alphaErodeIterations: 0,
      edgeFeather: 0.38,
      edgeSoftFeather: 0.24,
      edgeSoftAlphaMax: 148,
      edgeMatteColor: { r: 248, g: 244, b: 236 },
      edgeMatteStrength: 0.72,
      edgeMatteMaxAlpha: 204,
      keyLow: 0,
      keyHigh: 200,
      mp4Fallback: {
        keyLow: 0,
        keyHigh: 200,
        edgeFeather: 0.56,
        edgeSoftFeather: 0.34,
        edgeSoftAlphaMax: 184
      },
      sources: uiUxHeroAssets.light
    }
  }
},
  'ai': {
  kicker: 'AI',
  caption: 'Interface motion',
  layers: {
    dark: {
      ...vrHeroLayerDefaults.dark,
      alphaMode: 'source-alpha',
      scaleBoost: 0.48,
      ...uiAiHeroMobileOverrides.dark,
      edgeFeather: 0.48,
      edgeSoftFeather: 0.44,
      clipWhiteLow: 162,
      clipWhiteHigh: 255,
      sourceInset: 4,
      drawInset: 1,
      mp4Fallback: {
        keyLow: 14,
        keyHigh: 72,
        edgeFeather: 0.62,
        edgeSoftFeather: 0.38,
        edgeSoftAlphaMax: 190
      },
      sources: uiUxHeroAssets.dark
    },
    light: {
      ...vrHeroLayerDefaults.light,
      alphaMode: 'source-alpha',
      scaleBoost: 0.46,
      sourceInset: 8,
      drawInset: 3,
      ...uiAiHeroMobileOverrides.light,
      alphaErodeIterations: 0,
      edgeFeather: 0.38,
      edgeSoftFeather: 0.24,
      edgeSoftAlphaMax: 148,
      edgeMatteColor: { r: 248, g: 244, b: 236 },
      edgeMatteStrength: 0.72,
      edgeMatteMaxAlpha: 204,
      keyLow: 0,
      keyHigh: 200,
      mp4Fallback: {
        keyLow: 0,
        keyHigh: 200,
        edgeFeather: 0.56,
        edgeSoftFeather: 0.34,
        edgeSoftAlphaMax: 184
      },
      sources: uiUxHeroAssets.light
    }
  }
},
'architecture': {
  kicker: 'Architecture',
  caption: 'Spatial motion',
  layers: {
    dark: {
      ...vrHeroLayerDefaults.dark,
      alphaMode: 'source-alpha',
      scaleBoost: 0.54,
      ...spatialHeroMobileOverrides.dark,
      keyLow: 0,
      keyHigh: 20,
      edgeFeather: 0.88,
      edgeSoftFeather: 0.62,
      edgeSoftAlphaMax: 168,
      mp4Fallback: {
        ...spatialHeroMp4BlueFallbackDark,
        drawInset: 5
      },
      sources: architectureHeroAssets.dark
    },
    light: {
      ...vrHeroLayerDefaults.light,
      alphaMode: 'source-alpha',
      scaleBoost: 0.58,
      ...spatialHeroMobileOverrides.light,
      keyLow: 0,
      keyHigh: 4,
      edgeFeather: 0.64,
      edgeMatteStrength: 0.72,
      drawInset: 3,
      edgeMatteMaxAlpha: 204,
      edgeSoftFeather: 0.56,
      edgeSoftAlphaMax: 244,
      mp4Fallback: {
        ...spatialHeroMp4BlueFallbackLight,
        drawInset: 5
      },
      sources: architectureHeroAssets.light
    }
  }
},
'3d': {
  kicker: '3D',
  caption: 'Spatial motion',
  layers: {
    dark: {
      ...vrHeroLayerDefaults.dark,
      alphaMode: 'source-alpha',
      scaleBoost: 0.54,
      ...spatialHeroMobileOverrides.dark,
      keyLow: 0,
      keyHigh: 20,
      edgeFeather: 0.88,
      edgeSoftFeather: 0.62,
      edgeSoftAlphaMax: 168,
      mp4Fallback: {
        ...spatialHeroMp4BlueFallbackDark,
        drawInset: 5
      },
      sources: architectureHeroAssets.dark
    },
    light: {
      ...vrHeroLayerDefaults.light,
      alphaMode: 'source-alpha',
      scaleBoost: 0.58,
      ...spatialHeroMobileOverrides.light,
      keyLow: 0,
      keyHigh: 4,
      edgeFeather: 0.64,
      edgeSoftFeather: 0.56,
      edgeSoftAlphaMax: 244,
      mp4Fallback: {
        ...spatialHeroMp4BlueFallbackLight,
        drawInset: 4
      },
      sources: architectureHeroAssets.light
    }
  }
}
};

const vrHero = {
  section: document.querySelector('.hero'),
  copy: document.getElementById('heroCopy'),
  showcase: document.getElementById('heroVrShowcase'),
  transitionCanvas: document.getElementById('heroVrTransitionCanvas'),
  kicker: document.querySelector('.hero-vr-kicker'),
  caption: document.querySelector('.hero-vr-caption'),
  layers: {
    dark: {
      media: document.querySelector('.hero-vr-media-dark'),
      canvas: document.getElementById('heroVrCanvasDark'),
      video: document.getElementById('heroVrVideoDark'),
      context: null,
      requestId: null,
      requestType: '',
      ...vrHeroLayerDefaults.dark
    },
    light: {
      media: document.querySelector('.hero-vr-media-light'),
      canvas: document.getElementById('heroVrCanvasLight'),
      video: document.getElementById('heroVrVideoLight'),
      context: null,
      requestId: null,
      requestType: '',
      ...vrHeroLayerDefaults.light
    }
  },
  active: false,
  activeCategory: '',
  transitionId: 0,
  frameReady: false,
  playbackMode: 'inactive',
  playbackLayerKey: '',
  scrollProgress: 0,
  scrollFrame: 0,
  progress: 0,
  released: false,
  deferredWarmupTimer: 0,
  transitionContext: null,
  transitionClearTimer: 0,
  transitionSnapshotVisible: false,
  touchStartY: 0,
  lastScrollTop: 0,
  snapLock: false,
  snapTimer: 0,
  stage: 'video',
  searchTargetTop: 0,
  searchHoldUntil: 0
};

const vrHeroDiagnostics = {
  sourceSets: 0,
  sourceSkips: 0,
  loadCalls: 0,
  loadSkips: 0,
  playCalls: 0,
  playSkips: 0,
  fallbackSwitches: 0,
  errors: 0,
  themeChanges: 0,
  categoryChanges: 0,
  lastEvents: []
};

function pushVrHeroDiagnostic(event, details = {}) {
  vrHeroDiagnostics.lastEvents.unshift({
    ts: new Date().toISOString(),
    event,
    ...details
  });
  vrHeroDiagnostics.lastEvents = vrHeroDiagnostics.lastEvents.slice(0, 60);
}

window.__VR_HERO_DIAGNOSTICS__ = vrHeroDiagnostics;
window.__getVrHeroHealthSnapshot = function getVrHeroHealthSnapshot() {
  return {
    active: vrHero.active,
    activeCategory: vrHero.activeCategory,
    transitionId: vrHero.transitionId,
    frameReady: vrHero.frameReady,
    playbackMode: vrHero.playbackMode,
    playbackLayerKey: vrHero.playbackLayerKey,
    theme: getActiveTheme(),
    diagnostics: {
      ...vrHeroDiagnostics,
      lastEvents: [...vrHeroDiagnostics.lastEvents]
    },
    layers: Object.fromEntries(
      Object.entries(vrHero.layers).map(([key, layer]) => [key, {
        assetTransitionId: layer.assetTransitionId || 0,
        alphaMode: layer.alphaMode,
        scaleBoost: layer.scaleBoost,
        sourceInset: layer.sourceInset || 0,
        drawInset: layer.drawInset || 0,
        currentSrc: layer.video ? normalizeImagePath(layer.video.currentSrc || layer.video.src || '') : '',
        fallbackSrc: layer.video ? normalizeImagePath(layer.video.dataset.fallbackSrc || '') : '',
        readyState: layer.video ? layer.video.readyState : 0,
        paused: layer.video ? layer.video.paused : true,
        ended: layer.video ? layer.video.ended : false,
        networkState: layer.video ? layer.video.networkState : 0,
        preload: layer.video ? layer.video.preload : '',
        error: layer.video && layer.video.error ? {
          code: layer.video.error.code,
          message: layer.video.error.message || ''
        } : null,
        loadToken: layer.loadToken || ''
      }])
    )
  };
};

const vrHeroReducedMotionQuery = typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

Object.values(vrHero.layers).forEach((layer) => {
  if (layer.canvas) {
    layer.context = layer.canvas.getContext('2d', { willReadFrequently: true });
  }
});

if (vrHero.transitionCanvas) {
  vrHero.transitionContext = vrHero.transitionCanvas.getContext('2d', { willReadFrequently: true });
}

function getVideoMimeType(src) {
  const clean = normalizeImagePath(src);
  if (/\.webm(\?.*)?$/i.test(clean)) return 'video/webm';
  if (/\.mp4(\?.*)?$/i.test(clean)) return 'video/mp4';
  return '';
}

function getVrHeroBrowserProfile() {
  const ua = typeof navigator !== 'undefined' ? String(navigator.userAgent || '') : '';
  const vendor = typeof navigator !== 'undefined' ? String(navigator.vendor || '') : '';
  const isIOS = /iPad|iPhone|iPod/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Edg|OPR|SamsungBrowser|Firefox|FxiOS/i.test(ua);
  const isChromium = /Chrome|CriOS|Chromium|Edg|OPR/i.test(ua) && /Google Inc\.|Microsoft|Opera/i.test(vendor || 'Google Inc.');
  return {
    isIOS,
    isSafari,
    isChromium
  };
}

const vrHeroBrowserProfile = getVrHeroBrowserProfile();

function shouldUseVrHeroMp4KeyFallback(layer) {
  if (!layer || layer.alphaMode !== 'source-alpha' || !layer.video) return false;
  if (!(vrHeroBrowserProfile.isSafari || vrHeroBrowserProfile.isIOS)) return false;
  const currentSrc = normalizeImagePath(layer.video.currentSrc || layer.video.src || layer.video.dataset.currentSrc || '');
  return /\.mp4(\?.*)?$/i.test(currentSrc);
}

function getVrHeroEffectiveAlphaMode(layer) {
  if (!shouldUseVrHeroMp4KeyFallback(layer)) {
    return layer && layer.alphaMode ? layer.alphaMode : 'source-alpha';
  }


  return 'luma-key';
}

function getVrHeroMp4FallbackConfig(layer) {
  if (!shouldUseVrHeroMp4KeyFallback(layer)) return null;
  const config = layer && layer.mp4Fallback;
  return config && typeof config === 'object' ? config : null;
}

function getVrHeroMp4FallbackNumber(config, prop) {
  if (!config || typeof config[prop] !== 'number' || !Number.isFinite(config[prop])) {
    return null;
  }

  return config[prop];
}

function applyVrHeroMp4ColorKey(pixels, config, alphaGamma) {
  const colorKey = config && config.colorKey;
  if (!colorKey || typeof colorKey !== 'object') {
    return false;
  }

  const targetRed = Number.isFinite(colorKey.r) ? colorKey.r : 0;
  const targetGreen = Number.isFinite(colorKey.g) ? colorKey.g : 0;
  const targetBlue = Number.isFinite(colorKey.b) ? colorKey.b : 255;
  const distanceLow = Number.isFinite(colorKey.distanceLow) ? colorKey.distanceLow : 0;
  const distanceHigh = Number.isFinite(colorKey.distanceHigh) ? colorKey.distanceHigh : 0;
  const minBlue = Number.isFinite(colorKey.minBlue) ? colorKey.minBlue : 0;
  const dominanceLow = Number.isFinite(colorKey.dominanceLow) ? colorKey.dominanceLow : 0;

  if (distanceHigh <= distanceLow) {
    return false;
  }

  let didChange = false;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const dominance = blue - Math.max(red, green);

    if (blue < minBlue || dominance < dominanceLow) {
      continue;
    }

    const distance = Math.sqrt(
      ((red - targetRed) ** 2) +
      ((green - targetGreen) ** 2) +
      ((blue - targetBlue) ** 2)
    );

    if (distance <= distanceLow) {
      pixels[index + 3] = 0;
      didChange = true;
      continue;
    }

    if (distance < distanceHigh) {
      let alpha = (distance - distanceLow) / Math.max(1, distanceHigh - distanceLow);
      if (alphaGamma) {
        alpha = Math.pow(alpha, alphaGamma);
      }
      pixels[index + 3] = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
      didChange = true;
    }
  }

  return didChange;
}

function sortVideoSourcesForCurrentBrowser(sources = [], video) {
  const normalizedSources = (Array.isArray(sources) ? sources : []).filter(Boolean);
  const browser = vrHeroBrowserProfile;
  const playable = normalizedSources.map((source, index) => {
    const type = source.type || getVideoMimeType(source.src || '');
    const supportScore = video && type && typeof video.canPlayType === 'function'
      ? video.canPlayType(type)
      : '';
    const supportRank = supportScore === 'probably' ? 2 : supportScore === 'maybe' ? 1 : 0;
    let browserBias = 0;

    if (browser.isSafari || browser.isIOS) {
      browserBias = type === 'video/mp4' ? 20 : type === 'video/webm' ? -20 : 0;
    } else if (browser.isChromium) {
      browserBias = type === 'video/webm' ? 20 : type === 'video/mp4' ? 5 : 0;
    } else {
      browserBias = type === 'video/mp4' ? 10 : type === 'video/webm' ? 6 : 0;
    }

    return {
      ...source,
      type,
      supportRank,
      browserBias,
      originalIndex: index
    };
  });

  return playable
    .sort((a, b) => {
      if (b.supportRank !== a.supportRank) return b.supportRank - a.supportRank;
      if (b.browserBias !== a.browserBias) return b.browserBias - a.browserBias;
      return a.originalIndex - b.originalIndex;
    })
    .map(({ supportRank, browserBias, originalIndex, ...source }) => source);
}

function setVideoElementSource(video, source) {
  if (!video || !source || !source.src) return false;
  const src = normalizeImagePath(source.src);
  const type = source.type || getVideoMimeType(src);
  const sourceKey = JSON.stringify([{ src, type }]);

  if ((video.dataset.sourceKey || '') === sourceKey && (video.dataset.currentSrc || '') === src) {
    vrHeroDiagnostics.sourceSkips += 1;
    return false;
  }

  pauseVrHeroVideo(video);
  video.innerHTML = '';
  video.removeAttribute('src');
  if (type) {
    video.setAttribute('type', type);
  } else {
    video.removeAttribute('type');
  }
  video.src = src;
  video.dataset.currentSrc = src;
  video.dataset.sourceKey = sourceKey;
  video.preload = 'metadata';
  vrHeroDiagnostics.sourceSets += 1;
  pushVrHeroDiagnostic('source-set', { src, type: type || '' });
  return true;
}

function buildVideoSourceList(...sources) {
  return sources
    .map((source) => {
      const src = normalizeImagePath(source);
      if (!src) return null;
      const type = getVideoMimeType(src);
      return type ? { src, type } : { src };
    })
    .filter(Boolean);
}

function setVideoElementSources(video, sources = []) {
  if (!video) return false;

  const normalizedSources = (Array.isArray(sources) ? sources : [])
    .map((source) => {
      if (typeof source === 'string') {
        const src = normalizeImagePath(source);
        return src ? { src, type: getVideoMimeType(src) } : null;
      }
      if (!source || typeof source !== 'object') return null;
      const src = normalizeImagePath(source.src || '');
      if (!src) return null;
      return {
        src,
        type: source.type || getVideoMimeType(src)
      };
    })
    .filter(Boolean);

  const orderedSources = sortVideoSourcesForCurrentBrowser(normalizedSources, video);
  const primarySource = orderedSources[0] || null;
  const fallbackSource = orderedSources[1] || null;
  if (!primarySource) {
    return false;
  }

  const didChange = setVideoElementSource(video, primarySource);
  if (!didChange) return false;

  video.dataset.fallbackSrc = fallbackSource ? fallbackSource.src : '';
  video.dataset.fallbackType = fallbackSource ? (fallbackSource.type || getVideoMimeType(fallbackSource.src)) : '';
  video.dataset.failedPrimary = '';
  return true;
}

const VR_HERO_RESPONSIVE_MIN_WIDTH = 390;
const VR_HERO_RESPONSIVE_MAX_WIDTH = 1440;

function interpolateNumber(start, end, progress) {
  return start + ((end - start) * progress);
}

function getVrHeroResponsiveViewportProgress() {
  const viewportWidth = Math.max(
    VR_HERO_RESPONSIVE_MIN_WIDTH,
    Math.round(window.innerWidth || document.documentElement.clientWidth || VR_HERO_RESPONSIVE_MIN_WIDTH)
  );
  return clampNumber(
    (viewportWidth - VR_HERO_RESPONSIVE_MIN_WIDTH) / Math.max(1, VR_HERO_RESPONSIVE_MAX_WIDTH - VR_HERO_RESPONSIVE_MIN_WIDTH),
    0,
    1
  );
}

function resolveVrHeroResponsiveLayerConfig(layerConfig = {}) {
  const resolvedConfig = {
    ...(layerConfig || {})
  };
  const responsiveProgress = getVrHeroResponsiveViewportProgress();

  [
    ['scaleBoost', 'mobileScaleBoost'],
    ['sourceInset', 'mobileSourceInset'],
    ['drawInset', 'mobileDrawInset'],
    ['offsetX', 'mobileOffsetX'],
    ['offsetY', 'mobileOffsetY']
  ].forEach(([desktopProp, mobileProp]) => {
    if (typeof resolvedConfig[desktopProp] !== 'number' || typeof resolvedConfig[mobileProp] !== 'number') {
      return;
    }

    resolvedConfig[desktopProp] = interpolateNumber(
      resolvedConfig[mobileProp],
      resolvedConfig[desktopProp],
      responsiveProgress
    );
  });

  return resolvedConfig;
}

function applyVrHeroLayerAsset(layerKey, layerConfig = {}) {
  const layer = vrHero.layers[layerKey];
  if (!layer) return false;

  const nextConfig = {
    ...(vrHeroLayerDefaults[layerKey] || {}),
    ...resolveVrHeroResponsiveLayerConfig(layerConfig)
  };

  let didChange = false;
  const syncProp = (prop) => {
    if (layer[prop] === nextConfig[prop]) return;
    layer[prop] = nextConfig[prop];
    didChange = true;
  };

  [
    'alphaMode',
    'scaleBoost',
    'sourceInset',
    'drawInset',
    'offsetX',
    'offsetY',
    'keyLow',
    'keyHigh',
    'mp4Fallback',
    'alphaGamma',
    'alphaErodeIterations',
    'edgeFeather',
    'edgeSoftFeather',
    'edgeSoftAlphaMax',
    'edgeMatteColor',
    'edgeMatteStrength',
    'edgeMatteMaxAlpha',
    'clipWhiteLow',
    'clipWhiteHigh',
    'whiteKeyLow',
    'whiteKeyHigh'
  ].forEach(syncProp);

  if (setVideoElementSources(layer.video, nextConfig.sources || [])) {
    didChange = true;
  }

  layer.assetTransitionId = vrHero.transitionId;

  if (didChange) {
    layer.loadToken = '';
    stopVrHeroLayer(layer);
    clearVrHeroLayer(layer);
  }

  return didChange;
}

function getVrHeroShowcaseConfig(categoryId) {
  const normalizedCategoryId = normalizeCategoryId(categoryId);
  return vrHeroShowcaseConfig[normalizedCategoryId] || null;
}

function isVrArShowcaseCategory(categoryId) {
  return normalizeCategoryId(categoryId) === 'vr-ar';
}

function isCurrentVrHeroLayer(layer) {
  if (!layer) return false;
  return (layer.assetTransitionId || 0) === vrHero.transitionId;
}

function hasVrHeroTransitionSnapshot() {
  return Boolean(vrHero.transitionSnapshotVisible && vrHero.transitionCanvas && vrHero.transitionContext);
}

function syncVrHeroMediaOpacity() {
  const hasTransitionSnapshot = hasVrHeroTransitionSnapshot();
  const transitionIsFading = Boolean(
    hasTransitionSnapshot &&
    vrHero.showcase &&
    vrHero.showcase.classList.contains('vr-showcase-transition-fading')
  );
  const activeLayerKey = getActiveVrHeroLayerKey();

  Object.entries(vrHero.layers).forEach(([layerKey, layer]) => {
    if (!layer || !layer.media) return;

    let targetOpacity = 0;
    if (vrHero.active && layerKey === activeLayerKey) {
      if (hasTransitionSnapshot) {
        targetOpacity = transitionIsFading && vrHero.frameReady ? 1 : 0;
      } else if (vrHero.frameReady) {
        targetOpacity = 1;
      }
    }

    layer.media.style.opacity = String(targetOpacity);
  });
}

function clearVrHeroTransitionSnapshot(syncMedia = false) {
  if (vrHero.transitionClearTimer) {
    clearTimeout(vrHero.transitionClearTimer);
    vrHero.transitionClearTimer = 0;
  }

  vrHero.transitionSnapshotVisible = false;

  if (vrHero.showcase) {
    vrHero.showcase.classList.remove('vr-showcase-transition-active', 'vr-showcase-transition-fading');
  }

  if (vrHero.transitionCanvas && vrHero.transitionContext) {
    vrHero.transitionContext.clearRect(0, 0, vrHero.transitionCanvas.width, vrHero.transitionCanvas.height);
  }

  if (syncMedia) {
    syncVrHeroMediaOpacity();
  }
}

function captureVrHeroTransitionSnapshot() {
  if (!vrHero.transitionCanvas || !vrHero.transitionContext || !vrHero.frameReady) {
    clearVrHeroTransitionSnapshot();
    return false;
  }

  const activeLayer = vrHero.layers[getActiveVrHeroLayerKey()];
  if (!activeLayer || !activeLayer.canvas || !activeLayer.canvas.width || !activeLayer.canvas.height) {
    clearVrHeroTransitionSnapshot();
    return false;
  }

  clearVrHeroTransitionSnapshot();

  vrHero.transitionCanvas.width = activeLayer.canvas.width;
  vrHero.transitionCanvas.height = activeLayer.canvas.height;
  vrHero.transitionContext.clearRect(0, 0, vrHero.transitionCanvas.width, vrHero.transitionCanvas.height);
  vrHero.transitionContext.drawImage(
    activeLayer.canvas,
    0,
    0,
    activeLayer.canvas.width,
    activeLayer.canvas.height,
    0,
    0,
    vrHero.transitionCanvas.width,
    vrHero.transitionCanvas.height
  );
  vrHero.transitionSnapshotVisible = true;

  if (vrHero.showcase) {
    vrHero.showcase.classList.add('vr-showcase-transition-active');
    vrHero.showcase.classList.remove('vr-showcase-transition-fading');
  }

  syncVrHeroMediaOpacity();
  return true;
}

function fadeVrHeroTransitionSnapshot() {
  if (!hasVrHeroTransitionSnapshot()) return;

  if (vrHero.transitionClearTimer) {
    clearTimeout(vrHero.transitionClearTimer);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!hasVrHeroTransitionSnapshot() || !vrHero.showcase) return;
      vrHero.showcase.classList.add('vr-showcase-transition-fading');
      syncVrHeroMediaOpacity();
    });
  });

  vrHero.transitionClearTimer = window.setTimeout(() => {
    clearVrHeroTransitionSnapshot(true);
  }, 460);
}

function setVrHeroFrameReady(isReady) {
  const wasReady = vrHero.frameReady;
  const hasTransitionSnapshot = hasVrHeroTransitionSnapshot();
  vrHero.frameReady = Boolean(isReady);
  if (!vrHero.section) return;
  const shouldShowcaseStayVisible = Boolean(vrHero.active || hasTransitionSnapshot);
  vrHero.section.classList.toggle('vr-showcase-active', shouldShowcaseStayVisible);
  vrHero.section.classList.toggle('vr-showcase-pending', !vrHero.frameReady && vrHero.active && !hasTransitionSnapshot);
  if (vrHero.showcase) {
    vrHero.showcase.setAttribute('aria-hidden', shouldShowcaseStayVisible ? 'false' : 'true');
  }
  if (!vrHero.active && !vrHero.frameReady && !hasTransitionSnapshot) {
    resetVrHeroScrollStyles();
  }
  if (!wasReady && vrHero.frameReady && hasTransitionSnapshot) {
    fadeVrHeroTransitionSnapshot();
  }
  syncVrHeroMediaOpacity();
}

function configureVrHeroShowcase(categoryId) {
  const normalizedCategoryId = normalizeCategoryId(categoryId);
  const config = getVrHeroShowcaseConfig(normalizedCategoryId);
  if (!config) return false;

  let didChange = vrHero.activeCategory !== normalizedCategoryId;

  if (vrHero.kicker && vrHero.kicker.textContent !== config.kicker) {
    vrHero.kicker.textContent = config.kicker;
    didChange = true;
  }

  if (vrHero.caption && vrHero.caption.textContent !== config.caption) {
    vrHero.caption.textContent = config.caption;
    didChange = true;
  }

  Object.entries(config.layers || {}).forEach(([layerKey, layerConfig]) => {
    if (applyVrHeroLayerAsset(layerKey, layerConfig)) {
      didChange = true;
    }
  });

  vrHero.activeCategory = normalizedCategoryId;
  return didChange;
}

function syncVrHeroLayerSize(layer) {
  if (!layer || !layer.canvas || !layer.video || !layer.video.videoWidth || !layer.video.videoHeight) {
    return false;
  }

  const rect = layer.canvas.getBoundingClientRect();
  const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 1.5));
  const targetWidth = Math.max(1, Math.round(rect.width * pixelRatio));
  const targetHeight = Math.max(1, Math.round(rect.height * pixelRatio));

  if (layer.canvas.width !== targetWidth || layer.canvas.height !== targetHeight) {
    layer.canvas.width = targetWidth;
    layer.canvas.height = targetHeight;
  }

  return true;
}

function drawVideoCentered(context, video, canvas, scaleBoost = 1, sourceInset = 0, drawInset = 0, offsetX = 0, offsetY = 0) {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  const safeInset = Math.max(0, Math.min(sourceInset || 0, Math.floor((videoWidth - 2) / 2), Math.floor((videoHeight - 2) / 2)));
  const sourceWidth = Math.max(1, videoWidth - (safeInset * 2));
  const sourceHeight = Math.max(1, videoHeight - (safeInset * 2));
  const baseScale = Math.min(canvasWidth / videoWidth, canvasHeight / videoHeight);
  const scale = baseScale * scaleBoost;
  const rawDrawWidth = videoWidth * scale;
  const rawDrawHeight = videoHeight * scale;
  const insetPixels = Math.max(0, drawInset || 0);
  const drawWidth = Math.max(1, rawDrawWidth - (insetPixels * 2));
  const drawHeight = Math.max(1, rawDrawHeight - (insetPixels * 2));
  const drawOffsetX = ((canvasWidth - rawDrawWidth) * 0.5) + insetPixels + (Number.isFinite(offsetX) ? offsetX : 0);
  const drawOffsetY = ((canvasHeight - rawDrawHeight) * 0.5) + insetPixels + (Number.isFinite(offsetY) ? offsetY : 0);

  context.drawImage(video, safeInset, safeInset, sourceWidth, sourceHeight, drawOffsetX, drawOffsetY, drawWidth, drawHeight);
}

function stopVrHeroLayer(layer) {
  if (!layer || layer.requestId == null) return;

  if (layer.requestType === 'video' && layer.video && typeof layer.video.cancelVideoFrameCallback === 'function') {
    layer.video.cancelVideoFrameCallback(layer.requestId);
  } else {
    cancelAnimationFrame(layer.requestId);
  }

  layer.requestId = null;
  layer.requestType = '';
}

function clearVrHeroLayer(layer) {
  if (!layer || !layer.context || !layer.canvas) return;
  layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
}

function captureVrHeroAlpha(pixels) {
  const pixelCount = pixels.length / 4;
  const alpha = new Uint8ClampedArray(pixelCount);

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    alpha[pixelIndex] = pixels[(pixelIndex * 4) + 3];
  }

  return alpha;
}

function applyVrHeroAlphaErode(alphaSource, width, height, iterations = 0) {
  if (!iterations || width <= 2 || height <= 2) {
    return alphaSource;
  }

  let current = alphaSource;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const next = new Uint8ClampedArray(current);

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const pixelIndex = (y * width) + x;
        const alpha = current[pixelIndex];

        if (!alpha) {
          next[pixelIndex] = 0;
          continue;
        }

        next[pixelIndex] = Math.min(
          alpha,
          current[pixelIndex - 1],
          current[pixelIndex + 1],
          current[pixelIndex - width],
          current[pixelIndex + width],
          current[pixelIndex - width - 1],
          current[pixelIndex - width + 1],
          current[pixelIndex + width - 1],
          current[pixelIndex + width + 1]
        );
      }
    }

    current = next;
  }

  return current;
}

function drawVrHeroLayer(layer) {
  if (!vrHero.active || !layer || !layer.context || !layer.video || !isCurrentVrHeroLayer(layer)) {
    return false;
  }

  if (!syncVrHeroLayerSize(layer)) {
    return false;
  }

  const effectiveAlphaMode = getVrHeroEffectiveAlphaMode(layer);
  const mp4FallbackConfig = getVrHeroMp4FallbackConfig(layer);
  const fallbackSourceInset = getVrHeroMp4FallbackNumber(mp4FallbackConfig, 'sourceInset');
  const fallbackDrawInset = getVrHeroMp4FallbackNumber(mp4FallbackConfig, 'drawInset');
  const renderSourceInset = fallbackSourceInset != null
    ? fallbackSourceInset
    : (layer.sourceInset || 0);
  const renderDrawInset = fallbackDrawInset != null
    ? fallbackDrawInset
    : (layer.drawInset || 0);

  layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
  drawVideoCentered(
    layer.context,
    layer.video,
    layer.canvas,
    layer.scaleBoost || 1,
    renderSourceInset,
    renderDrawInset,
    layer.offsetX || 0,
    layer.offsetY || 0
  );

  if (getActiveVrHeroLayerKey() === (layer.video === vrHero.layers.light.video ? 'light' : 'dark')) {
    setVrHeroFrameReady(true);
  }

  const imageData = layer.context.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
  const pixels = imageData.data;
  const fallbackKeyLow = getVrHeroMp4FallbackNumber(mp4FallbackConfig, 'keyLow');
  const fallbackKeyHigh = getVrHeroMp4FallbackNumber(mp4FallbackConfig, 'keyHigh');
  const fallbackAlphaGamma = getVrHeroMp4FallbackNumber(mp4FallbackConfig, 'alphaGamma');
  const fallbackAlphaErodeIterations = getVrHeroMp4FallbackNumber(mp4FallbackConfig, 'alphaErodeIterations');
  const fallbackEdgeFeather = getVrHeroMp4FallbackNumber(mp4FallbackConfig, 'edgeFeather');
  const fallbackEdgeSoftFeather = getVrHeroMp4FallbackNumber(mp4FallbackConfig, 'edgeSoftFeather');
  const fallbackEdgeSoftAlphaMax = getVrHeroMp4FallbackNumber(mp4FallbackConfig, 'edgeSoftAlphaMax');
  const keyLow = fallbackKeyLow != null ? fallbackKeyLow : layer.keyLow;
  const keyHigh = fallbackKeyHigh != null ? fallbackKeyHigh : layer.keyHigh;
  const alphaGamma = fallbackAlphaGamma != null ? fallbackAlphaGamma : layer.alphaGamma;
  const alphaErodeIterations = fallbackAlphaErodeIterations != null ? fallbackAlphaErodeIterations : layer.alphaErodeIterations;
  const edgeFeather = fallbackEdgeFeather != null ? fallbackEdgeFeather : layer.edgeFeather;
  const edgeSoftFeather = fallbackEdgeSoftFeather != null ? fallbackEdgeSoftFeather : (layer.edgeSoftFeather || 0.54);
  const edgeSoftAlphaMax = fallbackEdgeSoftAlphaMax != null ? fallbackEdgeSoftAlphaMax : (layer.edgeSoftAlphaMax || 188);

  if (effectiveAlphaMode === 'source-alpha' && layer.clipWhiteHigh > 0) {
    const clipLow = layer.clipWhiteLow || Math.max(0, layer.clipWhiteHigh - 3);
    const clipHigh = layer.clipWhiteHigh;

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const whiteness = Math.min(red, green, blue);

      if (whiteness >= clipHigh) {
        pixels[index + 3] = 0;
        continue;
      }

      if (whiteness > clipLow) {
        const alphaFactor = 1 - ((whiteness - clipLow) / Math.max(1, clipHigh - clipLow));
        pixels[index + 3] = Math.round(pixels[index + 3] * Math.max(0, Math.min(1, alphaFactor)));
      }
    }
  }

  if (effectiveAlphaMode !== 'source-alpha') {
    const usedColorKey =
      effectiveAlphaMode === 'luma-key' &&
      Boolean(mp4FallbackConfig && mp4FallbackConfig.colorKey) &&
      applyVrHeroMp4ColorKey(pixels, mp4FallbackConfig, alphaGamma);

    if (!usedColorKey) {
      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const brightness = Math.max(red, green, blue);

        if (effectiveAlphaMode === 'white-key') {
          const whiteness = Math.min(red, green, blue);

          if (whiteness >= layer.whiteKeyHigh) {
            pixels[index + 3] = 0;
            continue;
          }

          if (whiteness > layer.whiteKeyLow) {
            const alpha = 1 - ((whiteness - layer.whiteKeyLow) / Math.max(1, layer.whiteKeyHigh - layer.whiteKeyLow));
            pixels[index + 3] = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
          }

          continue;
        }

        if (brightness <= keyLow) {
          pixels[index + 3] = 0;
          continue;
        }

        if (brightness < keyHigh) {
          let alpha = (brightness - keyLow) / Math.max(1, keyHigh - keyLow);
          if (alphaGamma) {
            alpha = Math.pow(alpha, alphaGamma);
          }
          pixels[index + 3] = Math.round(alpha * 255);
          continue;
        }
      }
    }
  }

  const width = layer.canvas.width;
  const height = layer.canvas.height;
  let alphaSnapshot = captureVrHeroAlpha(pixels);

  if (
    effectiveAlphaMode === 'source-alpha' &&
    layer.edgeMatteColor &&
    layer.edgeMatteStrength &&
    width > 2 &&
    height > 2
  ) {
    const matte = layer.edgeMatteColor;
    const maxAlpha = layer.edgeMatteMaxAlpha || 204;

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const pixelIndex = (y * width) + x;
        const alpha = alphaSnapshot[pixelIndex];
        if (!alpha || alpha > maxAlpha) continue;

        const hasTransparentNeighbor =
          alphaSnapshot[pixelIndex - 1] === 0 ||
          alphaSnapshot[pixelIndex + 1] === 0 ||
          alphaSnapshot[pixelIndex - width] === 0 ||
          alphaSnapshot[pixelIndex + width] === 0 ||
          alphaSnapshot[pixelIndex - width - 1] === 0 ||
          alphaSnapshot[pixelIndex - width + 1] === 0 ||
          alphaSnapshot[pixelIndex + width - 1] === 0 ||
          alphaSnapshot[pixelIndex + width + 1] === 0;

        if (!hasTransparentNeighbor) continue;

        const rgbaIndex = pixelIndex * 4;
        const strength = layer.edgeMatteStrength * (1 - (alpha / Math.max(1, maxAlpha)));
        pixels[rgbaIndex] = Math.round((pixels[rgbaIndex] * (1 - strength)) + (matte.r * strength));
        pixels[rgbaIndex + 1] = Math.round((pixels[rgbaIndex + 1] * (1 - strength)) + (matte.g * strength));
        pixels[rgbaIndex + 2] = Math.round((pixels[rgbaIndex + 2] * (1 - strength)) + (matte.b * strength));
      }
    }
  }

  if (alphaErodeIterations) {
    alphaSnapshot = applyVrHeroAlphaErode(alphaSnapshot, width, height, alphaErodeIterations);

    for (let pixelIndex = 0; pixelIndex < alphaSnapshot.length; pixelIndex += 1) {
      pixels[(pixelIndex * 4) + 3] = alphaSnapshot[pixelIndex];
    }
  }

  if (edgeFeather && layer.canvas.width > 2 && layer.canvas.height > 2) {
    alphaSnapshot = captureVrHeroAlpha(pixels);

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const pixelIndex = (y * width) + x;
        const alpha = alphaSnapshot[pixelIndex];

        if (!alpha) continue;

        const hasTransparentNeighbor =
          alphaSnapshot[pixelIndex - 1] === 0 ||
          alphaSnapshot[pixelIndex + 1] === 0 ||
          alphaSnapshot[pixelIndex - width] === 0 ||
          alphaSnapshot[pixelIndex + width] === 0 ||
          alphaSnapshot[pixelIndex - width - 1] === 0 ||
          alphaSnapshot[pixelIndex - width + 1] === 0 ||
          alphaSnapshot[pixelIndex + width - 1] === 0 ||
          alphaSnapshot[pixelIndex + width + 1] === 0;

        if (!hasTransparentNeighbor) continue;

        const featherAmount = alpha <= edgeSoftAlphaMax
          ? edgeSoftFeather
          : edgeFeather;

        pixels[(pixelIndex * 4) + 3] = Math.round(alpha * featherAmount);
      }
    }
  }

  layer.context.putImageData(imageData, 0, 0);
  return true;
}

function queueVrHeroLayer(layer) {
  if (!vrHero.active || !layer || !layer.video || !isCurrentVrHeroLayer(layer)) {
    stopVrHeroLayer(layer);
    return;
  }

  const loop = () => {
    layer.requestId = null;
    layer.requestType = '';

    if (!vrHero.active || !isCurrentVrHeroLayer(layer) || !layer.video || layer.video.paused || layer.video.ended) {
      return;
    }

    drawVrHeroLayer(layer);
    queueVrHeroLayer(layer);
  };

  if (typeof layer.video.requestVideoFrameCallback === 'function') {
    layer.requestType = 'video';
    layer.requestId = layer.video.requestVideoFrameCallback(loop);
    return;
  }

  layer.requestType = 'raf';
  layer.requestId = requestAnimationFrame(loop);
}

function startVrHeroLayer(layer) {
  if (!vrHero.active || !layer || !layer.video || !layer.context || !isCurrentVrHeroLayer(layer)) return;
  stopVrHeroLayer(layer);

  if (!drawVrHeroLayer(layer)) {
    layer.requestType = 'raf';
    layer.requestId = requestAnimationFrame(() => {
      layer.requestId = null;
      layer.requestType = '';
      startVrHeroLayer(layer);
    });
    return;
  }

  queueVrHeroLayer(layer);
}

function safelySetVrHeroTime(video, nextTime = 0) {
  if (!video) return;
  try {
    video.currentTime = nextTime;
  } catch (error) {
    /* Ignore until the video becomes seekable. */
  }
}

function primeVrHeroVideo(video) {
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  if (!video.preload) {
    video.preload = 'metadata';
  }
}

function ensureVrHeroLayerReady(layer, options = {}) {
  if (!layer || !layer.video) return;
  const eager = Boolean(options.eager);
  const preserveVrArBehavior = Boolean(options.preserveVrArBehavior);
  const targetReadyState = eager ? 2 : 1;
  primeVrHeroVideo(layer.video);
  layer.video.preload = preserveVrArBehavior ? 'auto' : (eager ? 'auto' : 'metadata');
  if (layer.video.readyState >= targetReadyState) {
    vrHeroDiagnostics.loadSkips += 1;
    return;
  }
  const currentSrc = normalizeImagePath(layer.video.currentSrc || layer.video.src || layer.video.dataset.currentSrc || '');
  const loadToken = `${vrHero.transitionId}|${currentSrc}|${targetReadyState}|${preserveVrArBehavior ? 1 : 0}`;
  if (layer.loadToken === loadToken) {
    vrHeroDiagnostics.loadSkips += 1;
    return;
  }
  layer.loadToken = loadToken;
  try {
    vrHeroDiagnostics.loadCalls += 1;
    pushVrHeroDiagnostic('video-load', { src: currentSrc, eager, preserveVrArBehavior });
    layer.video.load();
  } catch (error) {
    /* Ignore load errors and let the browser keep buffering. */
  }
}

function clearVrHeroDeferredWarmup() {
  if (!vrHero.deferredWarmupTimer) return;
  clearTimeout(vrHero.deferredWarmupTimer);
  vrHero.deferredWarmupTimer = 0;
}

function warmInactiveVrHeroLayer() {
  clearVrHeroDeferredWarmup();
  if (!vrHero.active) return;
  if (!vrHero.frameReady) return;
  if (isVrArShowcaseCategory(vrHero.activeCategory)) return;
  const inactiveLayerKey = getActiveVrHeroLayerKey() === 'light' ? 'dark' : 'light';
  const inactiveLayer = vrHero.layers[inactiveLayerKey];
  if (!inactiveLayer) return;
  vrHero.deferredWarmupTimer = window.setTimeout(() => {
    vrHero.deferredWarmupTimer = 0;
    if (!vrHero.active) return;
    ensureVrHeroLayerReady(inactiveLayer, { eager: false });
  }, 320);
}

function resetVrHeroLayerPlayback(layer) {
  if (!layer) return;
  stopVrHeroLayer(layer);
  pauseVrHeroVideo(layer.video);
  safelySetVrHeroTime(layer.video, 0);
  clearVrHeroLayer(layer);
  layer.assetTransitionId = 0;
  layer.loadToken = '';
}

function fallbackVrHeroVideoSource(layer) {
  if (!layer || !layer.video || !isCurrentVrHeroLayer(layer)) return false;
  const fallbackSrc = normalizeImagePath(layer.video.dataset.fallbackSrc || '');
  if (!fallbackSrc) return false;
  if ((layer.video.dataset.failedPrimary || '') === fallbackSrc) return false;

  const fallbackType = layer.video.dataset.fallbackType || getVideoMimeType(fallbackSrc);
  layer.video.dataset.failedPrimary = fallbackSrc;
  const didChange = setVideoElementSource(layer.video, { src: fallbackSrc, type: fallbackType });
  if (!didChange) return false;

  vrHeroDiagnostics.fallbackSwitches += 1;
  pushVrHeroDiagnostic('video-fallback', { src: fallbackSrc, type: fallbackType || '' });
  ensureVrHeroLayerReady(layer, { eager: true, preserveVrArBehavior: isVrArShowcaseCategory(vrHero.activeCategory) });
  if (vrHero.playbackMode === 'playing') {
    playVrHeroVideo(layer.video);
  }
  return true;
}

function resetAllVrHeroLayers() {
  Object.values(vrHero.layers).forEach((layer) => resetVrHeroLayerPlayback(layer));
}

function playVrHeroVideo(video) {
  if (!video) return;
  if (video.readyState < 2) {
    vrHeroDiagnostics.playSkips += 1;
    return false;
  }
  vrHeroDiagnostics.playCalls += 1;
  pushVrHeroDiagnostic('video-play', { src: normalizeImagePath(video.currentSrc || video.src || '') });
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {});
  }
  return true;
}

function pauseVrHeroVideo(video) {
  if (!video) return;
  video.pause();
}

function getVrHeroViewportSettings() {
  if (window.innerWidth <= 480) {
    return {
      openHeight: 390,
      marginTop: -60,
      marginBottom: -8,
      copyMarginTop: -16,
      collapseDistance: 96,
      translateY: 28,
      blurMax: 8,
      sectionPaddingBottom: 8
    };
  }

  if (window.innerWidth <= 768) {
    return {
      openHeight: 500,
      marginTop: -92,
      marginBottom: 8,
      copyMarginTop: -14,
      collapseDistance: 112,
      translateY: 34,
      blurMax: 9,
      sectionPaddingBottom: 14
    };
  }

  if (window.innerWidth <= 1100) {
    return {
      openHeight: 580,
      marginTop: -126,
      marginBottom: 4,
      copyMarginTop: -46,
      collapseDistance: 120,
      translateY: 36,
      blurMax: 9.5,
      sectionPaddingBottom: 12
    };
  }

  return {
    openHeight: 680,
    marginTop: -172,
    marginBottom: -4,
    copyMarginTop: -96,
    collapseDistance: 128,
    translateY: 40,
    blurMax: 10,
    sectionPaddingBottom: 8
  };
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getActiveVrHeroLayerKey() {
  return getActiveTheme() === 'light' ? 'light' : 'dark';
}

function getVrHeroCollapsedTop() {
  const settings = getVrHeroViewportSettings();
  return Math.max(0, Math.round(settings.collapseDistance));
}

function setVrHeroStage(nextStage) {
  const stage = nextStage === 'video' ? 'video' : nextStage === 'free' ? 'free' : 'collapsed';
  vrHero.stage = stage;

  if (vrHero.section) {
    vrHero.section.classList.toggle('vr-showcase-collapsed', stage !== 'video');
  }

  if (stage === 'video') {
    vrHero.released = false;
    vrHero.searchHoldUntil = 0;
    vrHero.searchTargetTop = 0;
    return;
  }

  vrHero.released = true;
  vrHero.searchTargetTop = getVrHeroCollapsedTop();
}

function clearVrHeroSnapLock() {
  if (vrHero.snapTimer) {
    clearTimeout(vrHero.snapTimer);
    vrHero.snapTimer = 0;
  }
  vrHero.snapLock = false;
}

function beginVrHeroSnapLock(duration = 560) {
  if (vrHero.snapTimer) {
    clearTimeout(vrHero.snapTimer);
  }
  vrHero.snapLock = true;
  vrHero.snapTimer = window.setTimeout(() => {
    vrHero.snapLock = false;
    vrHero.snapTimer = 0;
  }, duration);
}

function snapVrHeroToCollapsed() {
  setVrHeroStage('collapsed');
  vrHero.searchHoldUntil = 0;
  beginVrHeroSnapLock(160);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function snapVrHeroToTop() {
  setVrHeroStage('video');
  if (!(vrHeroReducedMotionQuery && vrHeroReducedMotionQuery.matches)) {
    setVrHeroPlaybackMode('playing', { force: true });
  }
  beginVrHeroSnapLock();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function maybeSnapVrHeroByScroll(scrollTop) {
  if (!vrHero.active) return;

  const collapsedTop = getVrHeroCollapsedTop();
  vrHero.searchTargetTop = collapsedTop;

  if (vrHero.stage === 'free' && scrollTop <= 6 && !vrHero.snapLock) {
    setVrHeroStage('collapsed');
  }
}

function shouldHandleVrHeroGesture() {
  return Boolean(vrHero.active && vrHero.section && vrHero.showcase);
}

function handleVrHeroDirectionalGesture(direction, event) {
  if (!shouldHandleVrHeroGesture()) return false;

  const scrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
  const collapsedTop = getVrHeroCollapsedTop();
  vrHero.searchTargetTop = collapsedTop;

  if (direction > 0) {
    if (vrHero.stage === 'video') {
      if (event) event.preventDefault();
      snapVrHeroToCollapsed();
      return true;
    }

    if (vrHero.stage === 'collapsed') {
      setVrHeroStage('free');
      return false;
    }

    return false;
  }

  if (direction < 0) {
    if (vrHero.stage === 'free' && scrollTop <= 6 && !vrHero.snapLock) {
      if (event) event.preventDefault();
      snapVrHeroToTop();
      return true;
    }

    if (vrHero.stage === 'collapsed') {
      if (event) event.preventDefault();
      snapVrHeroToTop();
      return true;
    }
  }

  return false;
}

function resetVrHeroScrollStyles() {
  if (!vrHero.showcase || !vrHero.copy || !vrHero.section) return;
  vrHero.scrollProgress = 0;
  vrHero.showcase.style.removeProperty('max-height');
  vrHero.showcase.style.removeProperty('opacity');
  vrHero.showcase.style.removeProperty('transform');
  vrHero.showcase.style.removeProperty('filter');
  vrHero.showcase.style.removeProperty('margin-top');
  vrHero.showcase.style.removeProperty('margin-bottom');
  vrHero.copy.style.removeProperty('margin-top');
  vrHero.copy.style.removeProperty('transform');
  vrHero.copy.style.removeProperty('opacity');
  vrHero.section.style.removeProperty('padding-bottom');
}

function setVrHeroPlaybackMode(mode, options = {}) {
  const nextMode = mode || 'inactive';
  const activeLayerKey = getActiveVrHeroLayerKey();
  const force = Boolean(options.force);
  const activeLayer = vrHero.layers[activeLayerKey];
  const activeVideo = activeLayer && activeLayer.video;
  const needsPlayRetry =
    nextMode === 'playing' &&
    activeVideo &&
    (activeVideo.paused || activeVideo.readyState < 2);

  if (!force && !needsPlayRetry && vrHero.playbackMode === nextMode && vrHero.playbackLayerKey === activeLayerKey) {
    return;
  }

  Object.entries(vrHero.layers).forEach(([layerKey, layer]) => {
    stopVrHeroLayer(layer);
    pauseVrHeroVideo(layer.video);

    if (nextMode === 'inactive') {
      safelySetVrHeroTime(layer.video, 0);
      clearVrHeroLayer(layer);
      return;
    }

    if (layerKey !== activeLayerKey) {
      clearVrHeroLayer(layer);
      return;
    }

    ensureVrHeroLayerReady(layer);

    if (nextMode === 'poster') {
      safelySetVrHeroTime(layer.video, 0);
      if (!drawVrHeroLayer(layer)) {
        layer.requestType = 'raf';
        layer.requestId = requestAnimationFrame(() => {
          layer.requestId = null;
          layer.requestType = '';
          if (vrHero.active && vrHero.playbackMode === 'poster') {
            drawVrHeroLayer(layer);
          }
        });
      }
      return;
    }

    if (nextMode === 'playing') {
      if (Number.isFinite(layer.video.duration) && layer.video.duration > 0 && layer.video.currentTime >= layer.video.duration - 0.08) {
        safelySetVrHeroTime(layer.video, 0);
      }
      if (playVrHeroVideo(layer.video)) {
        startVrHeroLayer(layer);
      }
    }
  });

  vrHero.playbackMode = nextMode;
  vrHero.playbackLayerKey = activeLayerKey;
}

function isVrHeroShowcaseVisible() {
  if (!vrHero.showcase) return false;
  const rect = vrHero.showcase.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  return rect.bottom > 72 && rect.top < viewportHeight * 0.92;
}

function syncVrHeroScrollState() {
  if (!vrHero.section || !vrHero.showcase || !vrHero.copy) return;

  if (!vrHero.active) {
    vrHero.lastScrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
    setVrHeroStage('video');
    setVrHeroPlaybackMode('inactive');
    resetVrHeroScrollStyles();
    return;
  }

  const hasTransitionSnapshot = hasVrHeroTransitionSnapshot();

  if (!vrHero.frameReady) {
    vrHero.lastScrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
    setVrHeroStage('video');
    if (!hasTransitionSnapshot) {
      resetVrHeroScrollStyles();
    }
    if (!(vrHeroReducedMotionQuery && vrHeroReducedMotionQuery.matches)) {
      setVrHeroPlaybackMode('playing', { force: true });
    }
    return;
  }

  const settings = getVrHeroViewportSettings();
  const reducedMotion = Boolean(vrHeroReducedMotionQuery && vrHeroReducedMotionQuery.matches);
  const scrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
  const startedCollapsed = vrHero.stage !== 'video';
  const progress = startedCollapsed ? 1 : clampNumber(scrollTop / settings.collapseDistance, 0, 1);
  const easedProgress = 1 - Math.pow(1 - progress, 2);
  const isVisible = isVrHeroShowcaseVisible();

  vrHero.scrollProgress = easedProgress;

  const maxHeight = Math.max(0, settings.openHeight * (1 - easedProgress));
  const opacity = clampNumber(1 - (easedProgress * 1.14), 0, 1);
  const showcaseTranslateY = -settings.translateY * easedProgress;
  const showcaseScale = 1 - (easedProgress * 0.08);
  const showcaseBlur = settings.blurMax * easedProgress;
  const showcaseMarginTop = settings.marginTop - (18 * easedProgress);
  const showcaseMarginBottom = settings.marginBottom - (22 * easedProgress);
  const copyMarginTop = settings.copyMarginTop - (34 * easedProgress);
  const copyTranslateY = -18 * easedProgress;
  const copyOpacity = clampNumber(1 - (easedProgress * 0.08), 0.9, 1);
  const sectionPaddingBottom = Math.max(0, settings.sectionPaddingBottom * (1 - easedProgress));

  if (startedCollapsed) {
    resetVrHeroScrollStyles();
    maybeSnapVrHeroByScroll(scrollTop);
  } else {
    vrHero.showcase.style.maxHeight = `${maxHeight.toFixed(2)}px`;
    vrHero.showcase.style.opacity = opacity.toFixed(4);
    vrHero.showcase.style.transform = `translateY(${showcaseTranslateY.toFixed(2)}px) scale(${showcaseScale.toFixed(4)})`;
    vrHero.showcase.style.filter = `blur(${showcaseBlur.toFixed(2)}px)`;
    vrHero.showcase.style.marginTop = `${showcaseMarginTop.toFixed(2)}px`;
    vrHero.showcase.style.marginBottom = `${showcaseMarginBottom.toFixed(2)}px`;
    vrHero.copy.style.marginTop = `${copyMarginTop.toFixed(2)}px`;
    vrHero.copy.style.transform = `translateY(${copyTranslateY.toFixed(2)}px)`;
    vrHero.copy.style.opacity = copyOpacity.toFixed(4);
    vrHero.section.style.paddingBottom = `${sectionPaddingBottom.toFixed(2)}px`;
  }

  vrHero.lastScrollTop = scrollTop;

  const stageIsVideo = vrHero.stage === 'video';
  const shouldForcePlay = stageIsVideo && (vrHero.snapLock || scrollTop <= getVrHeroCollapsedTop());

  if (reducedMotion || !stageIsVideo) {
    setVrHeroPlaybackMode('poster');
    return;
  }

  if (!shouldForcePlay && (document.hidden || !isVisible || progress >= 0.9)) {
    setVrHeroPlaybackMode('poster');
    return;
  }

  setVrHeroPlaybackMode('playing');
}

function queueVrHeroScrollSync() {
  if (vrHero.scrollFrame) return;
  vrHero.scrollFrame = requestAnimationFrame(() => {
    vrHero.scrollFrame = 0;
    syncVrHeroScrollState();
  });
}

function setVrHeroShowcaseState(isActive, options = {}) {
  if (!vrHero.section || !vrHero.showcase) return;

  const requestedCategoryId = typeof isActive === 'string'
    ? normalizeCategoryId(isActive)
    : '';
  const showcaseConfig = getVrHeroShowcaseConfig(requestedCategoryId);
  if (requestedCategoryId) {
    vrHeroDiagnostics.categoryChanges += 1;
    pushVrHeroDiagnostic('category-change', { category: requestedCategoryId });
  }

  if (!showcaseConfig) {
    clearVrHeroTransitionSnapshot();
    vrHero.transitionId += 1;
    vrHero.active = false;
    vrHero.activeCategory = '';
    setVrHeroFrameReady(false);
    clearVrHeroDeferredWarmup();
    vrHero.progress = 0;
    vrHero.lastScrollTop = 0;
    setVrHeroStage('video');
    clearVrHeroSnapLock();
    vrHero.section.classList.remove('vr-showcase-active');
    vrHero.showcase.setAttribute('aria-hidden', 'true');
    setVrHeroPlaybackMode('inactive', { force: true });
    resetVrHeroScrollStyles();
    return;
  }

  if (vrHero.active && vrHero.activeCategory === requestedCategoryId && vrHero.frameReady) {
    clearVrHeroTransitionSnapshot();
    setVrHeroStage('video');
    clearVrHeroSnapLock();
    if ((window.scrollY || document.documentElement.scrollTop || 0) > 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    syncVrHeroScrollState();
    return;
  }

  const shouldDissolveCategoryChange = Boolean(
    vrHero.active &&
    vrHero.frameReady &&
    vrHero.activeCategory &&
    vrHero.activeCategory !== requestedCategoryId &&
    vrHero.stage === 'video'
  );

  if (shouldDissolveCategoryChange) {
    captureVrHeroTransitionSnapshot();
  } else {
    clearVrHeroTransitionSnapshot();
  }

  vrHero.transitionId += 1;
  setVrHeroPlaybackMode('inactive', { force: true });
  resetAllVrHeroLayers();

  const didChange = configureVrHeroShowcase(requestedCategoryId);
  vrHero.active = true;
  setVrHeroFrameReady(false);
  vrHero.progress = 0;
  vrHero.lastScrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
  setVrHeroStage('video');
  clearVrHeroSnapLock();
  vrHero.playbackMode = 'inactive';
  vrHero.playbackLayerKey = '';
  clearVrHeroDeferredWarmup();

  const preserveVrArBehavior = isVrArShowcaseCategory(requestedCategoryId);
  const activeLayerKey = getActiveVrHeroLayerKey();
  const inactiveLayerKey = activeLayerKey === 'light' ? 'dark' : 'light';

  if (preserveVrArBehavior) {
    Object.values(vrHero.layers).forEach((layer) => {
      ensureVrHeroLayerReady(layer, { eager: true, preserveVrArBehavior: true });
      safelySetVrHeroTime(layer.video, 0);
    });
  } else if (options.restart !== false || didChange) {
    const activeLayer = vrHero.layers[activeLayerKey];
    const inactiveLayer = vrHero.layers[inactiveLayerKey];
    if (activeLayer) {
      ensureVrHeroLayerReady(activeLayer, { eager: true });
      safelySetVrHeroTime(activeLayer.video, 0);
    }
    if (inactiveLayer) {
      ensureVrHeroLayerReady(inactiveLayer, { eager: false });
      safelySetVrHeroTime(inactiveLayer.video, 0);
    }
  } else {
    const activeLayer = vrHero.layers[activeLayerKey];
    const inactiveLayer = vrHero.layers[inactiveLayerKey];
    if (activeLayer) ensureVrHeroLayerReady(activeLayer, { eager: true });
    if (inactiveLayer) ensureVrHeroLayerReady(inactiveLayer, { eager: false });
  }

  if ((window.scrollY || document.documentElement.scrollTop || 0) > 0) {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  if (!(vrHeroReducedMotionQuery && vrHeroReducedMotionQuery.matches)) {
    setVrHeroPlaybackMode('playing', { force: true });
  }

  if (!preserveVrArBehavior) {
    warmInactiveVrHeroLayer();
  }
  syncVrHeroScrollState();
}

Object.entries(vrHero.layers).forEach(([layerKey, layer]) => {
  if (!layer.video) return;

  primeVrHeroVideo(layer.video);
  layer.video.preload = 'metadata';
  layer.video.addEventListener('loadedmetadata', () => {
    if (!isCurrentVrHeroLayer(layer)) return;
    syncVrHeroLayerSize(layer);
    if (vrHero.active) {
      queueVrHeroScrollSync();
    }
  });
  const retryActivePlayback = () => {
    if (!vrHero.active || !isCurrentVrHeroLayer(layer)) return;
    if (getActiveVrHeroLayerKey() === layerKey && vrHero.playbackMode === 'playing') {
      setVrHeroPlaybackMode('playing', { force: true });
      return;
    }
    queueVrHeroScrollSync();
  };
  layer.video.addEventListener('loadeddata', retryActivePlayback);
  layer.video.addEventListener('canplay', retryActivePlayback);
  layer.video.addEventListener('canplaythrough', retryActivePlayback);
  layer.video.addEventListener('playing', () => {
    if (vrHero.active && isCurrentVrHeroLayer(layer)) {
      queueVrHeroScrollSync();
    }
  });
  layer.video.addEventListener('play', () => {
    if (vrHero.active && isCurrentVrHeroLayer(layer)) {
      startVrHeroLayer(layer);
    }
  });
  layer.video.addEventListener('error', () => {
    if (!vrHero.active || !isCurrentVrHeroLayer(layer)) return;
    vrHeroDiagnostics.errors += 1;
    pushVrHeroDiagnostic('video-error', {
      layer: layerKey,
      src: normalizeImagePath(layer.video.currentSrc || layer.video.src || ''),
      code: layer.video.error ? layer.video.error.code : 0
    });
    fallbackVrHeroVideoSource(layer);
  });
  layer.video.addEventListener('pause', () => stopVrHeroLayer(layer));
  layer.video.addEventListener('seeked', () => {
    if (vrHero.active && isCurrentVrHeroLayer(layer) && vrHero.playbackMode !== 'inactive') {
      drawVrHeroLayer(layer);
    }
  });
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    setVrHeroPlaybackMode(vrHero.active ? 'poster' : 'inactive', { force: true });
    return;
  }

  if (vrHero.active) {
    queueVrHeroScrollSync();
  }
});

window.addEventListener('resize', () => {
  if (vrHero.active && vrHero.activeCategory) {
    const didReconfigure = configureVrHeroShowcase(vrHero.activeCategory);
    if (didReconfigure) {
      setVrHeroFrameReady(false);
    }
  }
  Object.values(vrHero.layers).forEach((layer) => {
    syncVrHeroLayerSize(layer);
  });
  queueVrHeroScrollSync();
});

window.addEventListener('scroll', () => {
  if (vrHero.active) {
    queueVrHeroScrollSync();
  }
}, { passive: true });

window.addEventListener('wheel', (event) => {
  if (!shouldHandleVrHeroGesture()) return;
  if (Math.abs(event.deltaY) < 4) return;
  handleVrHeroDirectionalGesture(event.deltaY > 0 ? 1 : -1, event);
}, { passive: false });

window.addEventListener('touchstart', (event) => {
  if (!shouldHandleVrHeroGesture()) return;
  if (!event.changedTouches || !event.changedTouches.length) return;
  vrHero.touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (event) => {
  if (!shouldHandleVrHeroGesture()) return;
  if (!event.changedTouches || !event.changedTouches.length) return;
  const nextY = event.changedTouches[0].clientY;
  const deltaY = vrHero.touchStartY - nextY;
  if (Math.abs(deltaY) < 8) return;

  const handled = handleVrHeroDirectionalGesture(deltaY > 0 ? 1 : -1, event);
  if (handled) {
    vrHero.touchStartY = nextY;
  }
}, { passive: false });

document.addEventListener('site-theme-change', () => {
  if (vrHero.active) {
    clearVrHeroTransitionSnapshot();
    vrHeroDiagnostics.themeChanges += 1;
    pushVrHeroDiagnostic('theme-change', { theme: getActiveTheme() });
    vrHero.transitionId += 1;
    resetAllVrHeroLayers();
    configureVrHeroShowcase(vrHero.activeCategory);
    setVrHeroFrameReady(false);
    setVrHeroPlaybackMode(vrHero.playbackMode, { force: true });
    queueVrHeroScrollSync();
  }
});

// --- ABOUT MODAL ---
function openAbout() {
  document.getElementById('aboutModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeAbout() {
  document.getElementById('aboutModal').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeImageLightbox();
    closeAbout();
    closeProject();
    return;
  }
  const lightbox = document.getElementById('imageLightbox');
  if (lightbox && lightbox.classList.contains('open')) {
    if (e.key === 'ArrowRight') { e.preventDefault(); navImageLightbox(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); navImageLightbox(-1); }
  }
});

// --- PROJECT DETAIL MODAL ---
let currentProjectIndex = -1;
let currentFilteredProjects = [];
let currentProject = null;
let currentProjectGallery = [];
let currentProjectCaptions = {};
let currentProjectImageIndex = 0;
let coverProjectImageIndex = 0;
let storyPreviewActive = false;
let projectStoryTrackScrollFrame = 0;
let projectStoryTrackIgnoreScroll = false;
let projectStoryTrackReleaseTimer = 0;
let projectEmbedObserver = null;
const preferredImageCache = new Map();
const preferredImagePending = new Map();
let imageLightboxSources = [];
let imageLightboxIndex = 0;
let imageLightboxRequestId = 0;
const prefetchedImageAssets = new Set();

function onProjectModalScroll() {
  const modal = document.getElementById('projectModalContent');
  if (!modal) return;
  setProjectExpanded(modal.scrollTop > 56);
}

function toggleProjectExpanded() {
  const overlay = document.getElementById('projectModal');
  if (!overlay) return;
  overlay.classList.toggle('expanded');
}

function openImageLightbox(src) {
  if (!src) return;
  const lightbox = document.getElementById('imageLightbox');
  const img = document.getElementById('imageLightboxImg');
  const video = document.getElementById('imageLightboxVideo');
  if (!lightbox || !img || !video) return;
  const mediaSrc = normalizeImagePath(src);
  imageLightboxSources = (Array.isArray(currentProjectGallery) && currentProjectGallery.length)
    ? [...currentProjectGallery]
    : [mediaSrc];
  const hitIndex = findLightboxIndexBySrc(mediaSrc, imageLightboxSources);
  imageLightboxIndex = hitIndex >= 0 ? hitIndex : 0;
  if (hitIndex < 0 && mediaSrc) {
    imageLightboxSources = [mediaSrc, ...imageLightboxSources.filter(s => normalizeImagePath(s) !== mediaSrc)];
    imageLightboxIndex = 0;
  }
  renderLightboxCurrentMedia();
  updateLightboxNavControls();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeImageLightbox() {
  const lightbox = document.getElementById('imageLightbox');
  const img = document.getElementById('imageLightboxImg');
  const video = document.getElementById('imageLightboxVideo');
  if (img) img.src = '';
  if (video) {
    video.pause();
    video.removeAttribute('src');
    video.style.display = 'none';
  }
  imageLightboxSources = [];
  imageLightboxIndex = 0;
  imageLightboxRequestId += 1;
  if (lightbox) lightbox.classList.remove('open');
  if (document.getElementById('projectModal').classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function baseMediaName(src) {
  return normalizeImagePath(src).split('?')[0].replace(/\.[^/.]+$/, '').toLowerCase();
}

function findLightboxIndexBySrc(src, list) {
  if (!src || !Array.isArray(list) || !list.length) return -1;
  const cleanSrc = normalizeImagePath(src);
  const exact = list.findIndex(item => normalizeImagePath(item) === cleanSrc);
  if (exact >= 0) return exact;
  const base = baseMediaName(cleanSrc);
  return list.findIndex(item => baseMediaName(item) === base);
}

function buildLightboxOriginalCandidates(src) {
  const clean = normalizeImagePath(src);
  if (!clean || isVideoMedia(clean)) return [clean];
  const m = clean.match(/^(.*)\.([a-zA-Z0-9]+)(\?.*)?$/);
  if (!m) return [clean];
  const base = m[1];
  const query = m[3] || '';
  return [
    clean,
    `${base}.png${query}`,
    `${base}.jpg${query}`,
    `${base}.jpeg${query}`,
    `${base}.webp${query}`
  ].filter((value, idx, arr) => value && arr.indexOf(value) === idx);
}

async function resolveOriginalLightboxImage(src) {
  const clean = normalizeImagePath(src);
  const candidates = buildLightboxOriginalCandidates(clean);
  for (const candidate of candidates) {
    if (await probeImageExists(candidate)) return candidate;
  }
  return clean;
}

function renderLightboxCurrentMedia() {
  const lightbox = document.getElementById('imageLightbox');
  const img = document.getElementById('imageLightboxImg');
  const video = document.getElementById('imageLightboxVideo');
  if (!lightbox || !img || !video || !imageLightboxSources.length) return;
  const activeSrc = normalizeImagePath(imageLightboxSources[imageLightboxIndex] || '');
  if (!activeSrc) return;
  if (isVideoMedia(activeSrc)) {
    img.style.display = 'none';
    img.src = '';
    video.style.display = 'block';
    video.src = activeSrc;
    video.currentTime = 0;
    video.play().catch(() => {});
    return;
  }
  video.pause();
  video.style.display = 'none';
  video.removeAttribute('src');
  img.style.display = 'block';
  img.src = activeSrc;
  const reqId = ++imageLightboxRequestId;
  resolveOriginalLightboxImage(activeSrc).then((bestSrc) => {
    if (reqId !== imageLightboxRequestId) return;
    if (!bestSrc || isVideoMedia(bestSrc)) return;
    img.src = bestSrc;
  });
}

function updateLightboxNavControls() {
  const prev = document.getElementById('imageLightboxPrev');
  const next = document.getElementById('imageLightboxNext');
  const show = imageLightboxSources.length > 1;
  if (prev) prev.style.display = show ? 'inline-flex' : 'none';
  if (next) next.style.display = show ? 'inline-flex' : 'none';
}

function navImageLightbox(dir) {
  if (!imageLightboxSources.length) return;
  if (imageLightboxSources.length === 1) return;
  imageLightboxIndex = (imageLightboxIndex + dir + imageLightboxSources.length) % imageLightboxSources.length;
  renderLightboxCurrentMedia();
}

function setupImageLightboxSwipe() {
  const lightbox = document.getElementById('imageLightbox');
  if (!lightbox) return;
  let startX = 0;
  let startY = 0;
  lightbox.addEventListener('touchstart', (e) => {
    if (!lightbox.classList.contains('open') || !e.changedTouches || !e.changedTouches.length) return;
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (!lightbox.classList.contains('open') || !e.changedTouches || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    navImageLightbox(dx < 0 ? 1 : -1);
  }, { passive: true });
}

function setProjectExpanded(expanded) {
  const overlay = document.getElementById('projectModal');
  if (!overlay) return;
  overlay.classList.toggle('expanded', !!expanded);
}

function normalizeImagePath(path) {
  const normalized = String(path || '').trim().replace(/\\/g, '/');
  if (!normalized) return '';
  if (
    normalized.startsWith('/') ||
    normalized.startsWith('#') ||
    /^[a-z]+:/i.test(normalized) ||
    normalized.startsWith('//')
  ) {
    return normalized;
  }
  return `/${normalized.replace(/^\.?\//, '')}`;
}

function isVideoMedia(src) {
  return /\.mp4(\?.*)?$/i.test(normalizeImagePath(src));
}

function buildPreferredCandidates(src) {
  const clean = normalizeImagePath(src);
  const m = clean.match(/^(.*)\.([a-zA-Z0-9]+)(\?.*)?$/);
  if (!m) return [clean];
  const base = m[1];
  const ext = m[2].toLowerCase();
  const query = m[3] || '';
  if (ext === 'webp' || ext === 'gif' || ext === 'mp4' || ext === 'webm' || ext === 'mov') return [clean];
  return [
    `${base}.webp${query}`,
    clean
  ].filter((value, idx, arr) => value && arr.indexOf(value) === idx);
}

function getImmediatePreferredImage(src) {
  const candidates = buildPreferredCandidates(src);
  return candidates.length ? candidates[0] : normalizeImagePath(src);
}

function probeImageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function resolvePreferredImage(src) {
  const clean = normalizeImagePath(src);
  if (!clean) return Promise.resolve(clean);
  if (preferredImageCache.has(clean)) return Promise.resolve(preferredImageCache.get(clean));
  if (preferredImagePending.has(clean)) return preferredImagePending.get(clean);
  const pending = (async () => {
    const candidates = buildPreferredCandidates(clean);
    for (const candidate of candidates) {
      const ok = await probeImageExists(candidate);
      if (ok) {
        preferredImageCache.set(clean, candidate);
        preferredImagePending.delete(clean);
        return candidate;
      }
    }
    preferredImageCache.set(clean, clean);
    preferredImagePending.delete(clean);
    return clean;
  })();
  preferredImagePending.set(clean, pending);
  return pending;
}

function setImageWithPreferredQuality(imgEl, source) {
  if (!imgEl) return;
  const baseSrc = normalizeImagePath(source || imgEl.getAttribute('data-base-src') || imgEl.getAttribute('src') || '');
  if (!baseSrc) return;
  imgEl.dataset.baseSrc = baseSrc;
  imgEl.src = getImmediatePreferredImage(baseSrc);
  resolvePreferredImage(baseSrc).then((bestSrc) => {
    if (imgEl.dataset.baseSrc !== baseSrc) return;
    if (bestSrc && bestSrc !== imgEl.src) imgEl.src = bestSrc;
  });
}

function normalizeGalleryEntry(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') {
    const src = normalizeImagePath(entry);
    return src ? { src, caption: '' } : null;
  }
  if (typeof entry === 'object') {
    const src = normalizeImagePath(entry.src || entry.image || '');
    if (!src) return null;
    return { src, caption: String(entry.caption || '').trim() };
  }
  return null;
}

const galleryConfig = {
  p01: [
    'images/UI/AERONIX/Drive.webp',
    'images/UI/AERONIX/Charge.webp',
    'images/UI/AERONIX/1230.mp4',
    'images/UI/AERONIX/1.webp',
    'images/UI/AERONIX/2.webp',
    'images/UI/AERONIX/fe022a73-4746-4b02-a481-e89392b3561b_rw_1920.png',
    'images/UI/AERONIX/ezgif-545218b14e7a7379.gif',
    'images/UI/AERONIX/Image 1.webp',
    'images/UI/AERONIX/2.webp',
    'images/UI/AERONIX/Slide 16_9 - 1.webp',
    'images/UI/AERONIX/Slide 16_9 - 2.webp',
    'images/UI/AERONIX/Slide 16_9 - 3.webp',
    'images/UI/AERONIX/Slide 16_9 - 5.webp',
    'images/UI/AERONIX/Slide 16_9 - 4.webp',
    'images/UI/AERONIX/Slide 16_9 - 8.webp',
    'images/UI/AERONIX/Slide 16_9 - 9.webp',
    'images/UI/AERONIX/ian-tan-db10-comp-v003-100.webp',
    'images/UI/AERONIX/ian-tan-fronttop-v001.webp',
    'images/UI/AERONIX/ian-tan-reartop-v001.webp',
  ],
  p02: [
    'images/UI/GroceryMate/app (1).webp',
    'images/UI/GroceryMate/app (2).webp',
    'images/UI/GroceryMate/app (3).webp',
    'images/UI/GroceryMate/app (4).webp',
    'images/UI/GroceryMate/app (5).webp',
    'images/UI/GroceryMate/app (6).webp',
    'images/UI/GroceryMate/app (7).webp',
    'images/UI/GroceryMate/app (8).webp',
    'images/UI/GroceryMate/app (9).webp',
    'images/UI/GroceryMate/app (10).webp',
    'images/UI/GroceryMate/app (11).webp',
    'images/UI/GroceryMate/app (12).webp',
    'images/UI/GroceryMate/2.webp',
    'images/UI/GroceryMate/97904e66-e477-45d4-83e3-7d4c48d9c22a.webp',
    'images/UI/GroceryMate/0497cc64-cf65-4204-98d6-902663d07a5c.webp',
    'images/UI/GroceryMate/5740d681-f772-48ed-8763-10d15c4f36dd.webp',
    'images/UI/GroceryMate/464399c8-5ed4-4de5-bbcc-3a2d23274799.webp',
    'images/UI/GroceryMate/59f161fb-231b-42a6-bf4e-e623642d7077.webp',
    'images/UI/GroceryMate/96c6bd06-1cd4-4e2c-a9b0-ff6327eb993c.webp',
    'images/UI/GroceryMate/1ccd81f7-2f0d-4039-927c-b5c300b88d64.webp',
    'images/UI/GroceryMate/4b546f7f-3a77-4f15-bb71-5e7e7f6a8e6b.webp',
    'images/UI/GroceryMate/77694e4b-eea4-4a2b-acb2-d80ce1ac1b4f.webp',
    'images/UI/GroceryMate/73a2f167-73a3-4e0c-b0ce-1c7f4b0a8d07.webp',
    'images/UI/GroceryMate/5c053a12-60e1-4717-9618-521d6e9e6e52.webp',
  ],
  p03: [
    'images/UI/Hipicon/3045a34b-7d15-4e97-80b1-7c4169b84e62_rw_1200.webp',
    'images/UI/Hipicon/0e563a5d-167c-4d7c-849c-d97b0bd2d4e3_rw_600.webp',
    'images/UI/Hipicon/8acf3de6-e781-4c73-8ced-a6497bcaf2b6_rw_600.webp',
    'images/UI/Hipicon/40ca1d0a-9c16-42e9-8ad3-9ccb47228f54_rw_1920.webp',
    'images/UI/Hipicon/291b574d-dbe2-4579-b2ec-55d3d56dee8b_rw_600.webp',
    'images/UI/Hipicon/296f373f-15a9-4417-b93f-2921529aa5c5_rw_1200.webp',
  ],
  p04: [
    'images/3D/Material/untitled-002 (1).mp4',
    'images/3D/Material/e2d7dd6b-e78f-44f8-9c6f-aa3b12e30d8f_rw_1920.webp',
    'images/3D/Material/substance.png',
    'images/3D/Material/296bbee6-2962-4ffa-940d-deba4744484e_rw_1920.webp',
    'images/3D/Material/518f25f6-43d9-4828-871a-8c53ee994ada_rw_1920.webp',
    'images/3D/Material/761c1a94-4679-498b-8b6d-c16150a59055_rw_1920.webp',

  ],
  p05: [
    'images/3D/Material/material-main-camera-002.mp4',
    'images/3D/Material/2d3133cf-a710-4b19-a40a-87e3d42f7656_rw_1920.webp',
    'images/3D/Material/6e5a781c-d5df-411b-97c7-46dc6fe055d6_rw_1920.webp',
    'images/3D/Material/e6f5edd8-5370-4f05-a00a-602fc3c4cd4e_rw_1920.webp',
  ],
  p06: [

  ],
  p07: [
    'images/Architecture/BSH/4fb15cfe-b554-4711-8bba-7dcf136a7cd7_rw_1920.webp',
    'images/Architecture/BSH/792aea8b-993a-4724-bcca-b5434e2c2421_rw_1920.webp',
    'images/Architecture/BSH/43aa829e-e07a-4002-a06f-d806d88016d1_rw_1920.webp',
    'images/Architecture/BSH/28301583-fd49-4757-a222-8bb93a0fa824_rw_1920.webp',
    'images/Architecture/BSH/c58faca5-df89-4f49-a727-1c0666711960_rw_1920.webp',
  ],
 p08: [
  'images/AI/Character_Comfyui/AnimateDiff_00007.mp4',
  'images/AI/Character_Comfyui/unit-reference.webp', 
  'images/AI/Character_Comfyui/ComfyUI_temp_rbsdl_00001_.webp',
  'images/AI/Character_Comfyui/Assignment-Workflow2_Explanation.jpeg',
  'images/AI/Character_Comfyui/Deliverables_1.webp',
  'images/AI/Character_Comfyui/Deliverables_2.webp',
  'images/AI/Character_Comfyui/Deliverables_3.webp',
  'images/AI/Character_Comfyui/Deliverables_4.webp',
  'images/AI/Character_Comfyui/Assignment-Workflow_Explanation.jpeg',
  'images/AI/Character_Comfyui/Deliverables_5.webp',
  'images/AI/Character_Comfyui/ChatGPT-Image-14-sub-2026-20_32_29.webp',
  'images/AI/Character_Comfyui/ChatGPT-Image-14-sub-2026-20_32_32.webp',
  'images/AI/Character_Comfyui/Assignment-Workflow3_Explanation.jpeg',
  'images/AI/Character_Comfyui/ChatGPT-Image-14-sub-2026-20_322_29.webp',
  'images/AI/Character_Comfyui/Gemini_Generated_Image_qrcod7qrcod7qrco.webp',
  'images/AI/Character_Comfyui/Wan2.2_image_to_video_00001_.mp4',
  'images/AI/Character_Comfyui/Comp 1_1.mp4',
 ],
  p09: [
    'images/UI/Resorsus/8e50e9a5-ad79-47a9-8529-8128556506cf_rw_1920.webp',
    'images/UI/Resorsus/28bb304b-afce-4e50-ad74-4b851da333e2_rw_1920.webp',
  ],
  p10: [
    'images/3D/Whaf/image (3).png',
    'images/3D/Whaf/image (4).png',
    'images/3D/Whaf/image (5).png',
    'images/3D/Whaf/New0028.jpg',
    'images/3D/Whaf/Whaf1.webp',
    'images/3D/Whaf/Whaf2.webp',
    'images/3D/Whaf/Whaf3.webp',
    
  ],
  p20: [
    'images/Architecture/Gym/0a7f0928-088b-4935-b340-184a4e98b039_rw_600.webp',
    'images/Architecture/Gym/2 (1) (2).webp',
    'images/Architecture/Gym/5 (10).webp',
    'images/Architecture/Gym/5f77331b-13b5-4882-a916-90307e1d6550_rw_600.webp',
    'images/Architecture/Gym/18f789de-20be-4ecb-a2e4-429b5524ac75_rw_600.webp',
  ],
  p15: [
    'images/AI/Thesis/15.07.2024_18.59.31_REC_2_1.mp4',
    'images/AI/Thesis/6da01b3c-5d56-4d91-aa01-73d61b043644_rw_1920.webp',
    'images/AI/Thesis/1 (1).jpeg',
    'images/AI/Thesis/1 (1).webp',
    'images/AI/Thesis/1 (2).webp',
    'images/AI/Thesis/1 (3).webp',
    'images/AI/Thesis/1 (4).webp',
    'images/AI/Thesis/1 (5).webp',
    'images/AI/Thesis/15a8a83e-8261-4348-b715-97d9986655d2_rw_1200.webp',
  
  ],
  p13: [
    'images/Architecture/Dollvet/12d667ec-bc78-4b14-8324-ac10d6783e76_rw_1920.webp',
    'images/Architecture/Dollvet/9c55d376-8336-49a0-83d9-45f38b9067a3_rw_1920.webp',
    'images/Architecture/Dollvet/02738ee6-b568-4781-88c2-ca4c459f3e5c_rw_1920.webp',
    'images/Architecture/Dollvet/20f1a349-0fd5-4ad2-bd22-25c811d2fc8f_rw_1920.webp',
    'images/Architecture/Dollvet/cb79d933-f8c3-4705-a249-353506df548c_rw_1920.webp',
    'images/Architecture/Dollvet/c8f2e1a5-c541-4e4f-8d8c-dbf6ffe0a39e_rw_1920.webp',
    'images/Architecture/Dollvet/8867060b-1e4f-4c5e-a43f-7bae23e99cca_rw_1920.webp',
    'images/Architecture/Dollvet/e1e8243a-f42a-4678-93f4-79ddcf625cac_rw_1920.webp',
    'images/Architecture/Dollvet/d1f1ac3b-4068-46d7-8f74-dbe68fdc6b4d_rw_1920.webp',
  ],
  p14: [
    'images/Architecture/Istanbloom/ff1 (1).webp',
    'images/Architecture/Istanbloom/ff2 (1).webp',
    'images/Architecture/Istanbloom/ff3 (1).webp',
    'images/Architecture/Istanbloom/Banyo (2).webp',
  ],
  p16: [
    'images/3D/3D Badge Design/512x512_Frontside.png',
    'images/3D/3D Badge Design/512x512_backside.png',
],
  p17: [
    'images/VR/GazeGarden/Sequence 01_2.mp4',
    'images/VR/GazeGarden/PHOTO-2024-06-18-17-28-53.jpg',
],
  p12: [
    'images/VR/Huawei/4.webp',
    'images/VR/Huawei/3.webp',
    'images/VR/Huawei/757b462a-61b6-452c-ae8d-ae7df9baddd0.webp',
    'images/VR/Huawei/20230815-170122(WeLinkPC).webp',
    'images/VR/Huawei/2.webp',
    'images/VR/Huawei/Unity4.webp',
    'images/VR/Huawei/Unity6.webp',
    'images/VR/Huawei/u3.webp',
    'images/VR/Huawei/1.webp',
    'images/VR/Huawei/Racket_Training_1st.webp',
    'images/VR/Huawei/Racket_Training_5th.webp',  
  ],
  p18: [],
  p19: [
    'images/Architecture/Balikesir/12345 (2).webp',
    'images/Architecture/Balikesir/123456 (2).webp',
    'images/Architecture/Balikesir/12345678 (2).webp',
    'images/Architecture/Balikesir/123456789 (2).webp',
    'images/Architecture/Balikesir/12345 (2).webp',
  ],
  p11: [],
  p21: [
    'images/3D/VFX/2 (1) (3).webp',
    'imagesEB055C3B-930B-43BC-B21A-82ABD9A06B89 (1).webp',
    'images/3D/EFD15A56-B0E5-41F8-8F8C-2D48C5023A8B.webp',
    'images/3D/VFX/posst.webp',
    'images/3D/VFX/s.webp',
  ],
};

const projectStoryLayouts = {
  p01: 'carousel',
  p02: 'carousel',
  p03: 'carousel',
  p08: 'carousel',
  p12: 'carousel',
  p13: 'carousel',
  p15: 'carousel',
};

const projectEmbeds = {
  p06: {
    type: 'iframe',
    useAsCover: false,
    src: 'https://kuula.co/share/collection/7DK1N?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
    width: '100%',
    height: '640',
    allow: 'xr-spatial-tracking; gyroscope; accelerometer',
    allowFullscreen: true,
    scrolling: 'no'
  },

  p10: {
    type: 'multi-iframe',
    useAsCover: false,
    items: [
      {
        title: 'Concept1',
        src: 'https://player.vimeo.com/video/734998143?h=38c45703ac',
        width: '100%',
        height: '640',
        allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media',
        allowFullscreen: true,
        scrolling: 'no'
      },
      {
        title: 'Concept2',
        src: 'https://player.vimeo.com/video/821976916?h=1af925331c',
        width: '100%',
        height: '640',
        allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media',
        allowFullscreen: true,
        scrolling: 'no'
      }
    ]
  },
  p13: {
    type: 'iframe',
    useAsCover: false,
    src: 'https://kuula.co/share/collection/7v3LL?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
    width: '100%',
    height: '640',
    allow: 'xr-spatial-tracking; gyroscope; accelerometer',
    allowFullscreen: true,
    scrolling: 'no'
  },
  p11: {
    type: 'multi-iframe',
    useAsCover: false,
    items: [
      {
        title: 'Unicycle',
        src: 'https://sketchfab.com/models/8b5d32b5cbad48cea6598baaee648ed5/embed',
        width: '100%',
        height: '640',
        allow: 'autoplay; fullscreen; xr-spatial-tracking',
        allowFullscreen: true,
        scrolling: 'no'
      },
      {
        title: 'Cap',
        src: 'https://sketchfab.com/models/a79defd0306741879e664b12246eb6c1/embed',
        width: '100%',
        height: '640',
        allow: 'autoplay; fullscreen; xr-spatial-tracking',
        allowFullscreen: true,
        scrolling: 'no'
      }
    ]
  }
};

// Detailed image captions for popup gallery thumbnails.
// Edit this area to map each project image to a hover description.
// Format: project id -> exact image path -> caption text
const projectImageDetails = {
  p01: {
    'images/UI/AERONIX/ian-tan-db10-comp-v003-100.webp': 'Designed by IANTAN',
    'images/UI/AERONIX/ian-tan-fronttop-v001.webp': 'Designed by IANTAN',
    'images/UI/AERONIX/ian-tan-reartop-v001.webp': 'Designed  by IANTAN',
  },
  p02: {
  },
  p08: {
    'images/AI/Character_Comfyui/unit-reference.webp': 'In this project, I designed and implemented a complete AI-driven pipeline for creating game-ready character assets and animations. The goal was to explore how generative AI can be integrated into a production workflow to rapidly generate, refine, and animate consistent game characters.',
    'images/AI/Character_Comfyui/e6a72b21-b680-4f4f-a415-54a16554e6eb.webp': 'To make the character usable for production, I created a full multi-view character sheet. Used ComfyUI with FLUX model. Applied ControlNet (OpenPose) to standardize poses. Generated multiple consistent angles. Applied upscaling and noise reduction. Final manual polish in Photoshop. This step resulted in a clean and consistent dataset, suitable for training and animation workflows.',
    'images/AI/Character_Comfyui/Gemini_Generated_Image_qrcod7qrcod7qrco.webp': 'For motion creation: Used WAN AI video model inside ComfyUI. Generated animations from start and end frames. Focused on loopable, game-ready motion sequence. The animations were designed to: Maintain character consistency. Avoid deformation and flickering. Be usable directly in game pipeline.',
  },
  p17: {
  },
};

function getManualImageCaptions(projectId) {
  const raw = projectImageDetails[projectId];
  if (!raw || typeof raw !== 'object') return {};
  const normalized = {};
  Object.entries(raw).forEach(([src, caption]) => {
    const key = normalizeImagePath(src);
    const text = String(caption || '').trim();
    if (key && text) normalized[key] = text;
  });
  return normalized;
}

const projects = [
  { id:"p01", title:"AERONIX - EV Dashboard UI", description:"End-to-end dashboard and interface design for an electric vehicle platform. Drive mode, charging screens, and immersive interior and HMI visualizations.", categories:["ui-ux","ai"], tags:["dashboard","ev","automotive","dark-mode","figma","design-system","car"], tools:["Figma","VizcomAI","ComfyUI","Procreate"], thumbnail:"UI", image:"images/UI/AERONIX/Drive.webp", year:2026 },
  { id:"p02", title:"GroceryMate - Mobile App", description:"Complete mobile grocery shopping experience. Intuitive product browsing, cart management, and delivery tracking with clean UI.", categories:["ui-ux"], tags:["mobile","grocery","app","ios","figma","prototype","ecommerce"], tools:["Figma"], thumbnail:"APP", image:"images/UI/GroceryMate/26e8c458-b65e-4b0e-b1c0-8372f63651b9.webp", year:2025 },
  { id:"p03", title:"Hipicon - Brand Identity", description:"Brand identity and UI design for Hipicon. Visual language, component system, and marketing collateral.", categories:["ui-ux"], tags:["branding","identity","ui","web","interaction","design"], tools:["Figma","Photoshop","Canva"], thumbnail:"BRAND", image:"images/UI/Hipicon/8acf3de6-e781-4c73-8ced-a6497bcaf2b6_rw_600.webp", year:2020 },
  { id:"p04", title:"3D Materials - Trim Sheet Material", description:"**Featured by Adobe**, Custom Trim Sheet material. This trim sheet was created for use in a fantasy-style castle environment set in a harsh winter landscape. Designed with rich ornamentation and classical motifs, it enhances architectural elements such as walls, road edges, and decorative corners. The material blends icy wear with intricate sculptural details and golden accents, giving a sense of both elegance and age in a frozen world.", categories:["3d"], tags:["materials","textures","pbr","3d","substance","procedural","library"], tools:["Substance Painter","Blender","Photoshop"], thumbnail:"3D", image:"images/3D/Material/e2d7dd6b-e78f-44f8-9c6f-aa3b12e30d8f_rw_1920.webp", year:2025 },
  { id:"p05", title:"3D Materials - PBR Material", description:"This material artwork explores a stylized interpretation of a snow-covered, weathered stone path. Designed to emphasize the interplay between natural erosion and human interaction, the piece incorporates intricate surface details such as, bootprints, and scattered leaves. The contrast between snow accumulation and exposed rock highlights the passage of time and movement.", categories:["3d"], tags:["materials","textures","pbr","3d","substance","procedural","library"], tools:["Substance Painter","Blender","Photoshop"], thumbnail:"3D", image:"images/3D/Material/2d3133cf-a710-4b19-a40a-87e3d42f7656_rw_1920.webp", year:2025 },
  { id:"p06", title:"Ogut Tarabya - Villa Design ", description:"This project represents a holistic design approach that blends classic touches and, contemporary living requirements with a timeless design language. The spatial layout is shaped around user experience, creating open, balanced, and fluid environments.Beyond aesthetics, the design process prioritizes real-life usage scenarios. Each space is designed not only to be visually compelling but also to provide comfort, clarity, and long-term usability.", categories:["architecture"], tags:["interior","residential","visualization","rendering","archviz","istanbul"], tools:["3ds Max","V-Ray","Photoshop"], thumbnail:"ARCH", image:"images/Architecture/Tarabya_Villa/1.png", year:2026 },
  { id:"p07", title:"BSH - Office Interior Design", description:"The BSH office project is a seamless blend of functionality, comfort, and modern aesthetics, designed to foster a dynamic and collaborative work environment. The open-plan workspace is meticulously arranged with ergonomic furniture and warm-toned seating areas, creating a balanced atmosphere that enhances productivity and well-being.", categories:["architecture"], tags:["spatial","architecture","office","BSH","interior"], tools:["Blender"], thumbnail:"ARCH", image:"images/Architecture/BSH/28301583-fd49-4757-a222-8bb93a0fa824_rw_1920.webp", year:2025 },
  { id:"p08", title:"AI Character - ComfyUI Pipeline", description:"AI-assisted character creation pipeline using ComfyUI. Custom workflows for style-consistent character generation and animation.", categories:["ai"], tags:["ai","creative-tool","text-to-image","comfyui","character","FLUX","WanAI"], tools:["ComfyUI","RunPod","Flux","LoRA","WanAI"], thumbnail:"AI", image:"images/AI/Character_Comfyui/Deliverables_1.webp", year:2026 },
  { id:"p09", title:"Resorsus - Platform UI", description:"UI/UX design for Resorsus platform. Clean, modern interface with comprehensive design system and dark theme.", categories:["ui-ux"], tags:["platform","saas","interface","dashboard","web","design","dark-mode"], tools:["Figma","HTML", "CSS"], thumbnail:"UI", image:"images/UI/Resorsus/8e50e9a5-ad79-47a9-8529-8128556506cf_rw_1920.webp", year:2025 },
  { id:"p10", title:"Whaf - 3D Product Visualization", description:"3D product visualization and rendering for Whaf. High-fidelity models with realistic materials and lighting.", categories:["3d"], tags:["3d","product","visualization","rendering","blender","materials","ecommerce"], tools:["Cinema4D","Substance Painter","Photoshop","After Effects"], thumbnail:"3D", image:"images/3D/Whaf/image (4).png", year:2022 },
  { id:"p11", title:"Mid poly 3D Assets", description:"Mid-poly asset collection presented with interactive Sketchfab embeds.", categories:["3d"], tags:["mid-poly","3d-assets","sketchfab","interactive","modeling"], tools:["Blender","Sketchfab"], thumbnail:"3D", image:"images/3D/Mid-Poly/midpoly.png", year:2022 },
  { id:"p12", title:"Huawei VR - VR Game Projects", description:"VR Game Prototyping (Huawei R&D), I handle the full production pipeline from concept to final engine integration. I work with both real-time and pre-rendered projects, ensuring visual quality, technical efficiency, and creative consistency.", categories:["vr-ar","3d","ui-ux"], tags:["vr","training","unity","immersive","spatial-ui","hand-tracking","huawei"], tools:["Unity","C#","VR","Blender"], thumbnail:"VR", image:"images/VR/Huawei/757b462a-61b6-452c-ae8d-ae7df9baddd0.webp", year:2023 },
  { id:"p13", title:"Dollvet  - Villa-Office Design", description:"The building was completely designed using 3DsMax and imported into Unreal Engine to allow the client to see every detail of the building giving options to change the colors, objects, and lightnings depending on the needs.", categories:["architecture","vr-ar"], tags:["concept","sculpture","3d","digital","modeling","zbrush","art"], tools:["V-Ray","VR","3DsMax","Unreal Engine"], thumbnail:"ARCH", image:"images/Architecture/Dollvet/12d667ec-bc78-4b14-8324-ac10d6783e76_rw_1920.webp", year:2022 },
  { id:"p14", title:"Istanbloom - Interior Design", description:"Interior design and architectural visualization for Istanbloom residential project. Living spaces, bathrooms, and lifestyle renders.", categories:["architecture"], tags:["interior","residential","visualization","rendering","archviz","istanbul"], tools:["3ds Max","V-Ray","Photoshop"], thumbnail:"ARCH", image:"images/Architecture/Istanbloom/ff1 (1).webp", year:2021 },
  { id:"p15", title:"AI Thesis - Research Project", description:"The project aims to provide integrated innovative preferences that can enhance the gaming experience and benefit the user with advancing technologies, based theoretically on the historical development of in-game user preferences. This will provide users with the opportunity to build the game, making them a part of the design process, ensuring the production of an endless experience. This game leverages the capabilities of the AI, which allows players to create and customize their canvases through their prompt, offering a unique interactive experience.", categories:["ai","vr-ar"], tags:["ai","research","thesis","generative","automation","academic","design"], tools:["OpenAI - API","Unity","Hanyuan3D","C#"], thumbnail:"AI", image:"images/AI/Thesis/1 (1).webp", year:2024 },
  { id:"p16", title:"3D Badge Design - Token", description:"3D badge asset represents intelligence, focus, and mastery. The glowing brain icon symbolizes sharp thinking and deep knowledge. Players earn this badge by correctly answering a high number of questions, proving their expertise and consistent performance. It highlights achievement, accuracy, and cognitive excellence within the game. ", categories:["3d"], tags:["3D","Game","visualization","asset","stylized"], tools:["3ds Max","V-Ray","Photoshop"], thumbnail:"Game", image:"images/3D/3D Badge Design/512x512_Frontside.png", year:2025 },
  { id:"p17", title:"Gaze Garden - AR Tiktok Project", description:"This AR Project Was created using TikTok Effect House for TikTok effects. You can try it by scanning the QR code on the TikTok app.", categories:["vr-ar"], tags:["immersive","media design","tiktok","berlin"], tools:["Tiktok Studio","AR","image tracking"], thumbnail:"AR", image:"images/VR/GazeGarden/PHOTO-2024-06-18-17-28-53.jpg", year:2024 },
  { id:"p18", title:"3D Concept - 3D Bathroom Stylized", description:"Digital sculpture and concept art. High-poly modeling with detailed surface work and cinematic composition.", categories:["3d"], tags:["concept","sculpture","3d","digital","modeling","zbrush","art"], tools:["ZBrush","Blender","Photoshop"], thumbnail:"3D", image:"images/3D/Concept/8089a030-25ee-409e-8036-c16b8cc426f4_rw_1920.webp", year:2020 },
  { id:"p19", title:"Balikesir - Architectural Viz", description:"Architectural visualization for Balikesir residential project. Photorealistic renders from concept to final presentation.", categories:["architecture"], tags:["parametric","residential","archviz","grasshopper","3dsmax","rendering"], tools:["Blender","Photoshop"], thumbnail:"ARCH", image:"images/Architecture/Balikesir/12345678 (2).webp", year:2021 },
  { id:"p20", title:"Gym - Fitness Center Design", description:"Architectural design and visualization for a modern fitness center. Interior layouts, equipment placement, and atmospheric renders.", categories:["architecture",], tags:["gym","fitness","interior","visualization","rendering","archviz","commercial"], tools:["3ds Max","V-Ray","Photoshop"], thumbnail:"ARCH", image:"images/Architecture/Gym/2 (1) (2).webp", year:2022 },
  { id:"p21", title:"VFX - 3D Visual Effects", description:"Real-time visual effects and 3D compositing. Particle systems, shader development, and post-processing pipelines.", categories:["3d"], tags:["vfx","visual-effects","shaders","3d","particles","compositing",], tools:["Houdini","After Effects","Touchdesigner"], thumbnail:"VFX", image:"images/3D/VFX/posst.webp", year:2020 },

];

projects.forEach((project) => {
  if (!project || !project.id || !project.image || project.cardImage) return;
  project.cardImage = `images/_card/${project.id}.webp`;
});

function buildProjectRouteSlug(project) {
  const raw = `${project && project.id ? project.id : 'project'}-${project && project.title ? project.title : ''}`;
  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-') || (project && project.id) || 'project';
}

const projectRouteSlugMap = new Map();
projects.forEach((project) => {
  if (!project) return;
  project.routeSlug = buildProjectRouteSlug(project);
  projectRouteSlugMap.set(project.routeSlug, project.id);
});

function getProjectCardImage(project) {
  return normalizeImagePath((project && (project.cardImage || project.image)) || '');
}

function getProjectById(projectId) {
  const normalizedProjectId = String(projectId || '').trim();
  if (!normalizedProjectId) return null;
  return projects.find((project) => project && project.id === normalizedProjectId) || null;
}

function getProjectByRouteSlug(slug) {
  const normalizedSlug = String(slug || '').trim().toLowerCase();
  if (!normalizedSlug) return null;
  const projectId = projectRouteSlugMap.get(normalizedSlug);
  return projectId ? getProjectById(projectId) : null;
}

function getProjectPrimaryCategory(project) {
  const primaryCategory = Array.isArray(project && project.categories) ? project.categories.find((category) => catLabels[category]) : '';
  return primaryCategory || '';
}

function getProjectSharePath(project) {
  if (!project) return '/';
  return `/project/${project.routeSlug || buildProjectRouteSlug(project)}`;
}

function getProjectGallery(p) {
  const fromConfig = (Array.isArray(galleryConfig[p.id]) ? galleryConfig[p.id] : []).map(normalizeGalleryEntry).filter(Boolean);
  const fromProject = (Array.isArray(p.images) ? p.images : []).map(normalizeGalleryEntry).filter(Boolean);
  const merged = [...fromConfig, ...fromProject].map(e => e.src);
  const mainImage = normalizeImagePath(p.image);
  if (mainImage && !merged.includes(mainImage)) merged.unshift(mainImage);
  return [...new Set(merged)];
}

function getProjectCaptionMap(p) {
  const map = getManualImageCaptions(p.id);
  const fromConfig = (Array.isArray(galleryConfig[p.id]) ? galleryConfig[p.id] : []).map(normalizeGalleryEntry).filter(Boolean);
  const fromProject = (Array.isArray(p.images) ? p.images : []).map(normalizeGalleryEntry).filter(Boolean);
  [...fromConfig, ...fromProject].forEach(e => {
    if (e.caption && !map[e.src]) map[e.src] = e.caption;
  });
  return map;
}

function getProjectStoryLayout(projectId) {
  return projectStoryLayouts[projectId] || 'stack';
}

function isProjectStoryCarousel(projectId) {
  return getProjectStoryLayout(projectId) === 'carousel';
}

function renderProjectStorySection(p) {
  if (currentProjectGallery.length <= 1) return '';

  const itemsHtml = currentProjectGallery.map((img, i) => `
    <article class="pm-story-item ${i === currentProjectImageIndex ? 'active' : ''}" data-story-index="${i}" onclick="setProjectImage(${i})">
      ${isVideoMedia(img)
        ? `<div class="pm-story-media pm-story-video-thumb" role="img" aria-label="${p.title + ' video ' + (i + 1)}"><span class="pm-video-thumb-badge">Video</span><span class="pm-video-thumb-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 6.5v11l9-5.5-9-5.5z"></path></svg></span></div>`
        : `<img class="pm-story-media pm-story-image" src="${getImmediatePreferredImage(img)}" data-base-src="${img}" alt="${p.title + ' visual ' + (i + 1)}" loading="lazy" decoding="async" fetchpriority="low" onclick="event.stopPropagation(); openImageLightbox(this.getAttribute('data-base-src') || this.currentSrc || this.src)">`
      }
      ${currentProjectCaptions[img] ? `<div class="pm-story-caption">${currentProjectCaptions[img]}</div>` : ''}
    </article>
  `).join('');

  if (!isProjectStoryCarousel(p.id)) {
    return `<div class="pm-story">${itemsHtml}</div>`;
  }

  return `
    <div class="pm-story-shell">
      <div class="pm-story-toolbar">
        <div class="pm-story-toolbar-title">Project Walkthrough</div>
        <div class="pm-story-toolbar-actions">
          <button type="button" class="pm-story-nav-btn" onclick="navProjectStory(-1)" aria-label="Previous visual">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div class="pm-story-status" id="pmStoryCarouselStatus">${currentProjectImageIndex + 1} / ${currentProjectGallery.length}</div>
          <button type="button" class="pm-story-nav-btn" onclick="navProjectStory(1)" aria-label="Next visual">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
      <div class="pm-story is-carousel" id="pmStoryTrack">
        ${itemsHtml}
      </div>
    </div>
  `;
}

function mountKuulaEmbed(container, cfg) {
  if (!container || !cfg) return;
  container.innerHTML = '';
  const script = document.createElement('script');
  script.src = cfg.scriptSrc || 'https://static.kuula.io/embed.js';
  script.dataset.kuula = cfg.kuula || '';
  script.dataset.width = cfg.width || '100%';
  script.dataset.height = cfg.height || '640px';
  container.appendChild(script);
}

function mountIframeEmbed(container, cfg) {
  if (!container || !cfg) return;
  container.innerHTML = '';
  const iframe = createEmbedIframe(cfg);
  container.appendChild(iframe);
}

function disconnectProjectEmbedObserver() {
  if (!projectEmbedObserver) return;
  projectEmbedObserver.disconnect();
  projectEmbedObserver = null;
}

function renderProjectEmbedPlaceholder(host) {
  if (!host) return;
  host.innerHTML = '<div class="pm-embed-placeholder"><span class="pm-embed-placeholder-badge">Interactive Media</span></div>';
}

function mountProjectEmbedHost(host, cfg) {
  if (!host || !cfg || host.dataset.embedMounted === 'true') return;
  host.dataset.embedMounted = 'true';
  host.classList.add('is-mounted');
  if (cfg.type === 'kuula') mountKuulaEmbed(host, cfg);
  if (cfg.type === 'iframe') mountIframeEmbed(host, cfg);
  if (cfg.type === 'multi-iframe') mountMultiIframeEmbed(host, cfg);
}

function createEmbedIframe(cfg) {
  const iframe = document.createElement('iframe');
  iframe.width = cfg.width || '100%';
  iframe.height = cfg.height || '640';
  iframe.frameBorder = '0';
  iframe.setAttribute('allow', cfg.allow || 'xr-spatial-tracking; gyroscope; accelerometer');
  iframe.setAttribute('scrolling', cfg.scrolling || 'no');
  if (cfg.allowFullscreen !== false) iframe.setAttribute('allowfullscreen', '');
  iframe.src = cfg.src || '';
  return iframe;
}

function mountMultiIframeEmbed(container, cfg) {
  if (!container || !cfg || !Array.isArray(cfg.items)) return;
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'pm-embed-grid';
  cfg.items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'pm-embed-card';
    const frameWrap = document.createElement('div');
    frameWrap.className = 'pm-embed-host';
    frameWrap.appendChild(createEmbedIframe(item));
    const cap = document.createElement('div');
    cap.className = 'pm-embed-credit';
    cap.textContent = item.title || '3D Asset';
    card.appendChild(frameWrap);
    card.appendChild(cap);
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function mountProjectEmbeds(projectId) {
  disconnectProjectEmbedObserver();
  const cfg = projectEmbeds[projectId];
  if (!cfg) return;
  const hosts = Array.from(document.querySelectorAll(`[data-project-embed="${projectId}"]`));
  if (!hosts.length) return;

  hosts.forEach((host) => {
    host.dataset.embedMounted = 'false';
    host.classList.remove('is-mounted');
    renderProjectEmbedPlaceholder(host);
  });

  if (typeof IntersectionObserver !== 'function') {
    hosts.forEach((host) => mountProjectEmbedHost(host, cfg));
    return;
  }

  const modalRoot = document.getElementById('projectModalContent');
  projectEmbedObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      mountProjectEmbedHost(entry.target, cfg);
      if (projectEmbedObserver) projectEmbedObserver.unobserve(entry.target);
    });
  }, {
    root: modalRoot || null,
    rootMargin: '120px 0px',
    threshold: 0.12
  });

  hosts.forEach((host) => projectEmbedObserver.observe(host));
}

function prefetchImageAsset(src) {
  const normalizedSrc = normalizeImagePath(src);
  if (!normalizedSrc || prefetchedImageAssets.has(normalizedSrc) || isVideoMedia(normalizedSrc)) return;
  prefetchedImageAssets.add(normalizedSrc);
  const img = new Image();
  img.decoding = 'async';
  img.loading = 'eager';
  img.src = normalizedSrc;
}

function prefetchProjectCardImages(projectList, limit = 6) {
  (Array.isArray(projectList) ? projectList : []).slice(0, limit).forEach((project) => {
    prefetchImageAsset(getProjectCardImage(project) || (project && project.image));
  });
}

function prefetchProjectMedia(project, limit = 3) {
  if (!project) return;
  getProjectGallery(project).slice(0, limit).forEach((src) => {
    if (isVideoMedia(src)) return;
    prefetchImageAsset(getImmediatePreferredImage(src));
  });
}

function warmCategoryProjectThumbs(catId, limit = 4) {
  const normalizedCatId = normalizeCategoryId(catId);
  if (!normalizedCatId) return;
  prefetchProjectCardImages(projects.filter((project) => Array.isArray(project.categories) && project.categories.includes(normalizedCatId)), limit);
}

function bindCategoryThumbnailPrefetch() {
  document.querySelectorAll('.cat-pill').forEach((pill) => {
    const warm = () => warmCategoryProjectThumbs(pill.dataset.cat, 4);
    pill.addEventListener('mouseenter', warm, { passive: true });
    pill.addEventListener('focus', warm, { passive: true });
    pill.addEventListener('touchstart', warm, { passive: true, once: true });
  });
}

function openProject(projectId, options = {}) {
  const p = projects.find(pr => pr.id === projectId);
  if (!p) return;
  projectStoryTrackIgnoreScroll = false;
  clearTimeout(projectStoryTrackReleaseTimer);
  if (projectStoryTrackScrollFrame) cancelAnimationFrame(projectStoryTrackScrollFrame);
  projectStoryTrackScrollFrame = 0;
  currentProject = p;
  currentProjectGallery = getProjectGallery(p);
  currentProjectCaptions = getProjectCaptionMap(p);
  currentProjectImageIndex = 0;
  coverProjectImageIndex = 0;
  storyPreviewActive = false;
  setProjectExpanded(false);
  currentProjectIndex = currentFilteredProjects.findIndex(pr => pr.id === projectId);
  renderProjectModal(p);
  document.getElementById('projectModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  onProjectModalScroll();
  prefetchProjectMedia(p, 4);
  if (!options.skipUrl) {
    updateUrlForView({
      category: getActiveCategoryId() || getProjectPrimaryCategory(p),
      projectId: p.id,
      replace: Boolean(options.replaceUrl)
    });
  }
  applySeoMeta(buildProjectSeoMeta(p));
}

function closeProject(options = {}) {
  closeProjectSummary();
  closeImageLightbox();
  disconnectProjectEmbedObserver();
  projectStoryTrackIgnoreScroll = false;
  clearTimeout(projectStoryTrackReleaseTimer);
  if (projectStoryTrackScrollFrame) cancelAnimationFrame(projectStoryTrackScrollFrame);
  projectStoryTrackScrollFrame = 0;
  const overlay = document.getElementById('projectModal');
  const modal = document.getElementById('projectModalContent');
  if (overlay) overlay.classList.remove('open');
  setProjectExpanded(false);
  currentProject = null;
  currentProjectGallery = [];
  currentProjectCaptions = {};
  currentProjectImageIndex = 0;
  coverProjectImageIndex = 0;
  storyPreviewActive = false;
  document.body.style.overflow = '';
  if (modal) {
    window.setTimeout(() => {
      if (overlay && !overlay.classList.contains('open')) {
        modal.innerHTML = '';
      }
    }, 220);
  }
  const activeCategoryId = getActiveCategoryId();
  if (!options.skipUrl) {
    updateUrlForView({
      category: activeCategoryId,
      replace: true
    });
  }
  applySeoMeta(activeCategoryId ? buildCategorySeoMeta(activeCategoryId) : buildHomeSeoMeta());
}

function navProject(dir) {
  if (currentFilteredProjects.length === 0) return;
  projectStoryTrackIgnoreScroll = false;
  clearTimeout(projectStoryTrackReleaseTimer);
  if (projectStoryTrackScrollFrame) cancelAnimationFrame(projectStoryTrackScrollFrame);
  projectStoryTrackScrollFrame = 0;
  currentProjectIndex = (currentProjectIndex + dir + currentFilteredProjects.length) % currentFilteredProjects.length;
  const p = currentFilteredProjects[currentProjectIndex];
  currentProject = p;
  currentProjectGallery = getProjectGallery(p);
  currentProjectCaptions = getProjectCaptionMap(p);
  currentProjectImageIndex = 0;
  coverProjectImageIndex = 0;
  storyPreviewActive = false;
  setProjectExpanded(false);
  renderProjectModal(p);
  prefetchProjectMedia(p, 4);
  updateUrlForView({
    category: getActiveCategoryId() || getProjectPrimaryCategory(p),
    projectId: p.id,
    replace: true
  });
  applySeoMeta(buildProjectSeoMeta(p));
}

function syncProjectImageState(options = {}) {
  const preventTrackScroll = !!options.preventTrackScroll;
  const activeImage = currentProjectGallery[currentProjectImageIndex] || '';
  const hero = document.getElementById('pmHeroImage');
  const heroVideo = document.getElementById('pmHeroVideo');
  const activeIsVideo = isVideoMedia(activeImage);
  const embedCfg = currentProject ? projectEmbeds[currentProject.id] : null;
  const usingEmbedCover = !!(embedCfg && embedCfg.useAsCover);
  if (!usingEmbedCover && ((activeIsVideo && !heroVideo) || (!activeIsVideo && !hero))) {
    if (currentProject) renderProjectModal(currentProject);
    return;
  }
  if (!usingEmbedCover && hero && activeImage && !activeIsVideo) setImageWithPreferredQuality(hero, activeImage);
  if (!usingEmbedCover && heroVideo && activeImage && activeIsVideo) {
    heroVideo.src = normalizeImagePath(activeImage);
    heroVideo.currentTime = 0;
    heroVideo.play().catch(() => {});
  }
  const counter = document.getElementById('pmImageCount');
  if (counter) counter.textContent = (currentProjectImageIndex + 1) + ' / ' + currentProjectGallery.length;
  document.querySelectorAll('.pm-gallery-thumb').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === currentProjectImageIndex);
  });
  syncProjectStoryCarousel({ preventTrackScroll });
  const previewBtn = document.getElementById('pmPreviewClose');
  if (previewBtn) previewBtn.style.display = storyPreviewActive ? 'inline-flex' : 'none';
}

function syncProjectStoryCarousel(options = {}) {
  const preventTrackScroll = !!options.preventTrackScroll;
  const track = document.getElementById('pmStoryTrack');
  const status = document.getElementById('pmStoryCarouselStatus');
  if (status) status.textContent = (currentProjectImageIndex + 1) + ' / ' + currentProjectGallery.length;
  if (!track) return;

  const items = Array.from(track.querySelectorAll('.pm-story-item'));
  items.forEach((item, index) => {
    item.classList.toggle('active', index === currentProjectImageIndex);
  });

  const activeItem = items[currentProjectImageIndex];
  if (!activeItem || preventTrackScroll) return;

  const targetLeft = activeItem.offsetLeft - ((track.clientWidth - activeItem.offsetWidth) / 2);
  projectStoryTrackIgnoreScroll = true;
  clearTimeout(projectStoryTrackReleaseTimer);
  track.scrollTo({
    left: Math.max(0, targetLeft),
    behavior: 'smooth'
  });
  projectStoryTrackReleaseTimer = window.setTimeout(() => {
    projectStoryTrackIgnoreScroll = false;
  }, 280);
}

function handleProjectStoryTrackScroll() {
  const track = document.getElementById('pmStoryTrack');
  if (!track || projectStoryTrackIgnoreScroll) return;
  if (projectStoryTrackScrollFrame) cancelAnimationFrame(projectStoryTrackScrollFrame);
  projectStoryTrackScrollFrame = requestAnimationFrame(() => {
    projectStoryTrackScrollFrame = 0;
    const items = Array.from(track.querySelectorAll('.pm-story-item'));
    if (!items.length) return;
    const trackCenter = track.scrollLeft + (track.clientWidth / 2);
    let closestIndex = currentProjectImageIndex;
    let closestDistance = Number.POSITIVE_INFINITY;
    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
      const distance = Math.abs(itemCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    if (closestIndex === currentProjectImageIndex) {
      syncProjectStoryCarousel({ preventTrackScroll: true });
      return;
    }
    currentProjectImageIndex = closestIndex;
    syncProjectImageState({ preventTrackScroll: true });
  });
}

function attachProjectStoryTrack() {
  const track = document.getElementById('pmStoryTrack');
  if (!track) return;
  track.addEventListener('scroll', handleProjectStoryTrackScroll, { passive: true });
}

function applyStoryImageLayout() {
  document.querySelectorAll('.pm-story-item').forEach((item) => {
    const media = item.querySelector('.pm-story-media');
    if (!media) return;
    const setMode = () => {
      const w = media.tagName === 'VIDEO' ? (media.videoWidth || 0) : (media.naturalWidth || 0);
      const h = media.tagName === 'VIDEO' ? (media.videoHeight || 0) : (media.naturalHeight || 0);
      if (!w || !h) return;
      const ratio = w / h;
      item.classList.toggle('is-portrait', ratio < 0.95);
    };
    if ((media.tagName === 'VIDEO' && media.readyState >= 1) || (media.tagName !== 'VIDEO' && media.complete)) {
      setMode();
    } else {
      const ev = media.tagName === 'VIDEO' ? 'loadedmetadata' : 'load';
      media.addEventListener(ev, setMode, { once: true });
    }
  });
}

function enhanceModalImageQuality() {
  const hero = document.getElementById('pmHeroImage');
  if (hero) setImageWithPreferredQuality(hero, hero.getAttribute('data-base-src') || hero.src);
  document.querySelectorAll('.pm-gallery-thumb img, .pm-story-image').forEach((img) => {
    setImageWithPreferredQuality(img, img.getAttribute('data-base-src') || img.src);
  });
}

function setProjectImage(idx) {
  if (!currentProjectGallery.length) return;
  if (idx < 0 || idx >= currentProjectGallery.length) return;
  storyPreviewActive = false;
  currentProjectImageIndex = idx;
  syncProjectImageState();
}

function navProjectImage(dir) {
  if (!currentProjectGallery.length) return;
  storyPreviewActive = false;
  currentProjectImageIndex = (currentProjectImageIndex + dir + currentProjectGallery.length) % currentProjectGallery.length;
  syncProjectImageState();
}

function navProjectStory(dir) {
  navProjectImage(dir);
}

function previewStoryImage(idx) {
  if (!currentProjectGallery.length) return;
  if (idx < 0 || idx >= currentProjectGallery.length) return;
  if (!storyPreviewActive) coverProjectImageIndex = currentProjectImageIndex;
  storyPreviewActive = true;
  currentProjectImageIndex = idx;
  setProjectExpanded(true);
  syncProjectImageState();
  const modal = document.getElementById('projectModalContent');
  if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeStoryPreview() {
  if (!storyPreviewActive) return;
  storyPreviewActive = false;
  currentProjectImageIndex = coverProjectImageIndex;
  syncProjectImageState();
}

// --- AI Project Summary ---
function formatProjectSummaryParagraphs(text) {
  return String(text || '')
    .split(/\n{2,}/)
    .map(block => block.split(/\n+/).map(line => line.trim()).filter(Boolean).join(' '))
    .filter(Boolean)
    .map(block => `<p>${escapeHtml(block)}</p>`)
    .join('');
}

function renderProjectSummaryStatus(message) {
  return `<p class="pm-ai-tooltip-status">${escapeHtml(message)}</p>`;
}

function renderProjectSummaryContent(summary) {
  const trimmed = String(summary || '').trim();
  if (!trimmed) return renderProjectSummaryStatus('Project brief is not available yet.');

  const lines = trimmed.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const labelPattern = /^(?:[-*]\s*)?(?:\*\*)?(Goal|Problem|Approach|Result)(?:\*\*)?\s*:\s*(.*)$/i;
  const sections = [];
  const intro = [];
  let currentSection = null;

  lines.forEach(line => {
    const match = line.match(labelPattern);
    if (match) {
      currentSection = {
        label: match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase(),
        body: match[2] ? [match[2].trim()] : []
      };
      sections.push(currentSection);
      return;
    }

    if (currentSection) {
      currentSection.body.push(line);
    } else {
      intro.push(line);
    }
  });

  if (!sections.length) {
    return `<div class="pm-ai-summary-plain">${formatProjectSummaryParagraphs(trimmed)}</div>`;
  }

  const introHtml = intro.length
    ? `<div class="pm-ai-tooltip-intro">${formatProjectSummaryParagraphs(intro.join('\n'))}</div>`
    : '';

  const sectionsHtml = sections.map(section => `
    <section class="pm-ai-summary-section">
      <div class="pm-ai-summary-kicker">${escapeHtml(section.label)}</div>
      <div class="pm-ai-summary-copy">${formatProjectSummaryParagraphs(section.body.join('\n'))}</div>
    </section>
  `).join('');

  return `${introHtml}<div class="pm-ai-summary-grid">${sectionsHtml}</div>`;
}

function syncProjectSummaryExpandedState() {
  const tooltip = document.getElementById('pmAiTooltip');
  const toggle = document.getElementById('pmAiTooltipExpand');
  if (!tooltip || !toggle) return;

  const expanded = tooltip.classList.contains('expanded');
  toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  toggle.setAttribute('title', expanded ? 'Collapse' : 'Expand');
}

function closeProjectSummary(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const tooltip = document.getElementById('pmAiTooltip');
  if (!tooltip) return;
  tooltip.classList.remove('show', 'expanded');
  syncProjectSummaryExpandedState();
}

function toggleProjectSummaryExpanded(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const tooltip = document.getElementById('pmAiTooltip');
  if (!tooltip) return;
  tooltip.classList.toggle('expanded');
  syncProjectSummaryExpandedState();
}

function getProjectSummary() {
  if (!currentProject) return;
  const btn = document.getElementById('pmAiWizard');
  const tooltip = document.getElementById('pmAiTooltip');
  const tooltipBody = document.getElementById('pmAiTooltipBody');
  
  if (!btn || !tooltip || !tooltipBody) return;
  
  btn.classList.add('loading');
  tooltipBody.innerHTML = renderProjectSummaryStatus('Analyzing project...');
  tooltip.classList.add('show');
  tooltip.classList.remove('expanded');
  syncProjectSummaryExpandedState();

  const projectInfo = [
    `Project ID: ${currentProject.id}`,
    `Project title: ${currentProject.title}`,
    `Portfolio summary: ${currentProject.description}`,
    `Categories: ${currentProject.categories.map(c => catLabels[c] || c).join(', ')}`,
    `Tools: ${currentProject.tools.join(', ')}`,
    `Year: ${currentProject.year || 'N/A'}`
  ].join('\n');

  const query = [
    `Explain project ${currentProject.id} (${currentProject.title}).`,
    "Use the canonical project source first.",
    "Return a short project breakdown with these labels:",
    "Goal:",
    "Problem:",
    "Approach:",
    "Result:",
    "If some fields are not fully filled in the project source, stay modest and rely on the provided project summary without inventing extra claims.",
    "",
    projectInfo
  ].join('\n');

  askProxy(query)
    .then(data => {
      btn.classList.remove('loading');
      const summary = data && data.answer
        ? data.answer
        : 'Project brief is not available yet. You can fill more detail in worker/project.txt.';
      tooltipBody.innerHTML = renderProjectSummaryContent(summary);
      tooltip.classList.add('show');
    })
    .catch(err => {
      btn.classList.remove('loading');
      tooltipBody.innerHTML = renderProjectSummaryStatus('Project brief is not available right now.');
      tooltip.classList.add('show');
      console.error('AI summary error:', err);
    });
}

function renderProjectModal(p) {
  const embedCfg = projectEmbeds[p.id] || null;
  const useEmbedAsCover = !!(embedCfg && embedCfg.useAsCover);
  const activeImage = currentProjectGallery[currentProjectImageIndex] || p.image || '';
  const activeIsVideo = isVideoMedia(activeImage);
  const activePreviewImage = activeIsVideo ? activeImage : getImmediatePreferredImage(activeImage);
  const prevIdx = (currentProjectIndex - 1 + currentFilteredProjects.length) % currentFilteredProjects.length;
  const nextIdx = (currentProjectIndex + 1) % currentFilteredProjects.length;
  const prevTitle = currentFilteredProjects[prevIdx]?.title.split(' - ')[0].trim() || '';
  const nextTitle = currentFilteredProjects[nextIdx]?.title.split(' - ')[0].trim() || '';

  document.getElementById('projectModalContent').innerHTML = `
    <button class="pm-close" onclick="closeProject()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <div class="pm-hero">
      ${useEmbedAsCover
        ? `<div class="pm-hero-embed" data-project-embed="${p.id}"></div>`
        : (activeImage ? (
        activeIsVideo
          ? '<video class="pm-hero-video" id="pmHeroVideo" src="'+activeImage+'" playsinline muted loop autoplay controls preload="metadata" onclick="openImageLightbox(this.currentSrc || this.src)"></video>'
          : '<img class="pm-hero-img" id="pmHeroImage" src="'+activePreviewImage+'" data-base-src="'+activeImage+'" alt="'+p.title+'" loading="eager" decoding="async" fetchpriority="high" onclick="openImageLightbox(this.getAttribute(\'data-base-src\') || this.currentSrc || this.src)">'
      ) : '<div class="pm-hero-emoji">'+p.thumbnail+'</div>')}
      <div class="pm-hero-gradient"></div>
      ${activeImage && !useEmbedAsCover ? `
      <div class="pm-hero-controls">
        <div class="pm-hero-left">
          <button class="pm-hero-btn" onclick="navProjectImage(-1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div class="pm-image-count" id="pmImageCount">${currentProjectImageIndex + 1} / ${currentProjectGallery.length}</div>
          <button class="pm-hero-btn" onclick="navProjectImage(1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="pm-expand-btn" onclick="toggleProjectExpanded()">${UI_TEXT.expandLabel}</button>
          <button class="pm-preview-close" id="pmPreviewClose" onclick="closeStoryPreview()">${UI_TEXT.coverLabel}</button>
        </div>
      </div>` : ''}
    </div>
    ${currentProjectGallery.length > 1 ? `
    <div class="pm-gallery">
      ${currentProjectGallery.map((img, i) => `
        <button class="pm-gallery-thumb ${i === currentProjectImageIndex ? 'active' : ''}" onclick="setProjectImage(${i})">
          ${isVideoMedia(img)
            ? `<div class="pm-gallery-video-thumb" role="img" aria-label="${p.title + ' video ' + (i + 1)}"><span class="pm-video-thumb-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 6.5v11l9-5.5-9-5.5z"></path></svg></span><span class="pm-video-thumb-badge">Video</span></div>`
            : `<img src="${getImmediatePreferredImage(img)}" data-base-src="${img}" alt="${p.title + ' ' + (i + 1)}" loading="lazy" decoding="async" fetchpriority="low">`
          }
          ${currentProjectCaptions[img] ? `<div class="pm-gallery-caption">${currentProjectCaptions[img]}</div>` : ''}
        </button>
      `).join('')}
    </div>` : ''}
    <div class="pm-body">
      <div class="pm-tags" style="display:flex;align-items:center;">
        ${p.categories.map(c => '<span class="pm-tag">'+(catLabels[c]||c)+'</span>').join('')}
      </div>
      <div class="pm-title-row">
        <div class="pm-title">${p.title}</div>
        ${currentProjectGallery.length > 1 ? `<div class="pm-gallery-chip">${UI_TEXT.projectsGallery}</div>` : ''}
      </div>
      <div class="pm-desc">${p.description}</div>
      <div class="pm-ai-wrap">
        <button type="button" class="pm-ai-wizard" id="pmAiWizard" onclick="event.stopPropagation(); getProjectSummary();" title="Summarize with AI">
          <span class="pm-ai-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5.2l1.45 3.85 3.85 1.45-3.85 1.45L12 15.8l-1.45-3.85-3.85-1.45 3.85-1.45L12 5.2z"></path>
              <path d="M18.4 5.4l.45 1.15L20 7l-1.15.45-.45 1.15-.45-1.15L16.8 7l1.15-.45.45-1.15z"></path>
            </svg>
          </span>
          <span class="pm-ai-label">Summarize it</span>
        </button>
        <div class="pm-ai-tooltip" id="pmAiTooltip">
          <div class="pm-ai-tooltip-head">
            <div class="pm-ai-tooltip-title">Project Summary</div>
            <div class="pm-ai-tooltip-actions">
              <button type="button" class="pm-ai-tooltip-action" id="pmAiTooltipExpand" onclick="toggleProjectSummaryExpanded(event)" title="Expand" aria-expanded="false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              </button>
              <button type="button" class="pm-ai-tooltip-action" onclick="closeProjectSummary(event)" title="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="pm-ai-tooltip-body" id="pmAiTooltipBody"></div>
        </div>
      </div>
      <div class="pm-details">
        <div class="pm-detail-row">
          <div class="pm-detail-label">${UI_TEXT.toolsLabel}</div>
          <div class="pm-detail-value">${p.tools.map(t => '<span class="tool-chip">'+t+'</span>').join('')}</div>
        </div>
      </div>
      ${embedCfg && !useEmbedAsCover ? `
      <div class="pm-embed-block">
        <div class="pm-embed-title">${UI_TEXT.tourLabel}</div>
        <div class="pm-embed-host" data-project-embed="${p.id}"></div>
      </div>` : ''}
      ${renderProjectStorySection(p)}
      ${currentFilteredProjects.length > 1 ? `
      <div class="pm-nav">
        <button class="pm-nav-btn" onclick="navProject(-1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          ${prevTitle}
        </button>
        <button class="pm-nav-btn" onclick="navProject(1)">
          ${nextTitle}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>` : ''}
    </div>`;
  const modal = document.getElementById('projectModalContent');
  if (modal) modal.onscroll = onProjectModalScroll;
  syncProjectImageState();
  applyStoryImageLayout();
  enhanceModalImageQuality();
  attachProjectStoryTrack();
  mountProjectEmbeds(p.id);
}
// --- KEYWORD MAP ---
const keywordMap = {
  "ui":"ui-ux","ux":"ui-ux","interface":"ui-ux","design":"ui-ux","app":"ui-ux","web":"ui-ux",
  "3d":"3d","three":"3d","modeling":"3d","render":"3d","rendering":"3d","webgl":"3d","blender":"3d",
  "ai":"ai","artificial":"ai","machine":"ai","ml":"ai","neural":"ai","generative":"ai","gpt":"ai","llm":"ai",
  "vr":"vr-ar","ar":"vr-ar","virtual":"vr-ar","augmented":"vr-ar","mixed":"vr-ar","immersive":"vr-ar","metaverse":"vr-ar","quest":"vr-ar","hololens":"vr-ar",
  "architecture":"architecture","architectural":"architecture","building":"architecture","urban":"architecture","residential":"architecture","city":"architecture",
  "unreal":"unreal","ue5":"unreal","unity":"unity",
  "figma":"figma","framer":"framer","webflow":"webflow",
  "comfyui":"comfyui","stable diffusion":"stable-diffusion","midjourney":"midjourney",
  "rhino":"rhino","grasshopper":"grasshopper",
  "react":"react","python":"python","threejs":"threejs",
  "touchdesigner":"touchdesigner","substance":"substance",
  "dashboard":"dashboard","ecommerce":"ecommerce","e-commerce":"ecommerce",
  "mobile":"mobile","banking":"banking",
  "configurator":"configurator","product":"product",
  "gallery":"gallery","visualization":"visualization","archviz":"archviz",
  "workflow":"workflow","pipeline":"pipeline","automation":"automation",
  "simulation":"simulation","training":"training","industrial":"industrial",
  "design system":"design-system","components":"components",
  "chatbot":"chatbot","conversational":"conversational","chat":"chatbot",
  "art":"ai-art","collection":"collection",
  "parametric":"parametric","algorithmic":"algorithmic",
  "spatial":"spatial","hand tracking":"hand-tracking",
  "dark":"dark-mode","luxury":"luxury","fashion":"fashion",
  "masterplan":"masterplan","smart city":"smart-city",
  "audio":"audio","music":"audio","visualizer":"visualizer",
  "shader":"shaders","shaders":"shaders",
  "asset":"asset","texture":"texturing","texturing":"texturing",
  "portfolio":"portfolio","website":"website"
};

const catLabels = {"ui-ux":"UI/UX","3d":"3D","ai":"AI","vr-ar":"VR/AR","architecture":"Architecture"};
const categoryAliases = {
  "ar-vr": "vr-ar",
  "vr/ar": "vr-ar",
  "ar/vr": "vr-ar",
  "uiux": "ui-ux",
  "ui/ux": "ui-ux"
};
const categoryRoutePaths = {
  "ui-ux": "/uiux",
  "3d": "/3d",
  "ai": "/ai",
  "vr-ar": "/vr-ar",
  "architecture": "/architecture"
};
const routeCategoryAliases = {
  "/uiux": "ui-ux",
  "/ui-ux": "ui-ux",
  "/3d": "3d",
  "/ai": "ai",
  "/vr-ar": "vr-ar",
  "/vr": "vr-ar",
  "/architecture": "architecture"
};
const SITE_ORIGIN = "https://fatihgulen.com";
const SEO_DEFAULTS = {
  title: "Fatih Gulen | Realtime Experience Designer Portfolio",
  description: "Fatih Gulen is a realtime experience designer creating UI/UX, 3D, AI, VR/AR, and architectural visualization work from Germany.",
  path: "/",
  image: "images/3D/Whaf/image (3).webp",
  imageAlt: "Selected realtime experience design work by Fatih Gulen"
};
const categorySeoMeta = {
  "ui-ux": {
    title: "UI/UX Design Projects | Fatih Gulen",
    description: "Product, dashboard, and interface design case studies by Fatih Gulen spanning mobile, SaaS, and automotive UI."
  },
  "3d": {
    title: "3D Projects | Fatih Gulen",
    description: "Realtime and high-fidelity 3D visualization work covering product visuals, materials, assets, and VFX."
  },
  "ai": {
    title: "AI Projects | Fatih Gulen",
    description: "AI-assisted creative pipelines, generative visuals, and research-driven workflows by Fatih Gulen."
  },
  "vr-ar": {
    title: "VR/AR Projects | Fatih Gulen",
    description: "Immersive VR and AR work including training, prototyping, spatial UI, and interactive experiences."
  },
  "architecture": {
    title: "Architecture Projects | Fatih Gulen",
    description: "Architectural visualization, interior design, and presentation work for residential and commercial spaces."
  }
};

function stripMetaFormatting(text) {
  return String(text || '')
    .replace(/\*\*/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampMetaDescription(text, maxLength = 180) {
  const normalizedText = stripMetaFormatting(text);
  if (normalizedText.length <= maxLength) return normalizedText;
  const clipped = normalizedText.slice(0, maxLength - 1);
  const lastBreak = clipped.lastIndexOf(' ');
  return `${(lastBreak > 72 ? clipped.slice(0, lastBreak) : clipped).trim()}…`;
}

function toAbsoluteSiteUrl(path) {
  const normalizedPath = normalizeImagePath(path || '/');
  try {
    return new URL(normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`, SITE_ORIGIN).toString();
  } catch (error) {
    return SITE_ORIGIN;
  }
}

function setMetaTagContent(selector, value) {
  const el = document.querySelector(selector);
  if (el && value) el.setAttribute('content', value);
}

function setLinkHref(selector, value) {
  const el = document.querySelector(selector);
  if (el && value) el.setAttribute('href', value);
}

function getActiveCategoryId() {
  const activePill = document.querySelector('.cat-pill.active');
  return normalizeCategoryId(activePill ? activePill.dataset.cat : '');
}

function buildHomeSeoMeta() {
  return {
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    url: toAbsoluteSiteUrl(SEO_DEFAULTS.path),
    image: toAbsoluteSiteUrl(SEO_DEFAULTS.image),
    imageAlt: SEO_DEFAULTS.imageAlt
  };
}

function buildCategorySeoMeta(catId) {
  const normalizedCatId = normalizeCategoryId(catId);
  const seoCopy = categorySeoMeta[normalizedCatId] || {};
  const fallbackProject = projects.find((project) => Array.isArray(project.categories) && project.categories.includes(normalizedCatId));
  return {
    title: seoCopy.title || `${catLabels[normalizedCatId] || normalizedCatId} Projects | Fatih Gulen`,
    description: seoCopy.description || SEO_DEFAULTS.description,
    url: toAbsoluteSiteUrl(getCategoryPath(normalizedCatId)),
    image: toAbsoluteSiteUrl(getProjectCardImage(fallbackProject) || (fallbackProject && fallbackProject.image) || SEO_DEFAULTS.image),
    imageAlt: `${catLabels[normalizedCatId] || normalizedCatId} portfolio work by Fatih Gulen`
  };
}

function buildProjectSeoMeta(project) {
  const primaryCategory = getProjectPrimaryCategory(project);
  return {
    title: `${stripMetaFormatting(project.title)} | Fatih Gulen`,
    description: clampMetaDescription(project.description || SEO_DEFAULTS.description),
    url: toAbsoluteSiteUrl(getProjectSharePath(project)),
    image: toAbsoluteSiteUrl(getProjectCardImage(project) || project.image || SEO_DEFAULTS.image),
    imageAlt: `${stripMetaFormatting(project.title)} by Fatih Gulen`,
    category: primaryCategory
  };
}

function applySeoMeta(meta) {
  const nextMeta = meta || buildHomeSeoMeta();
  document.title = nextMeta.title;
  setMetaTagContent('meta[name="description"]', nextMeta.description);
  setLinkHref('link[rel="canonical"]', nextMeta.url);
  setMetaTagContent('meta[property="og:title"]', nextMeta.title);
  setMetaTagContent('meta[property="og:description"]', nextMeta.description);
  setMetaTagContent('meta[property="og:url"]', nextMeta.url);
  setMetaTagContent('meta[property="og:image"]', nextMeta.image);
  setMetaTagContent('meta[property="og:image:alt"]', nextMeta.imageAlt);
  setMetaTagContent('meta[name="twitter:title"]', nextMeta.title);
  setMetaTagContent('meta[name="twitter:description"]', nextMeta.description);
  setMetaTagContent('meta[name="twitter:image"]', nextMeta.image);
  setMetaTagContent('meta[name="twitter:image:alt"]', nextMeta.imageAlt);
}
// UI text config area: edit these labels from one place.
const UI_TEXT = {
  projectsGallery: "Projects Gallery",
  toolsLabel: "Tools",
  tourLabel: "360 Tour",
  expandLabel: "Expand",
  coverLabel: "Cover"
};

const defaultSuggestedPrompts = [
  "Who is Fatih?",
  "How many years of experience?",
  "What tools does he use?",
  "Where did he study?",
  "Contact details"
];

const searchPlaceholderOptions = [
  'Try: "Show me your Unreal VR projects"',
  'Try: "Show me dashboard UI case studies"',
  'Try: "Show me 3D product visualization work"',
  'Try: "Show me AI workflows with ComfyUI"',
  'Try: "Show me architectural visualization projects"'
];

const categorySuggestedPrompts = {
  "ui-ux": [
    "Show UI dashboard examples for complex platforms",
    "Show UI flows for mobile app products",
    "What tools does he used for UI/UX design projects?",
    "Show automotive UI and EV dashboard projects",
    "Show web interface case studies for product design"
  ],
  "3d": [
    "Show 3D product visualization with realistic materials",
    "Show 3D Mid-poly Asset",
    "Which tools does he use for 3D material library and PBR texture work",
    "Show 3D concept modeling and digital sculpture projects",
    "Tell me how he started doing 3D work?"
  ],
  "ai": [
    "Show ComfyUI workflows for image generation pipelines",
    "Show AI-assisted character creation projects",
    "Show generative AI research and thesis work",
    "Show Production ready marketing visuals generated with AI",
    "Show AI art projects trained on custom datasets"
  ],
  "vr-ar": [
    "Show VR training simulations built in Unity",
    "Show spatial UI and immersive interaction projects",
    "What tool does he used at Huawei VR projects",
    "Show interactive 3D environments for XR experiences",
    "Show industrial or simulation-focused VR work"
  ],
  "architecture": [
    "Show architectural visualization for residential projects",
    "Show interior design renders with atmospheric lighting",
    "How he presented the interior design projects to clients and stakeholders?",
    "Tell me about his Interior Design background and projects",
    "Show commercial architecture and fitness space visualization work"
  ]
};

function normalizeCategoryId(catId) {
  const normalized = String(catId || "").trim().toLowerCase();
  return categoryAliases[normalized] || normalized;
}

function getSuggestedPromptsForCategory(catId) {
  const normalizedCatId = normalizeCategoryId(catId);
  return categorySuggestedPrompts[normalizedCatId] || defaultSuggestedPrompts;
}

function renderSuggestedPrompts(catId) {
  const container = document.getElementById("suggestedPrompts");
  if (!container) return;
  const normalizedCatId = normalizeCategoryId(catId);
  const prompts = getSuggestedPromptsForCategory(normalizedCatId);
  const isCategoryMode = Boolean(categorySuggestedPrompts[normalizedCatId]);
  const renderChip = (prompt) => '<button class="suggest-chip" onclick="usePrompt(this)">' + escapeHtml(prompt) + "</button>";

  container.classList.toggle("category-prompts", isCategoryMode);

  if (!isCategoryMode) {
    container.innerHTML = prompts.map(renderChip).join("");
    return;
  }

  const rows = [prompts.slice(0, 3), prompts.slice(3)];
  container.innerHTML = rows
    .filter((row) => row.length)
    .map((row) => '<div class="suggested-row">' + row.map(renderChip).join("") + "</div>")
    .join("");
}

function getRandomSearchPlaceholder(currentPlaceholder) {
  const current = String(currentPlaceholder || "").trim();
  const pool = searchPlaceholderOptions.filter((item) => item !== current);
  const choices = pool.length ? pool : searchPlaceholderOptions;
  return choices[Math.floor(Math.random() * choices.length)];
}

function applyRandomSearchPlaceholder(options = {}) {
  const input = document.getElementById("chatInput");
  if (!input) return;
  if (!options.force && input.value.trim()) return;
  input.placeholder = getRandomSearchPlaceholder(input.placeholder);
}

function normalizeRoutePath(pathname) {
  let normalized = String(pathname || "/").trim() || "/";
  normalized = normalized.replace(/\/index\.html$/i, "/");
  if (!normalized.startsWith("/")) normalized = "/" + normalized;
  if (normalized.length > 1) normalized = normalized.replace(/\/+$/, "");
  return normalized || "/";
}

function getProjectFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const queryProjectId = String(params.get("project") || "").trim();
  if (getProjectById(queryProjectId)) return getProjectById(queryProjectId);
  const routePath = normalizeRoutePath(window.location.pathname);
  const projectMatch = routePath.match(/^\/project\/([^/]+)$/i);
  if (!projectMatch) return null;
  return getProjectByRouteSlug(decodeURIComponent(projectMatch[1]));
}

function getCategoryFromLocation(project) {
  const routePath = normalizeRoutePath(window.location.pathname);
  const routeCategory = routeCategoryAliases[routePath];
  if (routeCategory) return routeCategory;
  const params = new URLSearchParams(window.location.search);
  const queryCategory = normalizeCategoryId(params.get("category"));
  return catLabels[queryCategory] ? queryCategory : "";
}

function getCategoryPath(catId) {
  const normalizedCatId = normalizeCategoryId(catId);
  return categoryRoutePaths[normalizedCatId] || "/";
}

function buildUrlForView(options = {}) {
  const project = getProjectById(options.projectId);
  if (project) return getProjectSharePath(project);
  const normalizedCatId = normalizeCategoryId(options.category);
  return normalizedCatId && catLabels[normalizedCatId] ? getCategoryPath(normalizedCatId) : "/";
}

function updateUrlForView(options = {}) {
  if (typeof window === "undefined" || !window.history || typeof window.history.pushState !== "function") return;
  const nextPath = buildUrlForView(options);
  const currentPath = normalizeRoutePath(window.location.pathname);
  const currentSearch = window.location.search || "";
  const alreadySynced = currentPath === nextPath && !currentSearch;
  if (alreadySynced) return;
  const method = options.replace ? "replaceState" : "pushState";
  window.history[method]({
    category: options.category || null,
    projectId: options.projectId || null
  }, "", nextPath);
}

function updateUrlForCategory(catId, options = {}) {
  const normalizedCatId = normalizeCategoryId(catId);
  updateUrlForView({
    category: normalizedCatId,
    replace: Boolean(options.replace),
    projectId: options.projectId || ""
  });
}

function syncViewWithLocation(options = {}) {
  const project = getProjectFromLocation();
  const routeCategory = getCategoryFromLocation(project) || getProjectPrimaryCategory(project);
  const modalOpen = document.getElementById('projectModal')?.classList.contains('open');

  if (routeCategory) {
    applyCategoryFilter(routeCategory, { keepInput: true, replaceUrl: true, skipUrl: true });
  } else {
    resetView({ replaceUrl: true, skipUrl: true });
  }

  if (project) {
    if (!modalOpen || !currentProject || currentProject.id !== project.id) {
      openProject(project.id, { replaceUrl: true });
    } else {
      applySeoMeta(buildProjectSeoMeta(project));
    }
    return;
  }

  if (modalOpen) {
    closeProject({ skipUrl: true });
  }

  if (routeCategory) {
    applySeoMeta(buildCategorySeoMeta(routeCategory));
    if (!options.skipUrl) updateUrlForView({ category: routeCategory, replace: true });
    return;
  }

  applySeoMeta(buildHomeSeoMeta());
  if (!options.skipUrl) updateUrlForView({ replace: true });
}

function normalizeProjectCategories() {
  projects.forEach((project) => {
    const normalized = (Array.isArray(project.categories) ? project.categories : [])
      .map(normalizeCategoryId)
      .filter((category, index, list) => category && catLabels[category] && list.indexOf(category) === index);

    project.categories = normalized;
  });
}

function syncCategoryCounts() {
  document.querySelectorAll('#categories .cat-pill').forEach((pill) => {
    const catId = normalizeCategoryId(pill.dataset.cat);
    const countEl = pill.querySelector('.pill-count');
    if (!countEl) return;
    countEl.textContent = String(filterByCategory(catId).length);
  });
}

// --- SEARCH ---
function searchProjects(query) {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);
  const scores = {};
  projects.forEach(p => {
    let score = 0;
    const searchable = [...p.categories,...p.tags,...p.tools.map(t=>t.toLowerCase()),p.title.toLowerCase(),p.description.toLowerCase()].join(' ');
    words.forEach(word => {
      if (keywordMap[word]) {
        const mapped = keywordMap[word];
        if (p.categories.includes(mapped)) score += 10;
        if (p.tags.includes(mapped)) score += 8;
        if (p.tools.map(t=>t.toLowerCase()).some(t=>t.includes(mapped))) score += 8;
        if (searchable.includes(mapped)) score += 3;
      }
    });
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i]+' '+words[i+1];
      if (keywordMap[bigram]) {
        const mapped = keywordMap[bigram];
        if (p.tags.includes(mapped)) score += 12;
        if (searchable.includes(mapped)) score += 5;
      }
    }
    words.forEach(word => { if (word.length >= 2 && searchable.includes(word)) score += 2; });
    if (score > 0) scores[p.id] = score;
  });
  return projects.filter(p=>scores[p.id]).sort((a,b)=>scores[b.id]-scores[a.id]);
}
function filterByCategory(catId) {
  const normalizedCatId = normalizeCategoryId(catId);
  return projects.filter((p) => p.categories.includes(normalizedCatId));
}

const aiFallbackFollowups = [
  "Who is Fatih?",
  "How many years of experience?",
  "Show VR projects",
  "Contact details"
];
const AI_ENDPOINT = (window.AI_ENDPOINT && String(window.AI_ENDPOINT).trim())
  ? String(window.AI_ENDPOINT).trim()
  : "https://fatih-portfolio-ai-proxy.fatihgulen-53.workers.dev/api/ask";
const AI_HEALTH_ENDPOINT = (window.AI_HEALTH_ENDPOINT && String(window.AI_HEALTH_ENDPOINT).trim())
  ? String(window.AI_HEALTH_ENDPOINT).trim()
  : (AI_ENDPOINT === "/api/ask"
    ? "/api/ask/health"
    : "");
const AI_SESSION_LIMIT = 15;
const AI_SESSION_ID_KEY = "pm_ai_session_id";
const AI_SESSION_USAGE_KEY = "pm_ai_session_usage_v1";
const aiUnknownFallback = "No exact match was found, but the portfolio covers UI/UX, 3D, AI, VR/AR, and Architecture projects.";
const aiThreshold = 0.58;
let aiKbCache = null;
let aiSessionIdMemory = "";
let aiSessionUsageMemory = null;
const aiProfileLayoutSignals = {
  about: ["who is fatih", "about fatih", "tell me about fatih", "fatih profile", "who is he", "about him"],
  contact: ["contact", "contact details", "email", "e mail", "mail", "linkedin", "phone", "phone number", "how to reach", "reach fatih"]
};
const localKbPriorityIntents = new Set();
const inlinePriorityKb = [
  {
    intent: "about_fatih",
    keywords: ["who is fatih", "about fatih", "tell me about fatih", "fatih profile", "who is he"],
    responses: [
      "Fatih Gulen is a Digital Experience Designer based in Germany, in the Frankfurt area. His background combines UI/UX design, real-time and interactive design, 3D visualization, motion design, and AI-assisted creative production."
    ],
    followups: ["Contact details", "What tools does he use?", "Where did he study?", "Show VR projects"]
  },
  {
    intent: "contact_info",
    keywords: ["contact", "contact details", "email", "e mail", "mail", "linkedin", "phone", "phone number", "how to reach", "reach fatih"],
    responses: [
      "Fatih Gulen can be contacted at faatihgulen@gmail.com, by phone at +49 17637160838, or via LinkedIn at https://www.linkedin.com/in/faatihgulen."
    ],
    followups: ["Who is Fatih?", "Where is he based?", "Where did he study?", "What tools does he use?"]
  }
];

const turkishCharMap = {
  "ı": "i",
  "ş": "s",
  "ğ": "g",
  "ü": "u",
  "ö": "o",
  "ç": "c"
};

const navigationalSignals = {
  "ui-ux": ["ui", "ux", "ui ux", "ui/ux", "interface", "tasarim", "design system", "dashboard"],
  "3d": ["3d", "model", "render", "rendering", "materials", "vfx", "asset"],
  "ai": ["ai", "artificial intelligence", "comfyui", "generative", "thesis"],
  "vr-ar": ["vr", "ar", "xr", "virtual reality", "augmented", "spatial", "unity", "huawei"],
  "architecture": ["architecture", "interior", "archviz", "villa", "residential"]
};

function readSessionValue(key) {
  try { return window.sessionStorage.getItem(key); } catch (_) { return null; }
}

function writeSessionValue(key, value) {
  try { window.sessionStorage.setItem(key, value); } catch (_) {}
}

function createAiSessionId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "pm-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
}

function getAiSessionId() {
  const stored = readSessionValue(AI_SESSION_ID_KEY);
  if (stored) {
    aiSessionIdMemory = stored;
    return stored;
  }
  if (!aiSessionIdMemory) {
    aiSessionIdMemory = createAiSessionId();
    writeSessionValue(AI_SESSION_ID_KEY, aiSessionIdMemory);
  }
  return aiSessionIdMemory;
}

function readAiSessionUsage() {
  const stored = readSessionValue(AI_SESSION_USAGE_KEY);
  if (stored !== null) {
    const parsed = Number.parseInt(stored, 10);
    aiSessionUsageMemory = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    return aiSessionUsageMemory;
  }
  if (aiSessionUsageMemory === null) aiSessionUsageMemory = 0;
  return aiSessionUsageMemory;
}

function writeAiSessionUsage(count) {
  const safeCount = Math.max(0, Number.parseInt(String(count), 10) || 0);
  aiSessionUsageMemory = safeCount;
  writeSessionValue(AI_SESSION_USAGE_KEY, String(safeCount));
}

function reserveAiSessionRequest() {
  const used = readAiSessionUsage();
  const sessionId = getAiSessionId();
  if (used >= AI_SESSION_LIMIT) {
    return {
      allowed: false,
      sessionId,
      used,
      remaining: 0,
      limit: AI_SESSION_LIMIT
    };
  }
  const nextUsed = used + 1;
  writeAiSessionUsage(nextUsed);
  return {
    allowed: true,
    sessionId,
    used: nextUsed,
    remaining: Math.max(0, AI_SESSION_LIMIT - nextUsed),
    limit: AI_SESSION_LIMIT
  };
}

function normalizeQuery(raw) {
  const lower = String(raw || "").toLowerCase().trim();
  const mapped = lower.replace(/[ışğüöç]/g, ch => turkishCharMap[ch] || ch);
  const noPunctuation = mapped.replace(/[^a-z0-9\s]/g, " ");
  return noPunctuation.replace(/\s+/g, " ").trim();
}

function shouldUseProfileAnswerLayout(query) {
  const normalized = normalizeQuery(query);
  if (!normalized) return false;
  return aiProfileLayoutSignals.about.some(signal => normalized.includes(signal)) ||
    aiProfileLayoutSignals.contact.some(signal => normalized.includes(signal));
}

function syncAiAnswerPresentation(query) {
  const answerMain = document.getElementById("aiAnswerMain");
  const profilePanel = document.getElementById("aiProfilePanel");
  const useProfileLayout = shouldUseProfileAnswerLayout(query);
  if (answerMain) answerMain.classList.toggle("profile-mode", useProfileLayout);
  if (profilePanel) profilePanel.hidden = !useProfileLayout;
}

function tokenize(text) {
  return normalizeQuery(text).split(" ").filter(Boolean);
}

function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function stringSimilarity(a, b) {
  if (!a || !b) return 0;
  const distance = levenshteinDistance(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

function tokenOverlapScore(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const bSet = new Set(bTokens);
  const overlap = aTokens.filter(t => bSet.has(t)).length;
  return overlap / Math.max(aTokens.length, bTokens.length);
}

const projectSuggestionStopWords = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "than", "to", "of", "in", "on", "at", "for", "from", "with", "by",
  "about", "around", "into", "through", "over", "under", "as", "show", "tell", "me", "his", "her", "their", "them",
  "this", "that", "these", "those", "he", "she", "it", "its", "does", "did", "do", "is", "are", "was", "were", "be",
  "being", "been", "what", "which", "who", "how", "when", "where", "why", "can", "could", "would", "should", "will",
  "like", "please", "project", "projects", "case", "study", "studies", "example", "examples", "work", "works",
  "portfolio", "tool", "tools", "used", "use", "using"
]);
const projectSuggestionIgnoreSignals = [
  "who is fatih",
  "contact details",
  "how many years of experience",
  "what roles is he looking for",
  "where is he based",
  "phone number",
  "linkedin profile",
  "resume",
  "cv"
];
const projectSuggestionContextSignals = [
  "project", "projects", "case study", "case studies", "visualization", "render", "renders", "dashboard", "mobile",
  "character", "comfyui", "interior", "archviz", "design system", "simulation", "spatial", "xr", "asset", "assets",
  "materials", "texture", "textures", "product", "car", "automotive", "ev", "unity", "huawei", "concept",
  "sculpture", "workflow", "pipeline", "marketing visuals", "diffusion", "portfolio website"
];
const projectSuggestionCategoryTokens = new Set(["ui", "ux", "3d", "ai", "vr", "ar", "xr", "architecture"]);
const projectSuggestionEntries = projects.map(buildProjectSuggestionEntry);
const projectSuggestionTokenFrequency = buildProjectSuggestionTokenFrequency(projectSuggestionEntries);

function collectProjectSuggestionTokens(value) {
  return tokenize(value).filter((token) => {
    if (!token || projectSuggestionStopWords.has(token)) return false;
    return token.length > 1 || token === "ai";
  });
}

function buildProjectSuggestionPhrases(tokens, minSize = 2, maxSize = 3) {
  const phrases = [];
  for (let size = minSize; size <= maxSize; size += 1) {
    for (let i = 0; i <= tokens.length - size; i += 1) {
      phrases.push(tokens.slice(i, i + size).join(" "));
    }
  }
  return Array.from(new Set(phrases));
}

function buildProjectSuggestionEntry(project) {
  const titleText = normalizeQuery(project.title);
  const descriptionText = normalizeQuery(project.description);
  const tagTexts = (Array.isArray(project.tags) ? project.tags : []).map(normalizeQuery).filter(Boolean);
  const toolTexts = (Array.isArray(project.tools) ? project.tools : []).map(normalizeQuery).filter(Boolean);
  const categoryTexts = (Array.isArray(project.categories) ? project.categories : [])
    .map((catId) => normalizeQuery(catLabels[catId] || catId))
    .filter(Boolean);

  return {
    project,
    titleText,
    descriptionText,
    tagTexts,
    toolTexts,
    categoryTexts,
    titleTokens: Array.from(new Set(collectProjectSuggestionTokens(project.title))),
    descriptionTokens: Array.from(new Set(collectProjectSuggestionTokens(project.description))),
    tagTokens: Array.from(new Set(tagTexts.flatMap((text) => collectProjectSuggestionTokens(text)))),
    toolTokens: Array.from(new Set(toolTexts.flatMap((text) => collectProjectSuggestionTokens(text)))),
    categoryTokens: Array.from(new Set(categoryTexts.flatMap((text) => collectProjectSuggestionTokens(text)))),
    signatureTokens: []
  };
}

function buildProjectSuggestionTokenFrequency(entries) {
  const frequency = {};
  entries.forEach((entry) => {
    const signatureTokens = Array.from(new Set([
      ...entry.titleTokens,
      ...entry.tagTokens,
      ...entry.toolTokens
    ]));
    entry.signatureTokens = signatureTokens;
    signatureTokens.forEach((token) => {
      frequency[token] = (frequency[token] || 0) + 1;
    });
  });
  return frequency;
}

function getProjectSuggestionSpecificity(token) {
  const frequency = projectSuggestionTokenFrequency[token] || 1;
  if (projectSuggestionCategoryTokens.has(token)) return 0.28;
  if (frequency <= 1) return 1;
  if (frequency === 2) return 0.82;
  if (frequency === 3) return 0.62;
  if (frequency === 4) return 0.45;
  return 0.3;
}

function hasProjectSuggestionContext(normalizedQuery) {
  return projectSuggestionContextSignals.some((signal) => normalizedQuery.includes(signal));
}

function shouldSkipProjectSuggestionQuery(query) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return true;
  const hasIgnoreSignal = projectSuggestionIgnoreSignals.some((signal) => normalizedQuery.includes(signal));
  if (!hasIgnoreSignal) return false;
  return !hasProjectSuggestionContext(normalizedQuery);
}

function scoreProjectSuggestion(queryTokens, queryPhrases, entry) {
  let score = 0;
  let exactTitle = false;
  let matchedTitleTokens = 0;
  let matchedTagTokens = 0;
  let matchedToolTokens = 0;
  let matchedDescriptionTokens = 0;
  let matchedCategoryTokens = 0;
  let matchedPhrases = 0;
  let matchedRareTokens = 0;
  const matchedQueryTokens = new Set();
  const compactQuery = queryTokens.join(" ");

  if (queryTokens.length >= 2 && compactQuery.length >= 6) {
    if (compactQuery === entry.titleText) {
      score += 96;
      exactTitle = true;
    } else if (entry.titleText.includes(compactQuery) || compactQuery.includes(entry.titleText)) {
      score += 72;
      exactTitle = true;
    }
  }

  queryPhrases.forEach((phrase) => {
    if (phrase.length < 5) return;
    if (entry.titleText.includes(phrase)) {
      score += 24;
      matchedPhrases += 1;
      return;
    }
    if (entry.tagTexts.some((tag) => tag.includes(phrase))) {
      score += 20;
      matchedPhrases += 1;
      return;
    }
    if (entry.toolTexts.some((tool) => tool.includes(phrase))) {
      score += 17;
      matchedPhrases += 1;
      return;
    }
    if (entry.descriptionText.includes(phrase)) {
      score += 10;
      matchedPhrases += 1;
    }
  });

  queryTokens.forEach((token) => {
    const specificity = getProjectSuggestionSpecificity(token);
    const rareHit = specificity >= 0.82;
    if (entry.titleTokens.includes(token)) {
      score += Math.round(12 + (16 * specificity));
      matchedTitleTokens += 1;
      matchedQueryTokens.add(token);
      if (rareHit) matchedRareTokens += 1;
      return;
    }
    if (entry.tagTokens.includes(token)) {
      score += Math.round(9 + (14 * specificity));
      matchedTagTokens += 1;
      matchedQueryTokens.add(token);
      if (rareHit) matchedRareTokens += 1;
      return;
    }
    if (entry.toolTokens.includes(token)) {
      score += Math.round(8 + (12 * specificity));
      matchedToolTokens += 1;
      matchedQueryTokens.add(token);
      if (rareHit) matchedRareTokens += 1;
      return;
    }
    if (entry.descriptionTokens.includes(token)) {
      score += Math.round(4 + (7 * specificity));
      matchedDescriptionTokens += 1;
      matchedQueryTokens.add(token);
      return;
    }
    if (entry.categoryTokens.includes(token)) {
      score += Math.round(2 + (3 * specificity));
      matchedCategoryTokens += 1;
      matchedQueryTokens.add(token);
    }
  });

  if (matchedTitleTokens && matchedTagTokens) score += 10;
  if (matchedTagTokens && matchedToolTokens) score += 6;

  return {
    score,
    exactTitle,
    matchedTitleTokens,
    matchedTagTokens,
    matchedToolTokens,
    matchedDescriptionTokens,
    matchedCategoryTokens,
    matchedPhrases,
    matchedRareTokens,
    coverage: matchedQueryTokens.size / Math.max(queryTokens.length, 1)
  };
}

function findRelatedProjectForAiAnswer(query) {
  if (shouldSkipProjectSuggestionQuery(query)) return null;

  const queryTokens = Array.from(new Set(collectProjectSuggestionTokens(query)));
  if (!queryTokens.length) return null;

  const normalizedQuery = normalizeQuery(query);
  const queryPhrases = buildProjectSuggestionPhrases(queryTokens);
  const focusedTokens = queryTokens.filter((token) => !projectSuggestionCategoryTokens.has(token));
  const broadCategoryQuery = focusedTokens.length <= 1 && hasProjectSuggestionContext(normalizedQuery);
  const ranked = projectSuggestionEntries
    .map((entry) => ({
      entry,
      ...scoreProjectSuggestion(queryTokens, queryPhrases, entry)
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) return null;

  const best = ranked[0];
  const secondScore = ranked[1] ? ranked[1].score : 0;
  const hasSpecificEvidence = best.exactTitle ||
    best.matchedRareTokens > 0 ||
    best.matchedTitleTokens > 0 ||
    best.matchedPhrases > 0 ||
    best.matchedToolTokens > 0;
  const clearLead = !ranked[1] || best.score >= secondScore + 12 || best.score >= Math.round(secondScore * 1.24);
  const enoughCoverage = best.exactTitle || best.coverage >= 0.45 || best.matchedPhrases > 0;
  const minimumScore = best.exactTitle ? 30 : 36;

  if (best.score < minimumScore) return null;
  if (!hasSpecificEvidence) return null;
  if (!enoughCoverage) return null;
  if (!clearLead) return null;
  if (broadCategoryQuery && !best.exactTitle && best.matchedRareTokens === 0 && best.matchedPhrases === 0) return null;

  return best.entry.project;
}

async function loadAiKb() {
  if (aiKbCache) return aiKbCache;
  const res = await fetch("/data/ai_kb.json", { cache: "no-store" });
  if (!res.ok) throw new Error("KB load failed");
  aiKbCache = await res.json();
  return aiKbCache;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function joinReadableList(items) {
  const safeItems = (Array.isArray(items) ? items : []).filter(Boolean);
  if (!safeItems.length) return "";
  if (safeItems.length === 1) return safeItems[0];
  if (safeItems.length === 2) return safeItems[0] + " and " + safeItems[1];
  return safeItems.slice(0, -1).join(", ") + ", and " + safeItems[safeItems.length - 1];
}

function isProjectBrowseQuery(query, navCategory) {
  const q = normalizeQuery(query);
  if (!navCategory || !q) return false;
  return q.includes("show") ||
    q.includes("project") ||
    q.includes("projects") ||
    q.includes("example") ||
    q.includes("examples") ||
    q.includes("work") ||
    q.includes("works") ||
    q.includes("portfolio");
}

function getCategoryBrowseFollowups(catId) {
  if (catId === "vr-ar") {
    return ["What tools were used in VR?", "What was done at Huawei R&D?", "Show AI projects", "Contact details"];
  }
  if (catId === "ui-ux") {
    return ["What tools does he use?", "Where did he study?", "Show VR projects", "Contact details"];
  }
  if (catId === "ai") {
    return ["Tell me about AI workflows", "Show VR projects", "What tools does he use?", "Contact details"];
  }
  if (catId === "architecture") {
    return ["What is his education background?", "Show 3D projects", "Show VR projects", "Contact details"];
  }
  return aiFallbackFollowups;
}

function buildCategoryBrowseAnswer(catId) {
  const matches = filterByCategory(catId);
  if (!matches.length) return null;
  const featured = matches.slice(0, 4);
  const titles = featured.map(p => p.title);
  const tools = Array.from(new Set(featured.flatMap(p => Array.isArray(p.tools) ? p.tools : []))).slice(0, 5);

  let answer = "";
  if (catId === "vr-ar") {
    answer = `VR/AR projects in this portfolio include ${joinReadableList(titles)}. The strongest VR examples are Huawei VR - Racket Training and Huawei VR - Unity Environments, and Gaze Garden - AR Tiktok Project covers the AR side.`;
  } else if (catId === "ui-ux") {
    answer = `UI/UX projects in this portfolio include ${joinReadableList(titles)}. They cover dashboards, mobile flows, design systems, and interface-focused product work.`;
  } else if (catId === "ai") {
    answer = `AI-related projects in this portfolio include ${joinReadableList(titles)}. They combine generative workflows, research, and AI-assisted creative production.`;
  } else if (catId === "architecture") {
    answer = `Architecture projects in this portfolio include ${joinReadableList(titles)}. They focus on visualization, spatial design, and presentation-ready interior work.`;
  } else if (catId === "3d") {
    answer = `3D projects in this portfolio include ${joinReadableList(titles)}. They cover visualization, materials, concept work, and real-time presentation assets.`;
  } else {
    answer = `${catLabels[catId] || catId} projects in this portfolio include ${joinReadableList(titles)}.`;
  }

  if (tools.length) {
    answer += ` Common tools here include ${joinReadableList(tools)}.`;
  }

  return {
    answer,
    followups: getCategoryBrowseFollowups(catId)
  };
}

function isGreetingQuery(query) {
  const q = normalizeQuery(query);
  return ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"].includes(q);
}

function getSiteGroundedAnswer(query) {
  const q = normalizeQuery(query);
  const totalProjects = Array.isArray(projects) ? projects.length : 0;
  const categoryCount = {
    "ui-ux": filterByCategory("ui-ux").length,
    "3d": filterByCategory("3d").length,
    "ai": filterByCategory("ai").length,
    "vr-ar": filterByCategory("vr-ar").length,
    "architecture": filterByCategory("architecture").length
  };

  if (isGreetingQuery(q)) {
    return {
      answer: `This portfolio includes ${totalProjects} projects across UI/UX, 3D, AI, VR/AR, and Architecture.`,
      followups: ["Show UI/UX projects", "Show AI projects", "Show VR projects", "Who is Fatih?"]
    };
  }

  if (q.includes("projects") || q.includes("portfolio") || q.includes("categories")) {
    return {
      answer: `This portfolio currently lists ${totalProjects} projects. Category counts: UI/UX (${categoryCount["ui-ux"]}), 3D (${categoryCount["3d"]}), AI (${categoryCount["ai"]}), VR/AR (${categoryCount["vr-ar"]}), Architecture (${categoryCount["architecture"]}).`,
      followups: ["Show UI/UX projects", "Show 3D projects", "Show AI projects", "Show Architecture projects"]
    };
  }

  if (
    q.includes("years of experience") ||
    q.includes("how many years") ||
    q.includes("experience years")
  ) {
    return {
      answer: "Fatih has 3+ years of professional experience, especially across game-adjacent, real-time, and interactive production environments, including Huawei R&D and freelance multidisciplinary work.",
      followups: ["What is his work experience?", "What tools does he use?", "Who is Fatih?", "Contact details"]
    };
  }

  return {
    answer: aiUnknownFallback,
    followups: aiFallbackFollowups
  };
}

function getQueryAwareFallback(query, reason) {
  const q = normalizeQuery(query);
  const navCategory = detectNavigationalCategory(query);
  const matches = searchProjects(query).slice(0, 3);

  if (
    q.includes("years of experience") ||
    q.includes("how many years") ||
    q.includes("experience years")
  ) {
    return {
      answer: "Fatih has 3+ years of professional experience, especially across game-adjacent, real-time, and interactive production environments, including Huawei R&D and freelance multidisciplinary work.",
      followups: ["What is his work experience?", "What tools does he use?", "Who is Fatih?", "Contact details"]
    };
  }

  if (navCategory) {
    const categoryAnswer = buildCategoryBrowseAnswer(navCategory);
    if (categoryAnswer) {
      return {
        answer: categoryAnswer.answer,
        followups: categoryAnswer.followups
      };
    }
  }

  if (matches.length) {
    return {
      answer: `Based on your query, relevant projects include ${matches.map(p => p.title).join(", ")}.`,
      followups: ["Show these projects", "Show related categories", "What tools does he use?", "Contact details"]
    };
  }

  return getSiteGroundedAnswer(query);
}

function getLiveAiUnavailableAnswer(reason) {
  if (reason === "auth_invalid") {
    return {
      answer: "The live AI service is currently unavailable because the current OpenAI model or API access is rejecting requests. Please check the Worker's OpenAI project access and try again.",
      followups: ["Who is Fatih?", "What tools does he use?", "Show VR projects", "Contact details"]
    };
  }

  if (reason === "model_unavailable") {
    return {
      answer: "The live AI service is currently unavailable because the configured OpenAI model is not available to this API project. Please check the Worker's model setting and project model access.",
      followups: ["Who is Fatih?", "What tools does he use?", "Show VR projects", "Contact details"]
    };
  }

  if (reason === "rate_limited") {
    return {
      answer: "The live AI service is temporarily rate-limited. Please try again in a moment.",
      followups: aiFallbackFollowups
    };
  }

  return {
    answer: "The live AI service is currently unavailable. Please try again shortly.",
    followups: aiFallbackFollowups
  };
}

function matchKbIntent(query, kb) {
  const normalizedQuery = normalizeQuery(query);
  const queryTokens = tokenize(query);
  let best = null;

  kb.forEach(entry => {
    const keywords = Array.isArray(entry.keywords) ? entry.keywords : [];
    let bestEntryScore = 0;
    let matchedByIncludes = false;

    keywords.forEach(rawKeyword => {
      const keyword = normalizeQuery(rawKeyword);
      if (!keyword) return;

      if (normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery)) {
        matchedByIncludes = true;
        const includesScore = Math.max(
          keyword.length / Math.max(normalizedQuery.length || 1, 1),
          normalizedQuery.length / Math.max(keyword.length || 1, 1)
        );
        bestEntryScore = Math.max(bestEntryScore, 0.82 + Math.min(0.18, includesScore * 0.18));
        return;
      }

      const keywordTokens = tokenize(keyword);
      const overlap = tokenOverlapScore(queryTokens, keywordTokens);
      const fuzzy = stringSimilarity(normalizedQuery, keyword);
      const score = (overlap * 0.6) + (fuzzy * 0.4);
      bestEntryScore = Math.max(bestEntryScore, score);
    });

    if (!best || bestEntryScore > best.score) {
      best = {
        entry: entry,
        score: bestEntryScore,
        isConfident: matchedByIncludes || bestEntryScore >= aiThreshold
      };
    }
  });

  if (!best || !best.isConfident) return null;
  return best;
}

function queryHasSignal(normalizedQuery, normalizedSignal) {
  if (!normalizedQuery || !normalizedSignal) return false;
  return (` ${normalizedQuery} `).includes(` ${normalizedSignal} `);
}

function detectNavigationalCategory(query) {
  const normalized = normalizeQuery(query);
  let winner = null;
  let bestScore = 0;

  Object.keys(navigationalSignals).forEach(catId => {
    const signals = navigationalSignals[catId];
    let score = 0;
    signals.forEach(signal => {
      const normalizedSignal = normalizeQuery(signal);
      if (queryHasSignal(normalized, normalizedSignal)) score += normalizedSignal.length > 2 ? 2 : 1;
    });
    if (score > bestScore) {
      bestScore = score;
      winner = catId;
    }
  });

  return bestScore > 0 ? winner : null;
}

function shouldPreferLocalKbMatch(match) {
  const intent = match && match.entry && typeof match.entry.intent === "string"
    ? match.entry.intent
    : "";
  return localKbPriorityIntents.has(intent);
}

function revealAnswerContainer() {
  const container = document.getElementById("aiAnswerContainer");
  if (!container) return;
  container.hidden = false;
  requestAnimationFrame(() => container.classList.add("visible"));
  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setAnswerLoading(query) {
  revealAnswerContainer();
  const asked = document.getElementById("aiAsked");
  const answerText = document.getElementById("aiAnswerText");
  const followups = document.getElementById("aiFollowupChips");
  syncAiAnswerPresentation(query);
  if (asked) asked.innerHTML = 'You asked: <strong>' + escapeHtml(query) + "</strong>";
  if (answerText) {
    answerText.classList.add("loading");
    answerText.textContent = "Thinking...";
  }
  if (followups) followups.innerHTML = "";
  renderAiRelatedProject(null);
}

function typeAnswerText(text) {
  const answerText = document.getElementById("aiAnswerText");
  if (!answerText) return;
  answerText.classList.remove("loading");
  answerText.textContent = "";
  const finalText = String(text || "").trim();
  if (!finalText) return;
  const stepMs = 8;
  let i = 0;
  const timer = setInterval(() => {
    i += 3;
    answerText.textContent = finalText.slice(0, i);
    if (i >= finalText.length) clearInterval(timer);
  }, stepMs);
}

function renderFollowups(questions) {
  const followups = document.getElementById("aiFollowupChips");
  if (!followups) return;
  const safeList = (Array.isArray(questions) && questions.length ? questions : aiFallbackFollowups).slice(0, 4);
  followups.innerHTML = safeList
    .map(q => '<button class="ai-followup-chip" onclick="askFollowUp(\'' + escapeJs(q) + '\')">' + escapeHtml(q) + "</button>")
    .join("");
}

function renderAiRelatedProject(project) {
  const host = document.getElementById("aiRelatedProject");
  if (!host) return;

  if (!project) {
    host.hidden = true;
    host.innerHTML = "";
    return;
  }

  const projectImage = getProjectCardImage(project);
  const projectCategories = (Array.isArray(project.categories) ? project.categories : [])
    .map((catId) => catLabels[catId] || catId)
    .filter(Boolean)
    .join(" · ");
  const description = String(project.description || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .trim();
  const shortDescription = description.length > 140 ? description.slice(0, 137).trimEnd() + "..." : description;

  host.hidden = false;
  host.innerHTML =
    '<div class="ai-related-project-label">Related project</div>' +
    '<button type="button" class="ai-related-project-card" onclick="openProject(\'' + escapeJs(project.id) + '\')">' +
      (projectImage
        ? '<span class="ai-related-project-thumb"><img src="' + escapeHtml(projectImage) + '" alt="' + escapeHtml(project.title) + '" loading="lazy" decoding="async"></span>'
        : '<span class="ai-related-project-thumb">Project</span>') +
      '<span class="ai-related-project-meta">' +
        '<span class="ai-related-project-title">Would you like to see this related project?</span>' +
        '<span class="ai-related-project-name">' + escapeHtml(project.title) + '</span>' +
        (projectCategories ? '<span class="ai-related-project-cats">' + escapeHtml(projectCategories) + '</span>' : '') +
        (shortDescription ? '<span class="ai-related-project-desc">' + escapeHtml(shortDescription) + '</span>' : '') +
      '</span>' +
      '<span class="ai-related-project-action">Open project</span>' +
    '</button>';
}

function renderAiAnswer(query, answer, suggestions) {
  const heading = document.getElementById("aiAnswerHeading");
  const asked = document.getElementById("aiAsked");
  syncAiAnswerPresentation(query);
  if (asked) asked.innerHTML = 'You asked: <strong>' + escapeHtml(query) + "</strong>";
  typeAnswerText(answer);
  renderAiRelatedProject(findRelatedProjectForAiAnswer(query));
  renderFollowups(suggestions);
  if (heading) heading.focus({ preventScroll: true });
}

function normalizeAiAnswerTone(answer) {
  let text = String(answer || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .trim();

  if (!text) return text;

  const directRewrites = [
    [/\bYou can contact Fatih Gulen at\b/gi, "Fatih Gulen can be contacted at"],
    [/\bYou can contact Fatih at\b/gi, "Fatih can be contacted at"],
    [/\bYou can reach Fatih at\b/gi, "Fatih can be reached at"],
    [/\bYou can also connect with him on LinkedIn at\b/gi, "He is also available on LinkedIn at"],
    [/\bYou can browse by category or ask in natural language to find work related to\b/gi, "The portfolio can be explored by category, with work related to"],
    [/\bIf you want to see AI plus design integration, the AI section is the most relevant category\.?/gi, "The AI section is the strongest match for AI plus design integration."],
    [/^Hi\.\s*I can help you explore this portfolio\.\s*/i, ""],
    [/^Hi\.\s*I can help you explore portfolio projects across /i, "The portfolio covers "],
    [/^I can help with portfolio topics like /i, "The portfolio covers topics such as "],
    [/\bYou can ask about\b/gi, "Relevant areas here include"],
    [/\bYou can ask for\b/gi, "Relevant areas here include"]
  ];

  directRewrites.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });

  const assistantStyleSentence = [
    /^(?:if you(?:'d| would)? like|if you want|if needed|let me know|feel free to ask|just ask)\b/i,
    /^(?:i can also|i can help|i can walk through|i can break down|i can show|i can share)\b/i,
    /^(?:istersen|dilersen|yardimci olabilirim|yardımcı olabilirim)\b/i
  ];

  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("-")) return trimmed;

      const sentences = trimmed.match(/[^.!?]+[.!?]?/g) || [trimmed];
      const kept = sentences
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .filter((sentence) => !assistantStyleSentence.some((pattern) => pattern.test(sentence)));

      return kept.join(" ").trim();
    })
    .filter(Boolean);

  return paragraphs
    .join("\n\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slightlyExpandAnswer(answer) {
  const text = normalizeAiAnswerTone(answer);
  if (!text) return text;
  return text;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeJs(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function setAiServiceStatus(isOnline) {
  const dot = document.getElementById("aiStatusDot");
  const text = document.getElementById("aiStatusText");
  const link = document.getElementById("aiStatusLink");
  if (!dot || !text || !link) return;
  dot.classList.toggle("offline", !isOnline);
  text.textContent = isOnline ? "Online" : "Offline";
  link.title = isOnline
    ? "Currently live AI is online."
    : "Currently live AI is offline.";
  link.setAttribute("aria-label", link.title);
}

async function askProxy(query, options = {}) {
  const isStatusPing = Boolean(options && options.isStatusPing);
  const sessionId = !isStatusPing
    ? String((options && options.sessionId) || getAiSessionId()).trim()
    : "";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const res = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      sessionId
        ? { query: query, sessionId: sessionId }
        : { query: query }
    ),
    cache: "no-store",
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));
  if (!res.ok) {
    let payload = null;
    try { payload = await res.json(); } catch (_) {}
    const err = new Error("Proxy request failed");
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  const data = await res.json();
  return {
    answer: (data && typeof data.answer === "string") ? data.answer.trim() : "",
    fallback: Boolean(data && data.fallback),
    reason: data && data.reason ? String(data.reason) : "",
    upstream_status: data && data.upstream_status ? Number(data.upstream_status) : 0
  };
}

let aiStatusTimer = null;
async function refreshAiServiceStatus() {
  try {
    if (AI_HEALTH_ENDPOINT === "/api/ask/health" || AI_HEALTH_ENDPOINT.endsWith("/api/ask/health")) {
      const res = await fetch(AI_HEALTH_ENDPOINT, { cache: "no-store" });
      if (!res.ok) throw new Error("Health request failed");
      const data = await res.json();
      setAiServiceStatus(Boolean(data && data.ok));
      return;
    }

    const ping = await askProxy("__status_ping__", { isStatusPing: true });
    const isOnline = Boolean(ping.answer);
    setAiServiceStatus(isOnline);
  } catch (_) {
    setAiServiceStatus(false);
  }
}

function initAiServiceStatus() {
  refreshAiServiceStatus();
  if (aiStatusTimer) clearInterval(aiStatusTimer);
  aiStatusTimer = setInterval(refreshAiServiceStatus, 120000);
}

let aiStatusBooted = false;
function scheduleAiServiceStatusInit() {
  const boot = () => {
    if (aiStatusBooted) return;
    aiStatusBooted = true;
    initAiServiceStatus();
  };
  const bootSelectors = '#chatInput, #submitBtn, .suggest-chip, .ai-followup-chip, #pmAiWizard';
  const earlyBoot = (event) => {
    const target = event && event.target && typeof event.target.closest === 'function'
      ? event.target.closest(bootSelectors)
      : null;
    if (!target) return;
    window.removeEventListener('pointerdown', earlyBoot);
    window.removeEventListener('keydown', earlyBoot);
    window.removeEventListener('touchstart', earlyBoot);
    document.removeEventListener('focusin', earlyBoot);
    boot();
  };
  window.addEventListener('pointerdown', earlyBoot, { passive: true });
  window.addEventListener('keydown', earlyBoot);
  window.addEventListener('touchstart', earlyBoot, { passive: true });
  document.addEventListener('focusin', earlyBoot);
}

function applyCategoryFilter(catId, options = {}) {
  const normalizedCatId = normalizeCategoryId(catId);
  const el = document.querySelector('.cat-pill[data-cat="' + normalizedCatId + '"]');
  if (el) {
    document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
    el.classList.add("active");
  }
  const results = filterByCategory(normalizedCatId);
  const catName = catLabels[normalizedCatId] || normalizedCatId;
  renderProjects(results, 'Browsing <strong>' + catName + "</strong> - " + results.length + " project" + (results.length > 1 ? "s" : "") + " in this category");
  renderSuggestedPrompts(normalizedCatId);
  setVrHeroShowcaseState(normalizedCatId, { restart: true });
  prefetchProjectCardImages(results, 6);
  if (!options.keepInput) {
    const input = document.getElementById("chatInput");
    if (input) input.value = "";
    toggleSubmit();
  }
  if (!options.skipUrl) {
    updateUrlForView({
      category: normalizedCatId,
      replace: Boolean(options.replaceUrl)
    });
  }
  applySeoMeta(buildCategorySeoMeta(normalizedCatId));
}

function generateResponse(query, count) {
  if (count === 0) return null;
  const t = [
    `Found <strong>${count} project${count>1?'s':''}</strong> matching "${query}"`,
    `Here ${count>1?'are':'is'} <strong>${count} result${count>1?'s':''}</strong> for "${query}"`,
    `Showing <strong>${count}</strong> relevant project${count>1?'s':''} - sorted by relevance`,
  ];
  return t[Math.floor(Math.random()*t.length)];
}

function renderProjectCardMarkup(project, index) {
  const cardImage = getProjectCardImage(project);
  const eagerAboveFold = index < 2;
  const fetchPriority = index === 0 ? 'high' : (eagerAboveFold ? 'auto' : 'low');
  return '<div class="project-card" onclick="openProject(\''+project.id+'\')" style="transition-delay:'+Math.min(index, 5)*0.05+'s"><div class="card-thumbnail">'+(cardImage ? '<img class="card-thumbnail-img" src="'+cardImage+'" alt="'+project.title+'" loading="'+(eagerAboveFold ? 'eager' : 'lazy')+'" decoding="async" fetchpriority="'+fetchPriority+'">' : '<div class="card-thumbnail-inner">'+project.thumbnail+'</div>')+'<div class="card-gradient"></div></div><div class="card-body"><div class="card-tags">'+project.categories.map(c=>'<span class="card-tag">'+(catLabels[c]||c)+'</span>').join('')+'</div><div class="card-title">'+project.title+'</div><div class="card-desc">'+project.description+'</div><div class="card-meta"><div class="card-tools-wrap"><span class="card-tools">'+project.tools.join(' ? ')+'</span>'+(project.year ? '<span class="card-year">? '+project.year+'</span>' : '')+'</div><div class="card-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></div></div></div></div>';
}

function renderRelatedProjectCardMarkup(project) {
  const cardImage = getProjectCardImage(project);
  return '<article class="related-card" onclick="openProject(\''+project.id+'\')"><div class="related-thumb">'+(cardImage ? '<img src="'+cardImage+'" alt="'+project.title+'" loading="lazy" decoding="async" fetchpriority="low">' : '')+'</div><div class="related-name">'+project.title+'</div></article>';
}

// --- RENDER ---
function renderProjects(filteredProjects, responseHtml) {
  currentFilteredProjects = filteredProjects;
  const area = document.getElementById('responseArea');
  const init = document.getElementById('initialState');
  if (init) init.remove();
  area.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  setTimeout(() => {
    let html = '';
    if (responseHtml) {
      html += '<div class="response-header" id="responseHeader"><div class="response-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="response-text">'+responseHtml+'</div></div>';
    }
    if (filteredProjects.length === 0) {
      html += '<div class="no-results"><h3>No matches found</h3><p>Try a different query or browse by category above.</p></div>';
    } else {
      html += '<div class="project-grid">';
      filteredProjects.forEach((p, i) => {
        html += renderProjectCardMarkup(p, i);
      });
      html += '</div>';
    }
    area.innerHTML = html;
    requestAnimationFrame(() => {
      const header = document.getElementById('responseHeader');
      if (header) header.classList.add('visible');
      document.querySelectorAll('.project-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 80);
      });
    });
  }, 600);
}

// --- HANDLERS ---
async function handleQuery() {
  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  if (!query) return;
  setAnswerLoading(query);
  try {
    const normalized = normalizeQuery(query);
    const navCategory = detectNavigationalCategory(normalized);
    let answerText = "";
    let followups = aiFallbackFollowups;
    let shouldUseLocalFallback = false;
    let fallbackReason = "unavailable";
    let localKbMatch = null;
    let preferLocalKb = false;

    localKbMatch = matchKbIntent(query, inlinePriorityKb);
    preferLocalKb = shouldPreferLocalKbMatch(localKbMatch);
    if (preferLocalKb && localKbMatch && localKbMatch.entry && Array.isArray(localKbMatch.entry.responses) && localKbMatch.entry.responses.length) {
      answerText = pickRandom(localKbMatch.entry.responses);
      followups = Array.isArray(localKbMatch.entry.followups) && localKbMatch.entry.followups.length
        ? localKbMatch.entry.followups
        : aiFallbackFollowups;
    }

    try {
      if (!localKbMatch) {
        const kb = await loadAiKb();
        localKbMatch = matchKbIntent(query, kb);
      }
      preferLocalKb = shouldPreferLocalKbMatch(localKbMatch);
      if (preferLocalKb && localKbMatch && localKbMatch.entry && Array.isArray(localKbMatch.entry.responses) && localKbMatch.entry.responses.length) {
        answerText = pickRandom(localKbMatch.entry.responses);
        followups = Array.isArray(localKbMatch.entry.followups) && localKbMatch.entry.followups.length
          ? localKbMatch.entry.followups
          : aiFallbackFollowups;
      }
    } catch (err) {
      console.warn("KB preload failed:", err);
    }

    if (!preferLocalKb) {
      const sessionReservation = reserveAiSessionRequest();
      if (!sessionReservation.allowed) {
        shouldUseLocalFallback = true;
        fallbackReason = "session_limited";
      } else {
        try {
          const proxyResult = await askProxy(query, { sessionId: sessionReservation.sessionId });
          const proxyAnswer = proxyResult.answer;
          if (proxyAnswer && !proxyResult.fallback) {
            answerText = proxyAnswer;
            followups = aiFallbackFollowups;
            setAiServiceStatus(true);
          } else {
            shouldUseLocalFallback = true;
            fallbackReason = proxyResult.reason || "unavailable";
            if (proxyResult.fallback) {
              console.warn("Worker returned fallback:", {
                reason: proxyResult.reason || "",
                upstreamStatus: proxyResult.upstream_status || ""
              });
            }
            if (fallbackReason !== "session_limited") {
              setAiServiceStatus(false);
            }
          }
        } catch (err) {
          console.warn("Proxy fallback failed:", err);
          shouldUseLocalFallback = true;
          fallbackReason = err && err.payload && err.payload.reason
            ? String(err.payload.reason)
            : "unavailable";
          if (fallbackReason !== "session_limited") {
            setAiServiceStatus(false);
          }
        }
      }
    }

    // Use local KB when preferred for profile/contact topics or when live AI is unavailable.
    if (shouldUseLocalFallback) {
      try {
        if (!localKbMatch) {
          const kb = await loadAiKb();
          localKbMatch = matchKbIntent(query, kb);
        }
        if (localKbMatch && localKbMatch.entry && Array.isArray(localKbMatch.entry.responses) && localKbMatch.entry.responses.length) {
          answerText = pickRandom(localKbMatch.entry.responses);
          followups = Array.isArray(localKbMatch.entry.followups) && localKbMatch.entry.followups.length
            ? localKbMatch.entry.followups
            : aiFallbackFollowups;
        }
      } catch (err) {
        console.warn("KB matching failed:", err);
      }
      if (!answerText) {
        const mappedReason = fallbackReason === "quota_limited" ? "rate_limited" : fallbackReason;
        const grounded = getQueryAwareFallback(query, mappedReason);
        answerText = grounded.answer;
        followups = grounded.followups;
      }
    }

    renderAiAnswer(query, slightlyExpandAnswer(answerText), followups);

    if (navCategory) {
      applyCategoryFilter(navCategory, { keepInput: true });
      return;
    }

    setVrHeroShowcaseState(false);
    const results = searchProjects(query);
    const response = results.length > 0 ? generateResponse(query, results.length) : null;
    renderProjects(results, response || 'No matches for "' + query + '" - try broader terms or pick a category.');
    prefetchProjectCardImages(results, 6);
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    renderSuggestedPrompts();
    updateUrlForView({ replace: true });
    applySeoMeta(buildHomeSeoMeta());
  } catch (err) {
    console.error("handleQuery failed:", err);
    setVrHeroShowcaseState(false);
    const grounded = getSiteGroundedAnswer(query);
    renderAiAnswer(query, slightlyExpandAnswer(grounded.answer), grounded.followups);
  }
}

function filterCategory(el) {
  if (document.getElementById('projectModal')?.classList.contains('open')) {
    closeProject();
  }
  const cat = el.dataset.cat;
  const wasActive = el.classList.contains('active');
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  if (wasActive) { resetView(); return; }
  applyCategoryFilter(cat);
}

function usePrompt(el) {
  if (document.getElementById('projectModal')?.classList.contains('open')) {
    closeProject();
  }
  const prompt = el.textContent.trim().replace(/\s+/g, " ");
  const input = document.getElementById('chatInput');
  input.value = prompt;
  toggleSubmit();
  handleQuery();
}

function askFollowUp(question) {
  const input = document.getElementById("chatInput");
  input.value = question;
  toggleSubmit();
  handleQuery();
}

function toggleSubmit() {
  const btn = document.getElementById('submitBtn');
  btn.classList.toggle('active', document.getElementById('chatInput').value.trim().length > 0);
}

function resetView(options = {}) {
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  document.getElementById('chatInput').value = '';
  applyRandomSearchPlaceholder({ force: true });
  toggleSubmit();
  renderSuggestedPrompts();
  setVrHeroShowcaseState(false);
  renderAiRelatedProject(null);
  const answerContainer = document.getElementById("aiAnswerContainer");
  if (answerContainer) {
    answerContainer.classList.remove("visible");
    answerContainer.hidden = true;
  }
  document.getElementById('responseArea').innerHTML = '<div class="initial-state" id="initialState">Select a category or type a query to explore projects. Press <span class="keystroke">Enter</span> to search.</div>';
  if (!options.skipUrl) {
    updateUrlForView({ replace: Boolean(options.replaceUrl) });
  }
  applySeoMeta(buildHomeSeoMeta());
}

normalizeProjectCategories();
syncCategoryCounts();
setupImageLightboxSwipe();
scheduleAiServiceStatusInit();
applyRandomSearchPlaceholder({ force: true });

// =========== SKELETON LOADING UI ===========
function buildSkeletonHTML(count) {
  let html = '<div class="skeleton-grid">';
  for (let i = 0; i < count; i++) {
    html += `<div class="skeleton-card" style="animation-delay:${i * 0.08}s">
      <div class="skeleton-thumb"></div>
      <div class="skeleton-body">
        <div class="skeleton-line w60"></div>
        <div class="skeleton-line title"></div>
        <div class="skeleton-line w80"></div>
        <div class="skeleton-line w40"></div>
        <div class="skeleton-meta">
          <div class="skeleton-meta-line"></div>
          <div class="skeleton-circle"></div>
        </div>
      </div>
    </div>`;
  }
  html += '</div>';
  return html;
}

// Override renderProjects to use skeleton loading
const _originalRenderProjects = renderProjects;
const PROJECT_RENDER_DELAY_MS = 0;
renderProjects = function(filteredProjects, responseHtml, relatedProjects = []) {
  currentFilteredProjects = filteredProjects;
  const area = document.getElementById('responseArea');
  const init = document.getElementById('initialState');
  if (init) init.remove();

  // Show skeleton loading instead of typing dots
  const skeletonCount = Math.min(filteredProjects.length || 3, 6);
  area.classList.add('is-transitioning');
  area.innerHTML = buildSkeletonHTML(skeletonCount);

  const finalizeRender = () => {
    let html = '';
    if (responseHtml) {
      html += '<div class="response-header" id="responseHeader"><div class="response-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="response-text">'+responseHtml+'</div></div>';
    }
    if (filteredProjects.length === 0) {
      html += '<div class="no-results"><h3>No matches found</h3><p>Try a different query or browse by category above.</p></div>';
    } else {
      html += '<div class="project-grid">';
      filteredProjects.forEach((p, i) => {
        html += renderProjectCardMarkup(p, i);
      });
      html += '</div>';
      if (relatedProjects && relatedProjects.length) {
        html += '<section class="related-works"><h4>Related Works</h4><div class="related-grid">';
        relatedProjects.forEach((p) => {
          html += renderRelatedProjectCardMarkup(p);
        });
        html += '</div></section>';
      }
    }
    area.innerHTML = html;
    requestAnimationFrame(() => {
      area.classList.remove('is-transitioning');
      const header = document.getElementById('responseHeader');
      if (header) header.classList.add('visible');
      document.querySelectorAll('.project-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 48);
      });
    });
    prefetchProjectCardImages(filteredProjects, 6);
  };

  if (PROJECT_RENDER_DELAY_MS > 0) {
    setTimeout(finalizeRender, PROJECT_RENDER_DELAY_MS);
    return;
  }

  requestAnimationFrame(finalizeRender);
};

bindCategoryThumbnailPrefetch();
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(() => prefetchProjectCardImages(projects, 4), { timeout: 1800 });
} else {
  window.setTimeout(() => prefetchProjectCardImages(projects, 4), 900);
}
syncViewWithLocation({ replaceUrl: true });
window.addEventListener('popstate', () => syncViewWithLocation({ replaceUrl: true }));

// =========== 3D NEON CURSOR ===========
(function() {
  const cursor = document.getElementById('neonCursor');
  if (!cursor || window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window) {
    if (cursor) cursor.style.display = 'none';
    document.body.classList.remove('cursor-enabled');
    return;
  }
  document.body.classList.add('cursor-enabled');

  let mouseX = -100, mouseY = -100, curX = -100, curY = -100;
  const trails = [];
  const TRAIL_COUNT = 5;

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const trail = document.createElement('div');
    trail.className = 'neon-cursor-trail';
    trail.style.opacity = '0';
    document.body.appendChild(trail);
    trails.push({ el: trail, x: -100, y: -100 });
  }

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseover', e => {
    const tag = e.target.tagName;
    const isClickable = e.target.closest('a, button, [onclick], .cat-pill, .suggest-chip, .project-card, .modal-link, .pm-nav-btn, .tour-bot-avatar, .tour-btn, input');
    cursor.classList.toggle('hovering', !!isClickable);
  });

  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

  function animate() {
    const ease = 0.15;
    curX += (mouseX - curX) * ease;
    curY += (mouseY - curY) * ease;
    cursor.style.left = curX + 'px';
    cursor.style.top = curY + 'px';

    for (let i = 0; i < trails.length; i++) {
      const target = i === 0 ? { x: curX, y: curY } : trails[i - 1];
      trails[i].x += (target.x - trails[i].x) * (0.12 - i * 0.015);
      trails[i].y += (target.y - trails[i].y) * (0.12 - i * 0.015);
      trails[i].el.style.left = trails[i].x + 'px';
      trails[i].el.style.top = trails[i].y + 'px';
      trails[i].el.style.opacity = (0.35 - i * 0.06).toString();
      trails[i].el.style.width = (5 - i * 0.6) + 'px';
      trails[i].el.style.height = (5 - i * 0.6) + 'px';
    }
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    trails.forEach(t => t.el.style.opacity = '0');
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
})();

// =========== 3D BOT ONBOARDING TOUR ===========
(function() {
  const TOUR_KEY = 'portfolio_tour_seen';
  const BOT_RIGHT = 24;
  const BOT_BOTTOM = 96;
  const BOT_RIGHT_MOBILE = 14;
  const BOT_BOTTOM_MOBILE = 76;
  const DIALOG_MOBILE_BOTTOM = 100;
  const TOUR_EDGE = 14;
  let refreshFrame = 0;
  let refreshTimer = 0;

  const tourSteps = [
    {
      target: '#categories .cat-pill[data-cat="ui-ux"]',
      content: 'Start here: <strong>category filters</strong> instantly narrow projects by discipline.',
      pad: 4,
      radius: 10,
      scroll: 'center'
    },
    {
      targetAll: '#suggestedPrompts .suggest-chip',
      content: 'These ready prompts adapt to the active category, so <span class="tour-highlight">UI/UX</span> shows interface examples, <span class="tour-highlight">3D</span> shows render and materials prompts, and <span class="tour-highlight">Architecture</span> shows archviz-focused examples.',
      pad: 4,
      radius: 10,
      scroll: 'center'
    },
    {
      target: '.chat-input-container',
      content: 'Type your own query in <strong>search</strong>. Example: <span class="tour-highlight">"VR projects in Unreal"</span>.',
      pad: 6,
      radius: 12,
      scroll: 'center'
    },
    {
      target: 'footer',
      content: 'The <strong>footer section</strong> gives direct access to LinkedIn, Email, Artstation, and the main website.',
      pad: 6,
      radius: 16,
      scroll: 'end'
    },
    {
      target: '#aboutTrigger',
      content: '<strong>About</strong> opens profile photo, bio, and contact links.',
      pad: 4,
      radius: 10,
      scroll: 'start'
    }
  ];

  let currentStep = 0;
  let tourActive = false;
  const storage = {
    get(key) {
      try { return window.sessionStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { window.sessionStorage.setItem(key, value); } catch (_) {}
    }
  };

  function isMobileTour() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function getViewportSize() {
    const vv = window.visualViewport;
    return {
      width: vv ? vv.width : window.innerWidth,
      height: vv ? vv.height : window.innerHeight
    };
  }

  function scheduleTourRefresh(delay = 0) {
    if (!tourActive) return;
    if (refreshTimer) {
      window.clearTimeout(refreshTimer);
      refreshTimer = 0;
    }

    const run = () => {
      if (!tourActive) return;
      refreshTimer = 0;
      if (refreshFrame) {
        window.cancelAnimationFrame(refreshFrame);
      }
      refreshFrame = window.requestAnimationFrame(() => {
        const step = tourSteps[currentStep];
        if (!step) return;
        const rect = getCombinedRect(getStepTargets(step));
        updateStepVisual(step, rect);
        positionDialogNearTarget(rect);
      });
    };

    if (delay > 0) {
      refreshTimer = window.setTimeout(run, delay);
      return;
    }

    run();
  }

  function queueTourRefreshes(delays) {
    delays.forEach((delay) => {
      window.setTimeout(() => scheduleTourRefresh(), delay);
    });
  }

  function pinTourBot() {
    const bot = document.getElementById('tourBot');
    if (!bot) return;
    const mobile = isMobileTour();
    bot.style.right = `calc(${mobile ? BOT_RIGHT_MOBILE : BOT_RIGHT}px + env(safe-area-inset-right, 0px))`;
    bot.style.bottom = `calc(${mobile ? BOT_BOTTOM_MOBILE : BOT_BOTTOM}px + env(safe-area-inset-bottom, 0px))`;
    bot.style.left = 'auto';
    bot.style.top = 'auto';
    bot.style.display = 'block';
    bot.classList.add('floating');
    bot.classList.add('pinned');
  }

  function clearOverlayHole() {
    const overlay = document.getElementById('tourOverlay');
    if (!overlay) return;
    overlay.style.removeProperty('--tour-left');
    overlay.style.removeProperty('--tour-top');
    overlay.style.removeProperty('--tour-right');
    overlay.style.removeProperty('--tour-bottom');
  }

  function setOverlayHole(rect, pad) {
    const overlay = document.getElementById('tourOverlay');
    if (!overlay || !rect) return null;
    const viewport = getViewportSize();
    const l = Math.max(TOUR_EDGE, Math.round(rect.left - pad));
    const t = Math.max(TOUR_EDGE, Math.round(rect.top - pad));
    const r = Math.min(viewport.width - TOUR_EDGE, Math.round(rect.right + pad));
    const b = Math.min(viewport.height - TOUR_EDGE, Math.round(rect.bottom + pad));
    overlay.style.setProperty('--tour-left', l + 'px');
    overlay.style.setProperty('--tour-top', t + 'px');
    overlay.style.setProperty('--tour-right', r + 'px');
    overlay.style.setProperty('--tour-bottom', b + 'px');
    return { l, t, r, b };
  }

  function getStepTargets(step) {
    const list = step.targetAll
      ? Array.from(document.querySelectorAll(step.targetAll))
      : (step.target ? [document.querySelector(step.target)] : []);
    return list.filter(Boolean).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  }

  function getCombinedRect(elements) {
    if (!elements || !elements.length) return null;
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    elements.forEach((el) => {
      const r = el.getBoundingClientRect();
      left = Math.min(left, r.left);
      top = Math.min(top, r.top);
      right = Math.max(right, r.right);
      bottom = Math.max(bottom, r.bottom);
    });
    return {
      left,
      top,
      right,
      bottom,
      width: Math.max(0, right - left),
      height: Math.max(0, bottom - top)
    };
  }

  function getTourScrollBounds() {
    const viewport = getViewportSize();
    const header = document.querySelector('header');
    const headerRect = header ? header.getBoundingClientRect() : null;
    const top = Math.max(TOUR_EDGE + 10, headerRect ? Math.round(headerRect.bottom + 12) : TOUR_EDGE + 10);
    const bottom = Math.max(top + 120, Math.round(viewport.height - TOUR_EDGE - 14));
    return { top, bottom };
  }

  function scrollStepIntoView(step, rect) {
    if (!rect) return false;
    const bounds = getTourScrollBounds();
    let delta = 0;

    if (step.scroll === 'start') {
      delta = rect.top - bounds.top;
    } else if (step.scroll === 'end') {
      delta = rect.bottom - bounds.bottom;
    } else {
      if (rect.top < bounds.top) delta = rect.top - bounds.top;
      else if (rect.bottom > bounds.bottom) delta = rect.bottom - bounds.bottom;
    }

    if (Math.abs(delta) < 8) return false;

    window.scrollBy({
      top: Math.round(delta),
      behavior: isMobileTour() ? 'auto' : 'smooth'
    });
    return true;
  }

  function positionDialogNearTarget(rect) {
    const dialog = document.getElementById('tourDialog');
    if (!dialog) return;
    const viewport = getViewportSize();
    const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
    const dialogWidth = Math.min(dialog.offsetWidth || 360, viewport.width - (TOUR_EDGE * 2));
    const dialogHeight = Math.min(dialog.offsetHeight || 280, viewport.height - (TOUR_EDGE * 2));

    if (isMobileTour()) {
      dialog.style.width = 'auto';
      dialog.style.maxWidth = 'none';
      dialog.style.left = `calc(15px + env(safe-area-inset-left, 0px))`;
      dialog.style.right = `calc(15px + env(safe-area-inset-right, 0px))`;

      if (!rect) {
        dialog.style.bottom = `calc(${DIALOG_MOBILE_BOTTOM}px + env(safe-area-inset-bottom, 0px))`;
        dialog.style.top = 'auto';
        dialog.classList.add('active');
        return;
      }

      const spacing = 12;
      const spaceAbove = rect.top - TOUR_EDGE - spacing;
      const spaceBelow = viewport.height - rect.bottom - TOUR_EDGE - spacing;
      const shouldPlaceBelow = spaceBelow >= dialogHeight || spaceBelow >= spaceAbove;
      const proposedTop = shouldPlaceBelow
        ? rect.bottom + spacing
        : rect.top - dialogHeight - spacing;
      const top = clamp(proposedTop, TOUR_EDGE, viewport.height - dialogHeight - TOUR_EDGE);

      dialog.style.top = Math.round(top) + 'px';
      dialog.style.bottom = 'auto';
      dialog.classList.add('active');
      return;
    }

    dialog.style.width = '';
    dialog.style.maxWidth = '';
    const spacing = 14;

    if (!rect) {
      dialog.style.left = 'auto';
      dialog.style.top = 'auto';
      dialog.style.right = '24px';
      dialog.style.bottom = '120px';
      dialog.classList.add('active');
      return;
    }

    let left = rect.right + spacing;
    if (left + dialogWidth > viewport.width - TOUR_EDGE) {
      left = rect.left - dialogWidth - spacing;
    }
    left = clamp(left, TOUR_EDGE, viewport.width - dialogWidth - TOUR_EDGE);

    const spaceBelow = viewport.height - rect.top - TOUR_EDGE;
    const spaceAbove = rect.bottom - TOUR_EDGE;
    const shouldAlignTop = spaceBelow >= dialogHeight || spaceBelow >= spaceAbove;
    const proposedTop = shouldAlignTop
      ? rect.top
      : rect.bottom - dialogHeight;
    const top = clamp(proposedTop, TOUR_EDGE, viewport.height - dialogHeight - TOUR_EDGE);

    dialog.style.left = left + 'px';
    dialog.style.top = top + 'px';
    dialog.style.right = 'auto';
    dialog.style.bottom = 'auto';
    dialog.classList.add('active');
  }

  function updateStepVisual(step, rect) {
    const focus = document.getElementById('tourFocus');
    const pointer = document.getElementById('tourPointer');
    if (!focus) return;

    if (!rect) {
      clearOverlayHole();
      focus.classList.remove('active');
      if (pointer) pointer.classList.remove('active');
      return;
    }

    const pad = step.pad != null ? step.pad : 6;
    const radius = step.radius != null ? step.radius : 10;
    const hole = setOverlayHole(rect, pad);
    if (!hole) return;

    focus.style.left = hole.l + 'px';
    focus.style.top = hole.t + 'px';
    focus.style.width = Math.max(24, hole.r - hole.l) + 'px';
    focus.style.height = Math.max(20, hole.b - hole.t) + 'px';
    focus.style.borderRadius = radius + 'px';
    focus.classList.add('active');
    if (pointer) pointer.classList.remove('active');
  }

  window.startTour = function() {
    tourActive = true;
    currentStep = 0;
    const bot = document.getElementById('tourBot');
    bot.style.display = 'none';
    bot.classList.remove('pinned');
    document.getElementById('tourOverlay').classList.add('active');
    showStep(0);
  };

  window.closeTour = function() {
    tourActive = false;
    document.getElementById('tourOverlay').classList.remove('active');
    document.getElementById('tourDialog').classList.remove('active');
    document.getElementById('tourPointer').classList.remove('active');
    document.getElementById('tourFocus').classList.remove('active');
    clearOverlayHole();
    pinTourBot();
    storage.set(TOUR_KEY, '1');
  };

  function showStep(idx) {
    currentStep = idx;
    const step = tourSteps[idx];
    const targets = getStepTargets(step);
    const primaryTarget = targets[0] || null;
    const combinedRect = getCombinedRect(targets);

    const indicator = document.getElementById('tourStepIndicator');
    indicator.innerHTML = tourSteps.map((_, i) =>
      `<div class="tour-step-dot ${i === idx ? 'active' : i < idx ? 'completed' : ''}"></div>`
    ).join('');

    document.getElementById('tourStepContent').innerHTML =
      `<span class="tour-step-num">Step ${idx + 1} of ${tourSteps.length}</span>${step.content}`;

    const footer = document.getElementById('tourFooter');
    let footerHtml = `<button class="tour-btn tour-btn-skip" onclick="closeTour()">Skip</button><div style="display:flex;gap:8px;">`;
    if (idx > 0) {
      footerHtml += `<button class="tour-btn tour-btn-back" onclick="tourNav(-1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back</button>`;
    }
    if (idx < tourSteps.length - 1) {
      footerHtml += `<button class="tour-btn tour-btn-next" onclick="tourNav(1)">Next <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>`;
    } else {
      footerHtml += `<button class="tour-btn tour-btn-next" onclick="closeTour()">Got it!</button>`;
    }
    footerHtml += '</div>';
    footer.innerHTML = footerHtml;

    if (combinedRect) {
      scrollStepIntoView(step, combinedRect);
      queueTourRefreshes([80, 260, 520]);
    } else {
      updateStepVisual(step, null);
    }

    if (primaryTarget) {
      queueTourRefreshes([160]);
    } else {
      scheduleTourRefresh();
    }
  }

  window.tourNav = function(dir) {
    const next = currentStep + dir;
    if (next < 0 || next >= tourSteps.length) return;
    const dialog = document.getElementById('tourDialog');
    dialog.classList.remove('active');
    document.getElementById('tourPointer').classList.remove('active');
    document.getElementById('tourFocus').classList.remove('active');
    setTimeout(() => showStep(next), 300);
  };

  window.addEventListener('resize', () => {
    pinTourBot();
    scheduleTourRefresh(80);
  });

  window.addEventListener('scroll', () => {
    if (!tourActive) return;
    scheduleTourRefresh();
  }, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      pinTourBot();
      scheduleTourRefresh(80);
    });
    window.visualViewport.addEventListener('scroll', () => {
      if (!tourActive) {
        pinTourBot();
        return;
      }
      scheduleTourRefresh();
    });
  }

  if (!storage.get(TOUR_KEY)) {
    setTimeout(() => {
      pinTourBot();
      setTimeout(() => startTour(), 1200);
    }, 2000);
  } else {
    pinTourBot();
  }
})();
// =========== NEON STAR PARTICLES ===========
(function() {
  const canvas = document.getElementById('neonStarsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const STAR_COUNT = 64;
  const OBJECT_COUNT = 6;
  const stars = [];
  const objects = [];

  function getSpacePalette() {
    return document.documentElement.dataset.theme === 'light'
      ? [
          { r: 102, g: 125, b: 34 },
          { r: 145, g: 167, b: 58 },
          { r: 96, g: 132, b: 205 },
          { r: 198, g: 162, b: 92 },
          { r: 222, g: 206, b: 188 },
        ]
      : [
          { r: 196, g: 240, b: 77 },
          { r: 160, g: 210, b: 50 },
          { r: 220, g: 255, b: 120 },
          { r: 140, g: 200, b: 80 },
          { r: 255, g: 255, b: 200 },
        ];
  }

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 0.5,
      baseAlpha: Math.random() * 0.46 + 0.12,
      alpha: 0,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.15,
      driftY: (Math.random() - 0.5) * 0.08,
      colorIndex: Math.floor(Math.random() * 5),
      glowSize: Math.random() * 8 + 4,
      isBright: Math.random() < 0.15 // 15% chance of being a brighter "feature" star
    });
  }

  function createObject(initial = false) {
    const z = Math.random();
    const initialSpread = Math.max(150, Math.min(h * 0.58, Math.max(150, h - 180)));
    return {
      x: Math.random() * w,
      y: initial
        ? (Math.random() * initialSpread) + 56
        : Math.random() * h,
      z,
      baseSize: 14 + Math.random() * 24,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.15,
      wobblePhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      trail: [],
      colorIndex: Math.floor(Math.random() * 5),
      alpha: 0.12 + z * 0.15
    };
  }

  function isObjectSeparated(candidate, placed) {
    return placed.every((other) => {
      const dx = other.x - candidate.x;
      const dy = other.y - candidate.y;
      const minDistance = 170 + ((other.baseSize + candidate.baseSize) * 0.75);
      return (dx * dx) + (dy * dy) > (minDistance * minDistance);
    });
  }

  for (let i = 0; i < OBJECT_COUNT; i++) {
    let next = createObject(true);
    let attempts = 0;
    while (attempts < 32 && !isObjectSeparated(next, objects)) {
      next = createObject(true);
      attempts += 1;
    }
    objects.push(next);
  }

  function drawStar(star) {
    const palette = getSpacePalette();
    const lightMode = document.documentElement.dataset.theme === 'light';
    const color = palette[star.colorIndex % palette.length];
    const a = star.alpha * (lightMode ? 1.08 : 1);
    if (a < 0.01) return;

    const { x, y, size, glowSize, isBright } = star;
    const s = isBright ? size * 2 : size;
    const g = (isBright ? glowSize * 1.5 : glowSize) * (lightMode ? 1.04 : 1);

    // Outer glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, g);
    grad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${a * 0.5})`);
    grad.addColorStop(0.4, `rgba(${color.r},${color.g},${color.b},${a * 0.15})`);
    grad.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, g, 0, Math.PI * 2);
    ctx.fill();

    // Bright core - 4-point star shape for feature stars
    if (isBright) {
      ctx.save();
      ctx.globalAlpha = a * 0.8;
      ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${a * 0.6})`;
      ctx.lineWidth = 0.5;
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(x - s * 3, y);
      ctx.lineTo(x + s * 3, y);
      ctx.stroke();
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x, y - s * 3);
      ctx.lineTo(x, y + s * 3);
      ctx.stroke();
      ctx.restore();
    }

    // Core dot
    ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${a})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawObject(obj, focusY) {
    const palette = getSpacePalette();
    const lightMode = document.documentElement.dataset.theme === 'light';
    const color = palette[obj.colorIndex % palette.length];
    const accentColor = palette[(obj.colorIndex + 1) % palette.length];
    const highlightColor = palette[(obj.colorIndex + 2) % palette.length];
    const perspective = 0.55 + obj.z * 0.95;
    const size = obj.baseSize * perspective;
    const yDist = Math.abs(obj.y - focusY);
    const focusFade = Math.max(0.12, 1 - (yDist / (h * 0.95)));
    const baseAlpha = obj.alpha * focusFade * (lightMode ? 1.14 : 1);
    if (baseAlpha < 0.02) return;

    // Motion blur trail
    for (let i = 0; i < obj.trail.length; i++) {
      const t = obj.trail[i];
      const progress = i / obj.trail.length;
      const a = t.a * (1 - progress) * 0.55 * focusFade;
      ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${a})`;
      ctx.lineWidth = (size * 0.22) * (1 - progress * 0.7);
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(obj.x, obj.y);
      ctx.stroke();
    }

    // Soft glow body
    const grad = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, size * 1.35);
    grad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${baseAlpha * (lightMode ? 0.58 : 0.45)})`);
    if (lightMode) {
      grad.addColorStop(0.36, `rgba(${accentColor.r},${accentColor.g},${accentColor.b},${baseAlpha * 0.24})`);
      grad.addColorStop(0.68, `rgba(${highlightColor.r},${highlightColor.g},${highlightColor.b},${baseAlpha * 0.1})`);
    }
    grad.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, size * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Fake 3D wireframe sphere with rotating rings
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.rotation);
    ctx.scale(1, 0.62);
    if (lightMode) {
      const outerRing = ctx.createLinearGradient(-size, -size * 0.25, size, size * 0.25);
      outerRing.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${baseAlpha * 1.02})`);
      outerRing.addColorStop(0.38, `rgba(${accentColor.r},${accentColor.g},${accentColor.b},${baseAlpha * 0.78})`);
      outerRing.addColorStop(0.7, `rgba(${highlightColor.r},${highlightColor.g},${highlightColor.b},${baseAlpha * 0.5})`);
      outerRing.addColorStop(1, `rgba(${color.r},${color.g},${color.b},${baseAlpha * 0.88})`);
      ctx.shadowBlur = Math.max(10, size * 0.24);
      ctx.shadowColor = `rgba(${accentColor.r},${accentColor.g},${accentColor.b},${baseAlpha * 0.22})`;
      ctx.strokeStyle = outerRing;
    } else {
      ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${baseAlpha * 0.9})`;
    }
    ctx.lineWidth = Math.max(0.6, size * 0.045);
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.rotate(Math.PI / 2.8);
    if (lightMode) {
      const innerRing = ctx.createLinearGradient(-size * 0.78, size * 0.18, size * 0.78, -size * 0.18);
      innerRing.addColorStop(0, `rgba(${accentColor.r},${accentColor.g},${accentColor.b},${baseAlpha * 0.84})`);
      innerRing.addColorStop(0.52, `rgba(${highlightColor.r},${highlightColor.g},${highlightColor.b},${baseAlpha * 0.56})`);
      innerRing.addColorStop(1, `rgba(${color.r},${color.g},${color.b},${baseAlpha * 0.56})`);
      ctx.strokeStyle = innerRing;
    } else {
      ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${baseAlpha * 0.55})`;
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.78, size * 0.78, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Core highlight
    ctx.fillStyle = lightMode
      ? `rgba(255,255,255,${baseAlpha * 0.24})`
      : `rgba(255,255,255,${baseAlpha * 0.35})`;
    ctx.beginPath();
    ctx.arc(obj.x - size * 0.22, obj.y - size * 0.18, Math.max(1, size * 0.09), 0, Math.PI * 2);
    ctx.fill();
    if (lightMode) {
      ctx.fillStyle = `rgba(${highlightColor.r},${highlightColor.g},${highlightColor.b},${baseAlpha * 0.16})`;
      ctx.beginPath();
      ctx.arc(obj.x + size * 0.16, obj.y + size * 0.12, Math.max(0.8, size * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let time = 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function animate() {
    if (prefersReducedMotion.matches) return;
    ctx.clearRect(0, 0, w, h);
    time += 0.016;
    const hero = document.querySelector('.hero');
    const heroRect = hero ? hero.getBoundingClientRect() : null;
    const focusY = heroRect ? Math.min(h * 0.56, heroRect.top + heroRect.height * 0.6) : h * 0.45;

    for (const star of stars) {
      // Twinkle
      star.alpha = star.baseAlpha * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase));

      // Slow drift
      star.x += star.driftX;
      star.y += star.driftY;

      // Wrap around
      if (star.x < -20) star.x = w + 20;
      if (star.x > w + 20) star.x = -20;
      if (star.y < -20) star.y = h + 20;
      if (star.y > h + 20) star.y = -20;

      drawStar(star);
    }

    for (const obj of objects) {
      const speed = 0.35 + obj.z * 0.8;
      obj.x += obj.vx * speed;
      obj.y += (obj.vy * speed) + (Math.sin(time * 1.1 + obj.wobblePhase) * 0.1);
      obj.rotation += obj.rotSpeed * (0.4 + obj.z);

      let wrapped = false;
      if (obj.x < -100) {
        obj.x = w + 100;
        wrapped = true;
      }
      if (obj.x > w + 100) {
        obj.x = -100;
        wrapped = true;
      }
      if (obj.y < -120) {
        obj.y = h + 120;
        wrapped = true;
      }
      if (obj.y > h + 120) {
        obj.y = -120;
        wrapped = true;
      }

      if (wrapped) {
        obj.trail.length = 0;
      } else {
        obj.trail.unshift({ x: obj.x, y: obj.y, a: obj.alpha });
        if (obj.trail.length > 8) obj.trail.pop();
      }

      drawObject(obj, focusY);
    }
    requestAnimationFrame(animate);
  }

  if (!prefersReducedMotion.matches) animate();
  prefersReducedMotion.addEventListener('change', () => {
    if (!prefersReducedMotion.matches) animate();
    else ctx.clearRect(0, 0, w, h);
  });
})();
