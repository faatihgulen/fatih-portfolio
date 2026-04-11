/* ===== FATIH GULEN PORTFOLIO — app.js ===== */
'use strict';

// --- Global State ---
let siteData = null;
let qaData = null;
let projects = [];
let keywordMap = {};
let catLabels = {};
let categorySignals = {};
let projectGalleryConfig = {};

// Project modal state
let currentProjectIndex = -1;
let currentFilteredProjects = [];
let currentProject = null;
let currentProjectGallery = [];
let currentProjectImageIndex = 0;
let coverProjectImageIndex = 0;
let storyPreviewActive = false;
let projectModalScrollHandler = null;
let projectModalWheelHandler = null;
let projectModalTouchStartY = 0;
let projectModalTouchMoveHandler = null;
let projectModalTouchStartHandler = null;
const SHOW_INTERNAL_GALLERY_SETUP = false;

// --- Project Gallery Config (hardcoded, admin panel will manage later) ---
projectGalleryConfig = {
  p01: [
    'images/UI/AERONIX/1.webp',
    'images/UI/AERONIX/ezgif-545218b14e7a7379.gif',
    'images/UI/AERONIX/2.webp',
    'images/UI/AERONIX/Image 1.webp',
    'images/UI/AERONIX/charge.webp',
    'images/UI/AERONIX/drive.webp',
    'images/UI/AERONIX/Slide 16_9 - 1.webp',
    'images/UI/AERONIX/Slide 16_9 - 2.webp',
    'images/UI/AERONIX/Slide 16_9 - 3.webp',
    'images/UI/AERONIX/Slide 16_9 - 5.webp',
    'images/UI/AERONIX/Slide 16_9 - 4.webp',
    'images/UI/AERONIX/Slide 16_9 - 8.webp',
    'images/UI/AERONIX/Slide 16_9 - 9.webp',
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
    'images/UI/Hipicon/0e563a5d-167c-4d7c-849c-d97b0bd2d4e3_rw_600.webp',
    'images/UI/Hipicon/8acf3de6-e781-4c73-8ced-a6497bcaf2b6_rw_600.webp',
    'images/UI/Hipicon/40ca1d0a-9c16-42e9-8ad3-9ccb47228f54_rw_1920.webp',
    'images/UI/Hipicon/291b574d-dbe2-4579-b2ec-55d3d56dee8b_rw_600.webp',
    'images/UI/Hipicon/296f373f-15a9-4417-b93f-2921529aa5c5_rw_1200.webp',
    'images/UI/Hipicon/3045a34b-7d15-4e97-80b1-7c4169b84e62_rw_1200.webp',
  ],
  p04: [
    'images/3D/Material/e2d7dd6b-e78f-44f8-9c6f-aa3b12e30d8f_rw_1920.webp',
    'images/3D/Material/296bbee6-2962-4ffa-940d-deba4744484e_rw_1920.webp',
    'images/3D/Material/518f25f6-43d9-4828-871a-8c53ee994ada_rw_1920.webp',
    'images/3D/Material/761c1a94-4679-498b-8b6d-c16150a59055_rw_1920.webp',
  ],
  p05: [],
  p06: [],
  p07: [],
  p08: [],
  p09: [],
  p10: [],
  p11: [],
  p12: [],
  p13: [],
  p14: [],
  p17: [],
  p18: [],
  p19: [],
  p20: [],
};

// --- Category Signals ---
categorySignals = {
  "ui-ux": ["ui","ux","ui ux","ui/ux","user interface","user experience","dashboard","app ui"],
  "3d": ["3d","3 d","model","modeling","render","rendering","asset","vfx"],
  "ai": ["ai","a.i","artificial intelligence","generative","comfyui","lora","flux"],
  "vr-ar": ["vr","ar","vr ar","vr/ar","augmented","virtual reality","mixed reality","spatial"],
  "architecture": ["architecture","archviz","architectural","interior","villa","masterplan","building"]
};

// --- Bot Answer Card CSS Injection ---
(function injectBotStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .bot-answer-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: var(--radius);
      padding: 20px 24px;
      margin-bottom: 24px;
      animation: fadeUp 0.5s ease-out both;
    }
    .bot-answer-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }
    .bot-avatar {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent) 0%, #8bcc20 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .bot-label {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .bot-answer-short {
      font-size: 0.95rem;
      color: var(--text-primary);
      line-height: 1.7;
      font-weight: 300;
    }
    .bot-expand-btn {
      display: inline-block;
      margin-top: 12px;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--accent);
      background: none;
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 6px 14px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .bot-expand-btn:hover {
      border-color: var(--accent-mid);
      background: var(--accent-dim);
    }
    .bot-answer-detailed {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
      font-size: 0.92rem;
      color: var(--text-secondary);
      line-height: 1.75;
      font-weight: 300;
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: max-height 0.4s ease, opacity 0.3s ease, margin-top 0.3s ease, padding-top 0.3s ease;
    }
    .bot-answer-detailed.expanded {
      display: block;
      max-height: 600px;
      opacity: 1;
    }
    .bot-links {
      margin-top: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .bot-links a {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      text-decoration: none;
      padding: 4px 10px;
      border: 1px solid var(--border);
      border-radius: 4px;
      transition: all 0.3s;
    }
    .bot-links a:hover {
      color: var(--accent);
      border-color: var(--accent-mid);
    }
  `;
  document.head.appendChild(style);
})();

// --- Data Loading ---
async function loadSiteData() {
  const response = await fetch('/data/site.json');
  if (!response.ok) throw new Error('Failed to load site.json: ' + response.status);
  return response.json();
}

async function loadQAData() {
  const response = await fetch('/data/qa.json');
  if (!response.ok) throw new Error('Failed to load qa.json: ' + response.status);
  return response.json();
}

async function init() {
  try {
    // Load both JSON files in parallel
    const [siteResult, qaResult] = await Promise.all([
      loadSiteData(),
      loadQAData()
    ]);

    siteData = siteResult;
    qaData = qaResult;

    // Populate projects from siteData
    projects = siteData.projects || [];

    // Build keywordMap from siteData
    keywordMap = siteData.keywordMap || {};

    // Build catLabels from siteData.categories
    catLabels = {};
    (siteData.categories || []).forEach(function(cat) {
      catLabels[cat.id] = cat.label;
    });

    // Render category pills dynamically
    renderCategories();

    // Render suggested prompts dynamically
    renderSuggestedPrompts();

    // Update about modal from siteData.settings.about
    renderAboutModal();

    // Update hero text from siteData.settings
    renderHero();

    // Update footer from siteData.settings
    renderFooter();

    // Initialize all features (these are self-initializing IIFEs below, called on DOMContentLoaded)
  } catch (err) {
    console.error('Portfolio init error:', err);
  }
}

// --- Dynamic Rendering Helpers ---
function renderCategories() {
  const container = document.getElementById('categories');
  if (!container || !siteData) return;
  const categories = (siteData.categories || []).sort(function(a, b) { return a.order - b.order; });
  container.innerHTML = categories.map(function(cat) {
    const count = projects.filter(function(p) { return p.categories.includes(cat.id); }).length;
    return '<button class="cat-pill" data-cat="' + cat.id + '" onclick="filterCategory(this)">' +
      cat.label + ' <span class="pill-count">' + count + '</span></button>';
  }).join('');
}

function renderSuggestedPrompts() {
  const container = document.getElementById('suggestedPrompts');
  if (!container || !siteData || !siteData.settings) return;
  const prompts = siteData.settings.suggestedPrompts || [];
  container.innerHTML = prompts.map(function(prompt) {
    return '<button class="suggest-chip" onclick="usePrompt(this)">' + prompt + '</button>';
  }).join('');
}

function renderAboutModal() {
  if (!siteData || !siteData.settings || !siteData.settings.about) return;
  const about = siteData.settings.about;

  // Update avatar
  const avatarEl = document.querySelector('#aboutModal .modal-avatar');
  if (avatarEl) {
    if (about.avatarImage) {
      avatarEl.innerHTML = '<img src="' + about.avatarImage + '" alt="' + about.name + '" loading="lazy">';
    } else {
      avatarEl.innerHTML = '<div class="modal-avatar-placeholder">' + (about.avatarFallback || 'FG') + '</div>';
    }
  }

  // Update name
  const nameEl = document.querySelector('#aboutModal .modal-name');
  if (nameEl) nameEl.textContent = about.name || '';

  // Update title
  const titleEl = document.querySelector('#aboutModal .modal-title');
  if (titleEl) titleEl.textContent = about.title || '';

  // Update bio
  const bioEl = document.querySelector('#aboutModal .modal-bio');
  if (bioEl) bioEl.textContent = about.bio || '';

  // Update links
  const linksContainer = document.querySelector('#aboutModal .modal-links');
  if (linksContainer && about.links) {
    linksContainer.innerHTML = about.links.map(function(link) {
      const icon = getAboutLinkIcon(link.type);
      return '<a href="' + link.url + '"' + (link.url.startsWith('mailto:') || link.url.startsWith('tel:') ? '' : ' target="_blank"') + ' class="modal-link">' +
        '<div class="modal-link-icon">' + icon + '</div>' +
        '<div class="modal-link-info">' +
        '<span class="modal-link-label">' + link.label + '</span>' +
        '<span class="modal-link-value">' + link.value + '</span>' +
        '</div>' +
        '<div class="modal-link-arrow"><svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>' +
        '</a>';
    }).join('');
  }
}

function getAboutLinkIcon(type) {
  switch (type) {
    case 'website':
      return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
    case 'linkedin':
      return '<svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>';
    case 'email':
      return '<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
    case 'phone':
      return '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    default:
      return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  }
}

function renderHero() {
  if (!siteData || !siteData.settings) return;
  const settings = siteData.settings;

  const heroLabel = document.querySelector('.hero-label');
  if (heroLabel && settings.heroLabel) heroLabel.textContent = settings.heroLabel;

  const heroH1 = document.querySelector('.hero h1');
  if (heroH1 && settings.heroTitle) heroH1.innerHTML = settings.heroTitle;

  const heroSub = document.querySelector('.hero-sub');
  if (heroSub && settings.heroSubtitle) heroSub.textContent = settings.heroSubtitle;

  const chatInput = document.getElementById('chatInput');
  if (chatInput && settings.searchPlaceholder) chatInput.placeholder = settings.searchPlaceholder;

  const logo = document.querySelector('.logo');
  if (logo && settings.logoText) logo.textContent = settings.logoText;
}

function renderFooter() {
  if (!siteData || !siteData.settings) return;
  const settings = siteData.settings;

  const footerLeft = document.querySelector('.footer-left');
  if (footerLeft && settings.footerText) footerLeft.innerHTML = settings.footerText;

  const footerLinks = document.querySelector('.footer-links');
  if (footerLinks && settings.footerLinks) {
    footerLinks.innerHTML = settings.footerLinks.map(function(link) {
      const isExternal = link.url.startsWith('http');
      const isMail = link.url.startsWith('mailto:');
      return '<a href="' + link.url + '"' + (isExternal ? ' target="_blank"' : '') + '>' + link.label + '</a>';
    }).join('');
  }
}

// --- About Modal ---
function openAbout() {
  document.getElementById('aboutModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAbout() {
  document.getElementById('aboutModal').classList.remove('open');
  document.body.style.overflow = '';
}

// --- Project Detail Modal ---
function setProjectExpanded(expanded) {
  const overlay = document.getElementById('projectModal');
  if (!overlay) return;
  overlay.classList.toggle('expanded', !!expanded);
}

function bindProjectModalInteractions() {
  const modal = document.getElementById('projectModalContent');
  if (!modal) return;
  if (projectModalScrollHandler) modal.removeEventListener('scroll', projectModalScrollHandler);
  if (projectModalWheelHandler) modal.removeEventListener('wheel', projectModalWheelHandler);
  if (projectModalTouchStartHandler) modal.removeEventListener('touchstart', projectModalTouchStartHandler);
  if (projectModalTouchMoveHandler) modal.removeEventListener('touchmove', projectModalTouchMoveHandler);

  projectModalScrollHandler = function() {
    setProjectExpanded(modal.scrollTop > 36);
  };
  projectModalWheelHandler = function(e) {
    if (e.deltaY > 0) {
      setProjectExpanded(true);
    } else if (e.deltaY < 0 && modal.scrollTop <= 8) {
      setProjectExpanded(false);
    }
  };
  projectModalTouchStartHandler = function(e) {
    if (!e.touches || !e.touches.length) return;
    projectModalTouchStartY = e.touches[0].clientY;
  };
  projectModalTouchMoveHandler = function(e) {
    if (!e.touches || !e.touches.length) return;
    const currentY = e.touches[0].clientY;
    const delta = projectModalTouchStartY - currentY;
    if (delta > 8) setProjectExpanded(true);
    if (delta < -8 && modal.scrollTop <= 8) setProjectExpanded(false);
  };

  modal.addEventListener('scroll', projectModalScrollHandler, { passive: true });
  modal.addEventListener('wheel', projectModalWheelHandler, { passive: true });
  modal.addEventListener('touchstart', projectModalTouchStartHandler, { passive: true });
  modal.addEventListener('touchmove', projectModalTouchMoveHandler, { passive: true });
  setProjectExpanded(modal.scrollTop > 36);
}

function expandProjectView() {
  const modal = document.getElementById('projectModalContent');
  const overlay = document.getElementById('projectModal');
  if (window.matchMedia('(max-width: 768px)').matches) {
    openProjectLightbox();
    return;
  }
  if (!modal) return;
  const hasScrollableContent = modal.scrollHeight > (modal.clientHeight + 4);
  if (!hasScrollableContent) {
    openProjectLightbox();
    return;
  }
  if (modal.scrollTop > 36 || (overlay && overlay.classList.contains('expanded'))) {
    openProjectLightbox();
    return;
  }
  setProjectExpanded(true);
  modal.scrollTo({ top: 120, behavior: 'smooth' });
}

function normalizeImagePath(path) {
  return String(path || '').trim().replace(/\\/g, '/');
}

function normalizeGalleryEntry(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') {
    const src = normalizeImagePath(entry);
    return src ? { src: src, caption: '' } : null;
  }
  if (typeof entry === 'object') {
    const src = normalizeImagePath(entry.src || entry.image || '');
    if (!src) return null;
    return { src: src, caption: String(entry.caption || '').trim() };
  }
  return null;
}

function getProjectGallery(p) {
  const fromProject = (Array.isArray(p.images) ? p.images : []).map(normalizeGalleryEntry).filter(Boolean);
  const fromConfig = (projectGalleryConfig[p.id] || []).map(normalizeGalleryEntry).filter(Boolean);
  const merged = [].concat(fromProject.map(function(e) { return e.src; }), fromConfig.map(function(e) { return e.src; }));
  const mainImage = normalizeImagePath(p.image);
  if (mainImage && !merged.includes(mainImage)) merged.unshift(mainImage);
  return Array.from(new Set(merged));
}

function getProjectCaptionMap(p) {
  const map = {};
  const fromProject = (Array.isArray(p.images) ? p.images : []).map(normalizeGalleryEntry).filter(Boolean);
  const fromConfig = (projectGalleryConfig[p.id] || []).map(normalizeGalleryEntry).filter(Boolean);
  [].concat(fromProject, fromConfig).forEach(function(e) {
    if (e.caption && !map[e.src]) map[e.src] = e.caption;
  });
  return map;
}

function getProjectPrimaryImage(p) {
  const gallery = getProjectGallery(p);
  return gallery[0] || '';
}

function openProject(projectId) {
  const p = projects.find(function(pr) { return pr.id === projectId; });
  if (!p) return;
  currentProject = p;
  currentProjectGallery = getProjectGallery(p);
  currentProjectImageIndex = 0;
  coverProjectImageIndex = 0;
  storyPreviewActive = false;
  currentProjectIndex = currentFilteredProjects.findIndex(function(pr) { return pr.id === projectId; });
  renderProjectModal(p);
  bindProjectModalInteractions();
  setProjectExpanded(false);
  document.getElementById('projectModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProject() {
  closeProjectLightbox();
  document.getElementById('projectModal').classList.remove('open');
  setProjectExpanded(false);
  document.body.style.overflow = '';
}

function navProject(dir) {
  if (currentFilteredProjects.length === 0) return;
  currentProjectIndex = (currentProjectIndex + dir + currentFilteredProjects.length) % currentFilteredProjects.length;
  const p = currentFilteredProjects[currentProjectIndex];
  currentProject = p;
  currentProjectGallery = getProjectGallery(p);
  currentProjectImageIndex = 0;
  coverProjectImageIndex = 0;
  storyPreviewActive = false;
  renderProjectModal(p);
  if (document.getElementById('projectLightbox').classList.contains('open')) {
    renderProjectLightbox();
  }
}

function setProjectImage(idx) {
  if (!currentProjectGallery.length) return;
  if (idx < 0 || idx >= currentProjectGallery.length) return;
  storyPreviewActive = false;
  currentProjectImageIndex = idx;
  syncProjectImageState();
  if (document.getElementById('projectLightbox').classList.contains('open')) {
    syncProjectLightboxState();
  }
}

function navProjectImage(dir) {
  if (!currentProjectGallery.length) return;
  storyPreviewActive = false;
  currentProjectImageIndex = (currentProjectImageIndex + dir + currentProjectGallery.length) % currentProjectGallery.length;
  syncProjectImageState();
  if (document.getElementById('projectLightbox').classList.contains('open')) {
    syncProjectLightboxState();
  }
}

function syncProjectImageState() {
  const activeImage = currentProjectGallery[currentProjectImageIndex] || '';
  const hero = document.getElementById('pmHeroImage');
  if (hero && activeImage) hero.src = activeImage;
  const counter = document.getElementById('pmImageCount');
  if (counter) counter.textContent = (currentProjectImageIndex + 1) + ' / ' + currentProjectGallery.length;
  document.querySelectorAll('.pm-gallery-thumb').forEach(function(thumb, i) {
    thumb.classList.toggle('active', i === currentProjectImageIndex);
  });
  const previewBtn = document.getElementById('pmPreviewClose');
  if (previewBtn) previewBtn.style.display = storyPreviewActive ? 'inline-flex' : 'none';
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

function openProjectLightbox() {
  if (!currentProjectGallery.length) return;
  renderProjectLightbox();
  document.getElementById('projectLightbox').classList.add('open');
}

function closeProjectLightbox() {
  document.getElementById('projectLightbox').classList.remove('open');
}

function renderProjectLightbox() {
  const activeImage = currentProjectGallery[currentProjectImageIndex] || '';
  if (!activeImage) return;
  document.getElementById('projectLightboxContent').innerHTML =
    '<button class="pl-btn prev" onclick="navProjectImage(-1)">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>' +
    '</button>' +
    '<div class="pl-image-wrap">' +
      '<img id="plImage" src="' + activeImage + '" alt="' + (currentProject ? currentProject.title : 'Project image') + '">' +
    '</div>' +
    '<button class="pl-btn next" onclick="navProjectImage(1)">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
    '</button>';
  syncProjectLightboxState();
}

function syncProjectLightboxState() {
  const activeImage = currentProjectGallery[currentProjectImageIndex] || '';
  const image = document.getElementById('plImage');
  if (image && activeImage) image.src = activeImage;
  const count = document.getElementById('projectLightboxCount');
  if (count) count.textContent = (currentProjectImageIndex + 1) + ' / ' + currentProjectGallery.length;
}

function renderProjectModal(p) {
  const activeImage = currentProjectGallery[currentProjectImageIndex] || '';
  const captionMap = getProjectCaptionMap(p);
  const prevIdx = (currentProjectIndex - 1 + currentFilteredProjects.length) % currentFilteredProjects.length;
  const nextIdx = (currentProjectIndex + 1) % currentFilteredProjects.length;
  const prevProject = currentFilteredProjects[prevIdx];
  const nextProject = currentFilteredProjects[nextIdx];
  const prevTitle = prevProject ? prevProject.title.split('-')[0].trim() : '';
  const nextTitle = nextProject ? nextProject.title.split('-')[0].trim() : '';

  const modalEl = document.getElementById('projectModalContent');
  modalEl.innerHTML =
    '<button class="pm-close" onclick="closeProject()">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>' +
      '</svg>' +
    '</button>' +
    '<div class="pm-hero">' +
      (activeImage
        ? '<img class="pm-hero-img" id="pmHeroImage" src="' + activeImage + '" alt="' + p.title + '">'
        : '<div class="pm-hero-emoji">' + p.thumbnail + '</div>') +
      '<div class="pm-hero-gradient"></div>' +
      (activeImage
        ? '<div class="pm-hero-controls">' +
            '<div class="pm-hero-left">' +
              '<button class="pm-hero-btn" onclick="navProjectImage(-1)">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>' +
              '</button>' +
              '<div class="pm-image-count" id="pmImageCount">' + (currentProjectImageIndex + 1) + ' / ' + currentProjectGallery.length + '</div>' +
              '<button class="pm-hero-btn" onclick="navProjectImage(1)">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
              '</button>' +
            '</div>' +
            '<div style="display:flex;gap:8px;align-items:center;">' +
              '<button class="pm-preview-close" id="pmPreviewClose" onclick="closeStoryPreview()">Cover</button>' +
              '<button class="pm-expand-btn" onclick="expandProjectView()">Expand</button>' +
            '</div>' +
          '</div>'
        : '') +
    '</div>' +
    (currentProjectGallery.length > 1
      ? '<div class="pm-gallery">' +
          currentProjectGallery.map(function(img, i) {
            return '<button class="pm-gallery-thumb ' + (i === currentProjectImageIndex ? 'active' : '') + '" onclick="setProjectImage(' + i + ')">' +
              '<img src="' + img + '" alt="' + p.title + ' ' + (i + 1) + '" loading="lazy">' +
            '</button>';
          }).join('') +
        '</div>'
      : '') +
    '<div class="pm-body">' +
      '<div class="pm-layout">' +
        '<div class="pm-meta">' +
          '<div class="pm-tags" style="display:flex;align-items:center;">' +
            p.categories.map(function(c) { return '<span class="pm-tag">' + (catLabels[c] || c) + '</span>'; }).join('') +
          '</div>' +
          '<div class="pm-title">' + p.title + '</div>' +
          '<div class="pm-desc">' + p.description + '</div>' +
          '<div class="pm-details">' +
            '<div class="pm-detail-row">' +
              '<div class="pm-detail-label">Tools</div>' +
              '<div class="pm-detail-value">' + p.tools.map(function(t) { return '<span class="tool-chip">' + t + '</span>'; }).join('') + '</div>' +
            '</div>' +
            (SHOW_INTERNAL_GALLERY_SETUP
              ? '<div class="pm-detail-row">' +
                  '<div class="pm-detail-label">Gallery Setup</div>' +
                  '<div class="pm-detail-value">Edit <code>projectGalleryConfig[\'' + p.id + '\']</code> to add/remove this project\'s images.</div>' +
                '</div>'
              : '') +
          '</div>' +
        '</div>' +
        '<div class="pm-story">' +
          currentProjectGallery.map(function(img, i) {
            return '<article class="pm-story-item">' +
              '<img class="pm-story-image" src="' + img + '" alt="' + p.title + ' visual ' + (i + 1) + '" loading="lazy" onclick="previewStoryImage(' + i + ')">' +
              (captionMap[img] ? '<div class="pm-story-caption">' + captionMap[img] + '</div>' : '') +
            '</article>';
          }).join('') +
        '</div>' +
      '</div>' +
      (currentFilteredProjects.length > 1
        ? '<div class="pm-nav">' +
            '<button class="pm-nav-btn" onclick="navProject(-1)">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> ' +
              prevTitle +
            '</button>' +
            '<button class="pm-nav-btn" onclick="navProject(1)">' +
              nextTitle + ' ' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
            '</button>' +
          '</div>'
        : '') +
    '</div>';
  modalEl.scrollTop = 0;
  setProjectExpanded(false);
  syncProjectImageState();
}

// --- Search Engine ---
function detectPrimaryCategory(query) {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const normalized = q.replace(/[^a-z0-9/+ ]+/g, " ");
  const words = normalized.split(/\s+/).filter(Boolean);
  const bigrams = [];
  const scores = { "ui-ux": 0, "3d": 0, "ai": 0, "vr-ar": 0, "architecture": 0 };

  for (let i = 0; i < words.length - 1; i++) bigrams.push(words[i] + " " + words[i + 1]);
  Object.entries(categorySignals).forEach(function(entry) {
    const cat = entry[0];
    const terms = entry[1];
    terms.forEach(function(term) {
      if (normalized.includes(term)) scores[cat] += 3;
    });
  });
  words.forEach(function(token) {
    const mapped = keywordMap[token];
    if (scores[mapped] !== undefined) scores[mapped] += 4;
  });
  bigrams.forEach(function(token) {
    const mapped = keywordMap[token];
    if (scores[mapped] !== undefined) scores[mapped] += 5;
  });

  const ranked = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
  return ranked[0][1] > 0 ? ranked[0][0] : null;
}

function searchProjects(query) {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);
  const scores = {};
  projects.forEach(function(p) {
    let score = 0;
    const searchable = [].concat(p.categories, p.tags, p.tools.map(function(t) { return t.toLowerCase(); }), [p.title.toLowerCase(), p.description.toLowerCase()]).join(' ');
    words.forEach(function(word) {
      if (keywordMap[word]) {
        const mapped = keywordMap[word];
        if (p.categories.includes(mapped)) score += 10;
        if (p.tags.includes(mapped)) score += 8;
        if (p.tools.map(function(t) { return t.toLowerCase(); }).some(function(t) { return t.includes(mapped); })) score += 8;
        if (searchable.includes(mapped)) score += 3;
      }
    });
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i] + ' ' + words[i + 1];
      if (keywordMap[bigram]) {
        const mapped = keywordMap[bigram];
        if (p.tags.includes(mapped)) score += 12;
        if (searchable.includes(mapped)) score += 5;
      }
    }
    words.forEach(function(word) { if (word.length >= 2 && searchable.includes(word)) score += 2; });
    if (score > 0) scores[p.id] = score;
  });
  return projects.filter(function(p) { return scores[p.id]; }).sort(function(a, b) { return scores[b.id] - scores[a.id]; });
}

function filterByCategory(catId) {
  return projects.filter(function(p) { return p.categories.includes(catId); });
}

// --- Rendering ---
function buildProjectCard(p, i, isRelated) {
  const extraClass = isRelated ? " related-card" : "";
  const cardImage = getProjectPrimaryImage(p);
  return '<div class="project-card' + extraClass + '" onclick="openProject(\'' + p.id + '\')" style="transition-delay:' + i * 0.08 + 's">' +
    '<div class="card-thumbnail">' +
      (cardImage
        ? '<img class="card-thumbnail-img" src="' + cardImage + '" alt="' + p.title + '" loading="lazy">'
        : '<div class="card-thumbnail-inner">' + p.thumbnail + '</div>') +
      '<div class="card-gradient"></div>' +
    '</div>' +
    '<div class="card-body">' +
      '<div class="card-tags">' +
        p.categories.map(function(c) { return '<span class="card-tag">' + (catLabels[c] || c) + '</span>'; }).join('') +
      '</div>' +
      '<div class="card-title">' + p.title + '</div>' +
      '<div class="card-desc">' + p.description + '</div>' +
      '<div class="card-meta">' +
        '<span class="card-tools">' + p.tools.join(' | ') + '</span>' +
        '<div class="card-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function generateResponse(query, count) {
  if (count === 0) return null;
  const t = [
    'Found <strong>' + count + ' project' + (count > 1 ? 's' : '') + '</strong> matching "' + query + '"',
    'Here ' + (count > 1 ? 'are' : 'is') + ' <strong>' + count + ' result' + (count > 1 ? 's' : '') + '</strong> for "' + query + '"',
    'Showing <strong>' + count + '</strong> relevant project' + (count > 1 ? 's' : '') + ' - sorted by relevance',
  ];
  return t[Math.floor(Math.random() * t.length)];
}

function buildSkeletonHTML(count) {
  let html = '<div class="skeleton-grid">';
  for (let i = 0; i < count; i++) {
    html += '<div class="skeleton-card" style="animation-delay:' + (i * 0.08) + 's">' +
      '<div class="skeleton-thumb"></div>' +
      '<div class="skeleton-body">' +
        '<div class="skeleton-line w60"></div>' +
        '<div class="skeleton-line title"></div>' +
        '<div class="skeleton-line w80"></div>' +
        '<div class="skeleton-line w40"></div>' +
        '<div class="skeleton-meta">' +
          '<div class="skeleton-meta-line"></div>' +
          '<div class="skeleton-circle"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }
  html += '</div>';
  return html;
}

function renderProjects(filteredProjects, responseHtml, options) {
  options = options || {};
  const relatedProjects = options.relatedProjects || [];
  const relatedTitle = options.relatedTitle || "Related";
  const botHtml = options.botHtml || '';
  currentFilteredProjects = filteredProjects;
  const area = document.getElementById('responseArea');
  const init = document.getElementById('initialState');
  if (init) init.remove();

  const skeletonCount = Math.min(filteredProjects.length || 3, 6);
  area.innerHTML = buildSkeletonHTML(skeletonCount);

  setTimeout(function() {
    let html = '';

    // Bot answer card goes first if present
    if (botHtml) {
      html += botHtml;
    }

    if (responseHtml) {
      html += '<div class="response-header" id="responseHeader"><div class="response-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="response-text">' + responseHtml + '</div></div>';
    }
    if (filteredProjects.length === 0 && !botHtml) {
      html += '<div class="no-results"><h3>No matches found</h3><p>Try a different query or browse by category above.</p></div>';
    } else if (filteredProjects.length > 0) {
      html += '<div class="project-grid">';
      filteredProjects.forEach(function(p, i) {
        html += buildProjectCard(p, i, false);
      });
      html += '</div>';
      if (relatedProjects.length > 0) {
        html += '<div class="results-section-title">' + relatedTitle + '</div><div class="related-grid">';
        relatedProjects.forEach(function(p, i) {
          html += buildProjectCard(p, i, true);
        });
        html += '</div>';
      }
    }

    area.innerHTML = html;
    requestAnimationFrame(function() {
      const header = document.getElementById('responseHeader');
      if (header) header.classList.add('visible');
      document.querySelectorAll('.project-card').forEach(function(card, i) {
        setTimeout(function() { card.classList.add('visible'); }, i * 80);
      });
    });
  }, 800);
}

// --- Q&A Bot Matcher ---
function matchIntent(query) {
  if (!qaData || !qaData.intents) return null;

  const turkishMap = (qaData.matcher && qaData.matcher.turkish_map) ? qaData.matcher.turkish_map : {};
  const intentHints = (qaData.matcher && qaData.matcher.intent_hints) ? qaData.matcher.intent_hints : {};
  const THRESHOLD = 0.62;

  // Preprocess query
  let q = query.toLowerCase().trim();
  q = q.replace(/[^\w\s\-\/&.]/g, ' ');
  q = q.replace(/\s+/g, ' ').trim();

  // Apply Turkish mapping
  let translatedQ = q;
  Object.keys(turkishMap).forEach(function(trWord) {
    const re = new RegExp('\\b' + trWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    translatedQ = translatedQ.replace(re, turkishMap[trWord]);
  });

  const queryTokens = translatedQ.split(/\s+/).filter(function(w) { return w.length > 0; });
  const queryStr = translatedQ;

  let bestMatch = null;
  let bestScore = 0;
  let bestKeywordCount = 0;

  qaData.intents.forEach(function(intent) {
    let score = 0;
    let keywordMatchCount = 0;

    // 1. Intent hint matching (highest priority, contributes to 0.2 weight portion)
    let hintScore = 0;
    Object.keys(intentHints).forEach(function(hintCategory) {
      const hints = intentHints[hintCategory];
      hints.forEach(function(hint) {
        if (queryStr.includes(hint.toLowerCase())) {
          // Check if this hint category relates to this intent
          const intentKeywords = intent.keywords || [];
          const intentVariants = (intent.question_variants || []).join(' ').toLowerCase();
          const intentCanonical = (intent.canonical_question || '').toLowerCase();
          if (intentKeywords.some(function(kw) { return hint.toLowerCase().includes(kw) || kw.includes(hint.toLowerCase()); }) ||
              intentVariants.includes(hint.toLowerCase()) ||
              intentCanonical.includes(hint.toLowerCase())) {
            hintScore = Math.max(hintScore, 1.0);
          }
        }
      });
    });

    // Also check direct substring matches on intent hints mapped to this intent's id
    const intentIdBase = intent.id.replace(/_/g, ' ').toLowerCase();
    Object.keys(intentHints).forEach(function(hintCat) {
      if (intentIdBase.includes(hintCat) || hintCat.includes(intentIdBase.split('_')[0])) {
        intentHints[hintCat].forEach(function(hint) {
          if (queryStr.includes(hint.toLowerCase())) {
            hintScore = Math.max(hintScore, 1.0);
          }
        });
      }
    });

    // 2. Keyword overlap
    const intentKeywords = intent.keywords || [];
    queryTokens.forEach(function(token) {
      if (intentKeywords.some(function(kw) { return kw.toLowerCase() === token || token.includes(kw.toLowerCase()) || kw.toLowerCase().includes(token); })) {
        keywordMatchCount++;
      }
    });
    const keywordScore = queryTokens.length > 0 ? keywordMatchCount / queryTokens.length : 0;

    // 3. Fuzzy similarity against canonical question and variants
    let fuzzyScore = 0;
    const allVariants = [intent.canonical_question || ''].concat(intent.question_variants || []);
    allVariants.forEach(function(variant) {
      const varLower = variant.toLowerCase().trim();
      // Direct substring match
      if (queryStr.includes(varLower) || varLower.includes(queryStr)) {
        fuzzyScore = Math.max(fuzzyScore, 0.9);
      }
      // Token overlap similarity
      const varTokens = varLower.split(/\s+/).filter(function(w) { return w.length > 0; });
      let overlap = 0;
      queryTokens.forEach(function(qt) {
        if (varTokens.some(function(vt) { return vt === qt || levenshteinSimilarity(qt, vt) >= 0.75; })) {
          overlap++;
        }
      });
      const tokSimilarity = queryTokens.length > 0 ? overlap / Math.max(queryTokens.length, varTokens.length) : 0;
      fuzzyScore = Math.max(fuzzyScore, tokSimilarity);
    });

    // Weighted score
    if (queryTokens.length < 3) {
      // Short queries: keyword-heavy
      score = 0.3 * fuzzyScore + 0.5 * keywordScore + 0.2 * hintScore;
    } else {
      // Longer queries: balanced
      score = 0.5 * fuzzyScore + 0.3 * keywordScore + 0.2 * hintScore;
    }

    if (score > bestScore || (Math.abs(score - bestScore) < 0.05 && keywordMatchCount > bestKeywordCount)) {
      bestScore = score;
      bestMatch = intent;
      bestKeywordCount = keywordMatchCount;
    }
  });

  if (bestScore >= THRESHOLD && bestMatch) {
    return { intent: bestMatch, score: bestScore };
  }

  return null;
}

function levenshteinSimilarity(a, b) {
  if (a === b) return 1.0;
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0 || lenB === 0) return 0;

  const matrix = [];
  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[lenA][lenB];
  return 1.0 - (distance / Math.max(lenA, lenB));
}

function buildBotAnswerHtml(intent) {
  const answer = intent.answer || {};
  const short = answer.short || '';
  const detailed = answer.detailed || '';
  const relatedLinks = intent.related_links || [];

  let linksHtml = '';
  if (relatedLinks.length > 0) {
    linksHtml = '<div class="bot-links">' +
      relatedLinks.map(function(link) {
        let label = link;
        if (link.includes('linkedin')) label = 'LinkedIn';
        else if (link.includes('mailto:')) label = 'Email';
        else if (link.includes('fatihgulen.com')) label = 'Website';
        else if (link.includes('artstation')) label = 'ArtStation';
        else if (link.includes('myportfolio')) label = 'UI Portfolio';
        else label = link.replace(/https?:\/\//, '').replace(/\/$/, '');
        return '<a href="' + link + '" target="_blank">' + label + '</a>';
      }).join('') +
    '</div>';
  }

  return '<div class="bot-answer-card">' +
    '<div class="bot-answer-header">' +
      '<div class="bot-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0a0a0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1H3v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2H5z"/></svg></div>' +
      '<span class="bot-label">Portfolio Assistant</span>' +
    '</div>' +
    '<div class="bot-answer-short">' + short + '</div>' +
    (detailed && detailed !== short
      ? '<button class="bot-expand-btn" onclick="toggleBotDetail(this)">Read more</button>' +
        '<div class="bot-answer-detailed">' + detailed + '</div>'
      : '') +
    linksHtml +
  '</div>';
}

function toggleBotDetail(btn) {
  const detailed = btn.nextElementSibling;
  if (!detailed) return;
  const isExpanded = detailed.classList.contains('expanded');
  if (isExpanded) {
    detailed.classList.remove('expanded');
    detailed.style.display = 'none';
    btn.textContent = 'Read more';
  } else {
    detailed.style.display = 'block';
    // Trigger reflow for transition
    void detailed.offsetHeight;
    detailed.classList.add('expanded');
    btn.textContent = 'Show less';
  }
}

function handleBotQuery(query) {
  const match = matchIntent(query);
  if (match) {
    return buildBotAnswerHtml(match.intent);
  }
  return '';
}

// --- Handlers ---
function handleQuery() {
  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  if (!query) return;

  // Check for QA bot match first
  const botHtml = handleBotQuery(query);

  const results = searchProjects(query);
  const primaryCategory = detectPrimaryCategory(query);
  let mainResults = results;
  let relatedResults = [];
  if (primaryCategory) {
    mainResults = results.filter(function(p) { return p.categories.includes(primaryCategory); });
    relatedResults = results.filter(function(p) { return !p.categories.includes(primaryCategory); }).slice(0, 4);
    if (mainResults.length === 0) mainResults = filterByCategory(primaryCategory);
  }
  const response = mainResults.length > 0 ? generateResponse(query, mainResults.length) : null;

  // If we have a bot answer but no project matches, still show the bot card
  if (botHtml && mainResults.length === 0) {
    renderProjects(mainResults, null, {
      relatedProjects: relatedResults,
      relatedTitle: "Related",
      botHtml: botHtml
    });
  } else {
    renderProjects(mainResults, response || 'No matches for "' + query + '" - try broader terms or pick a category.', {
      relatedProjects: relatedResults,
      relatedTitle: "Related",
      botHtml: botHtml
    });
  }
  document.querySelectorAll('.cat-pill').forEach(function(p) { p.classList.remove('active'); });
}

function filterCategory(el) {
  const cat = el.dataset.cat;
  const wasActive = el.classList.contains('active');
  document.querySelectorAll('.cat-pill').forEach(function(p) { p.classList.remove('active'); });
  if (wasActive) { resetView(); return; }
  el.classList.add('active');
  const results = filterByCategory(cat);
  const catName = catLabels[cat] || cat;
  renderProjects(results, 'Browsing <strong>' + catName + '</strong> - ' + results.length + ' project' + (results.length > 1 ? 's' : '') + ' in this category');
  document.getElementById('chatInput').value = '';
  toggleSubmit();
}

function usePrompt(el) {
  document.getElementById('chatInput').value = el.textContent;
  toggleSubmit();
  handleQuery();
}

function toggleSubmit() {
  const btn = document.getElementById('submitBtn');
  btn.classList.toggle('active', document.getElementById('chatInput').value.trim().length > 0);
}

function resetView() {
  document.querySelectorAll('.cat-pill').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('chatInput').value = '';
  toggleSubmit();
  const initialText = (siteData && siteData.settings && siteData.settings.initialStateText)
    ? siteData.settings.initialStateText
    : 'Select a category or type a query to explore projects. Press <span class="keystroke">Enter</span> to search.';
  document.getElementById('responseArea').innerHTML = '<div class="initial-state" id="initialState">' + initialText + '</div>';
}

// --- 3D Neon Cursor ---
(function initNeonCursor() {
  const cursor = document.getElementById('neonCursor');
  if (!cursor || window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window) {
    if (cursor) cursor.style.display = 'none';
    document.documentElement.style.cssText += '* { cursor: auto !important; }';
    return;
  }

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

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseover', function(e) {
    const isClickable = e.target.closest('a, button, [onclick], .cat-pill, .suggest-chip, .project-card, .modal-link, .pm-nav-btn, .tour-bot-avatar, .tour-btn, input');
    cursor.classList.toggle('hovering', !!isClickable);
  });

  document.addEventListener('mousedown', function() { cursor.classList.add('clicking'); });
  document.addEventListener('mouseup', function() { cursor.classList.remove('clicking'); });

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

  document.addEventListener('mouseleave', function() {
    cursor.style.opacity = '0';
    trails.forEach(function(t) { t.el.style.opacity = '0'; });
  });
  document.addEventListener('mouseenter', function() {
    cursor.style.opacity = '1';
  });
})();

// --- Onboarding Tour ---
(function initTour() {
  const TOUR_KEY = 'portfolio_tour_seen';
  const tourSteps = [
    {
      target: '#categories .cat-pill:first-child',
      title: 'Browse Categories',
      content: 'You can <strong>select directly from these categories</strong> to instantly filter projects by <span class="tour-highlight">UI/UX, 3D, AI, VR/AR,</span> or <span class="tour-highlight">Architecture</span>.',
      position: 'below'
    },
    {
      target: '.chat-input-container',
      title: 'Search by Intent',
      content: 'You can <strong>directly type here</strong> which categories or topics you\'d like to see. Try something like <span class="tour-highlight">"VR projects in Unreal"</span> or <span class="tour-highlight">"AI workflows"</span>.',
      position: 'below'
    },
    {
      target: '#suggestedPrompts .suggest-chip:first-child',
      title: 'Quick Prompts',
      content: 'You can use these <strong>ready prompt chips</strong> for instant examples. Tap any chip and results appear directly below.',
      position: 'below'
    },
    {
      target: 'span.header-link[onclick="openAbout()"]',
      title: 'About Section',
      content: 'This <strong>About</strong> button opens profile details, contact channels, and your intro summary.',
      position: 'below'
    },
    {
      target: '.footer-links',
      title: 'Get in Touch',
      content: 'You can <strong>directly contact me</strong> via these links - <span class="tour-highlight">LinkedIn</span>, <span class="tour-highlight">Website</span>, or <span class="tour-highlight">Email</span>. Or click <span class="tour-highlight">About</span> in the header for full details.',
      position: 'above'
    }
  ];

  let currentStep = 0;
  let tourActive = false;
  let highlightedTourTarget = null;

  function updateTourOverlayCutout(targetEl) {
    const overlay = document.getElementById('tourOverlay');
    if (!overlay) return;
    if (!targetEl) {
      overlay.style.setProperty('--tour-hole-top', '0px');
      overlay.style.setProperty('--tour-hole-left', '0px');
      overlay.style.setProperty('--tour-hole-width', '0px');
      overlay.style.setProperty('--tour-hole-height', '0px');
      return;
    }
    const rect = targetEl.getBoundingClientRect();
    const pad = 6;
    const left = Math.max(0, rect.left - pad);
    const top = Math.max(0, rect.top - pad);
    const width = Math.max(0, Math.min(window.innerWidth - left, rect.width + (pad * 2)));
    const height = Math.max(0, Math.min(window.innerHeight - top, rect.height + (pad * 2)));
    overlay.style.setProperty('--tour-hole-top', top + 'px');
    overlay.style.setProperty('--tour-hole-left', left + 'px');
    overlay.style.setProperty('--tour-hole-width', width + 'px');
    overlay.style.setProperty('--tour-hole-height', height + 'px');
  }

  function updateTourBotPosition() {
    const bot = document.getElementById('tourBot');
    const footer = document.querySelector('footer');
    if (!bot || !footer || !bot.classList.contains('floating')) return;

    const baseBottom = window.matchMedia('(max-width: 768px)').matches ? 20 : 30;
    const footerRect = footer.getBoundingClientRect();
    let bottom = baseBottom;

    if (footerRect.top < window.innerHeight) {
      const overlap = window.innerHeight - footerRect.top;
      bottom = Math.min(220, baseBottom + overlap + 16);
    }
    bot.style.bottom = bottom + 'px';
  }

  window.startTour = function() {
    tourActive = true;
    currentStep = 0;
    document.getElementById('tourBot').style.display = 'none';
    document.getElementById('tourOverlay').classList.add('active');
    showStep(0);
  };

  window.closeTour = function() {
    tourActive = false;
    document.getElementById('tourOverlay').classList.remove('active');
    document.getElementById('tourDialog').classList.remove('active');
    document.getElementById('tourPointer').classList.remove('active');
    updateTourOverlayCutout(null);
    if (highlightedTourTarget) {
      highlightedTourTarget.classList.remove('tour-target-highlight');
      highlightedTourTarget = null;
    }
    const bot = document.getElementById('tourBot');
    bot.classList.add('floating');
    bot.style.display = 'block';
    updateTourBotPosition();
    sessionStorage.setItem(TOUR_KEY, '1');
  };

  function showStep(idx) {
    currentStep = idx;
    const step = tourSteps[idx];
    const targetEl = document.querySelector(step.target);
    if (highlightedTourTarget) {
      highlightedTourTarget.classList.remove('tour-target-highlight');
      highlightedTourTarget = null;
    }
    if (targetEl) {
      targetEl.classList.add('tour-target-highlight');
      highlightedTourTarget = targetEl;
      updateTourOverlayCutout(targetEl);
    } else {
      updateTourOverlayCutout(null);
    }

    // Update step indicator
    const indicator = document.getElementById('tourStepIndicator');
    indicator.innerHTML = tourSteps.map(function(_, i) {
      return '<div class="tour-step-dot ' + (i === idx ? 'active' : i < idx ? 'completed' : '') + '"></div>';
    }).join('');

    // Update content
    document.getElementById('tourStepContent').innerHTML =
      '<span class="tour-step-num">Step ' + (idx + 1) + ' of ' + tourSteps.length + '</span>' + step.content;

    // Update footer buttons
    const footer = document.getElementById('tourFooter');
    let footerHtml = '<button class="tour-btn tour-btn-skip" onclick="closeTour()">Skip</button><div style="display:flex;gap:8px;">';
    if (idx > 0) {
      footerHtml += '<button class="tour-btn tour-btn-back" onclick="tourNav(-1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back</button>';
    }
    if (idx < tourSteps.length - 1) {
      footerHtml += '<button class="tour-btn tour-btn-next" onclick="tourNav(1)">Next <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>';
    } else {
      footerHtml += '<button class="tour-btn tour-btn-next" onclick="closeTour()">Got it!</button>';
    }
    footerHtml += '</div>';
    footer.innerHTML = footerHtml;

    // Position pointer on target
    const pointer = document.getElementById('tourPointer');
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      pointer.style.left = (rect.left + rect.width / 2 - 30) + 'px';
      pointer.style.top = (rect.top + rect.height / 2 - 30) + 'px';
      pointer.classList.add('active');

      // Scroll target into view
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function() { updateTourOverlayCutout(targetEl); }, 220);
    }

    // Position dialog
    const dialog = document.getElementById('tourDialog');
    setTimeout(function() {
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        if (step.position === 'above') {
          dialog.style.bottom = (window.innerHeight - rect.top + 20) + 'px';
          dialog.style.top = 'auto';
          dialog.style.right = '20px';
          dialog.style.left = 'auto';
        } else {
          dialog.style.top = (rect.bottom + 20) + 'px';
          dialog.style.bottom = 'auto';
          dialog.style.right = 'auto';
          dialog.style.left = Math.max(20, Math.min(rect.left, window.innerWidth - 380)) + 'px';
        }
      }
      dialog.classList.add('active');
    }, 100);
  }

  window.tourNav = function(dir) {
    const next = currentStep + dir;
    if (next < 0 || next >= tourSteps.length) return;
    const dialog = document.getElementById('tourDialog');
    dialog.classList.remove('active');
    document.getElementById('tourPointer').classList.remove('active');
    setTimeout(function() { showStep(next); }, 300);
  };

  // Auto-show tour on first visit (delayed for page load animations)
  const bot = document.getElementById('tourBot');
  bot.classList.add('floating');
  bot.style.display = 'block';
  updateTourBotPosition();
  window.addEventListener('scroll', updateTourBotPosition, { passive: true });
  window.addEventListener('resize', updateTourBotPosition);

  if (!sessionStorage.getItem(TOUR_KEY)) {
    setTimeout(function() {
      // Auto-start after a short pause
      setTimeout(function() { startTour(); }, 1200);
    }, 2000);
  }
})();

// --- Neon Star Particles ---
(function initNeonStars() {
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

  const STAR_COUNT = 60;
  const stars = [];

  const colors = [
    { r: 196, g: 240, b: 77 },   // accent green
    { r: 160, g: 210, b: 50 },   // darker green
    { r: 220, g: 255, b: 120 },  // lighter green
    { r: 140, g: 200, b: 80 },   // muted green
    { r: 255, g: 255, b: 200 },  // warm white
  ];

  for (let i = 0; i < STAR_COUNT; i++) {
    const col = colors[Math.floor(Math.random() * colors.length)];
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 0.5,
      baseAlpha: Math.random() * 0.4 + 0.1,
      alpha: 0,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.15,
      driftY: (Math.random() - 0.5) * 0.08,
      color: col,
      glowSize: Math.random() * 8 + 4,
      isBright: Math.random() < 0.15
    });
  }

  function drawStar(star) {
    const a = star.alpha;
    if (a < 0.01) return;

    const x = star.x, y = star.y, size = star.size, color = star.color, glowSize = star.glowSize, isBright = star.isBright;
    const s = isBright ? size * 2 : size;
    const g = isBright ? glowSize * 1.5 : glowSize;

    // Outer glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, g);
    grad.addColorStop(0, 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + (a * 0.5) + ')');
    grad.addColorStop(0.4, 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + (a * 0.15) + ')');
    grad.addColorStop(1, 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, g, 0, Math.PI * 2);
    ctx.fill();

    // Bright core - 4-point star shape for feature stars
    if (isBright) {
      ctx.save();
      ctx.globalAlpha = a * 0.8;
      ctx.strokeStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + (a * 0.6) + ')';
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
    ctx.fillStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + a + ')';
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }

  let time = 0;
  function animate() {
    ctx.clearRect(0, 0, w, h);
    time += 0.016;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
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
    requestAnimationFrame(animate);
  }
  animate();
})();

// --- Keyboard Events ---
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  closeProjectLightbox();
  closeAbout();
  closeProject();
});

// --- Boot ---
document.addEventListener('DOMContentLoaded', init);
