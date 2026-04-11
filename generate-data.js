const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const resumeDir = 'C:/Users/Casper/Downloads/Resumes';

// Scan a directory for webp/image files
function scanDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /\.(webp)$/i.test(f))
    .map(f => path.relative(__dirname, path.join(dir, f)).replace(/\\/g, '/'));
}

// Derive image folder from cover image path
function getImageFolder(imagePath) {
  if (!imagePath) return null;
  const parts = imagePath.replace(/\\/g, '/').split('/');
  parts.pop(); // remove filename
  return parts.join('/');
}

// Projects from current index.html
const projects = [
  { id:"p01", title:"AERONIX — EV Dashboard UI", description:"End-to-end dashboard and interface design for an electric vehicle platform. Drive mode, charging screens, and immersive 3D car visualizations.", categories:["ui-ux"], tags:["dashboard","ev","automotive","dark-mode","figma","design-system","car"], tools:["Figma","Blender","After Effects"], thumbnail:"📊", image:"images/UI/AERONIX/Slide 16_9 - 1.webp", year:2025 },
  { id:"p02", title:"GroceryMate — Mobile App", description:"Complete mobile grocery shopping experience. Intuitive product browsing, cart management, and delivery tracking with clean UI.", categories:["ui-ux"], tags:["mobile","grocery","app","ios","figma","prototype","ecommerce"], tools:["Figma","Protopie"], thumbnail:"📱", image:"images/UI/GroceryMate/app (1).webp", year:2025 },
  { id:"p03", title:"Hipicon — Brand Identity", description:"Brand identity and UI design for Hipicon. Visual language, component system, and marketing collateral.", categories:["ui-ux"], tags:["branding","identity","ui","web","interaction","design"], tools:["Figma","Illustrator"], thumbnail:"🛍", image:"images/UI/Hipicon/40ca1d0a-9c16-42e9-8ad3-9ccb47228f54_rw_1920.webp", year:2024 },
  { id:"p04", title:"Balıkesir — Architectural Viz", description:"Architectural visualization for Balıkesir residential project. Photorealistic renders from concept to final presentation.", categories:["architecture","3d"], tags:["parametric","residential","archviz","grasshopper","rhino","rendering"], tools:["Rhino","V-Ray","Photoshop"], thumbnail:"🏗", image:"images/Architecture/Balıkesir/12345 (2).webp", year:2024 },
  { id:"p05", title:"Huawei VR — Racket Training", description:"VR racket training simulation for Huawei. Spatial UI, gesture tracking, and immersive training environments built in Unity.", categories:["vr-ar","3d"], tags:["vr","training","unity","immersive","spatial-ui","hand-tracking","huawei"], tools:["Unity","C#","Huawei VR SDK"], thumbnail:"🥽", image:"images/VR/Huawei/Racket_Training_1st.webp", year:2025 },
  { id:"p06", title:"Synapse — AI Workflow Engine", description:"ComfyUI-based AI image generation pipeline. Custom nodes for style transfer, upscaling, and batch processing.", categories:["ai"], tags:["comfyui","ai","workflow","image-generation","stable-diffusion","pipeline","automation","nodes"], tools:["ComfyUI","Python","Stable Diffusion"], thumbnail:"🧠", image:"images/AI/Character_Comfyui/Deliverables_1.webp", year:2025 },
  { id:"p07", title:"Istanbloom — Interior Design", description:"Interior design and architectural visualization for Istanbloom residential project. Living spaces, bathrooms, and lifestyle renders.", categories:["architecture","3d"], tags:["interior","residential","visualization","rendering","archviz","istanbul"], tools:["3ds Max","V-Ray","Photoshop"], thumbnail:"🏠", image:"images/Architecture/Istanbloom/ff1 (1).webp", year:2024 },
  { id:"p08", title:"AI Character — ComfyUI Pipeline", description:"AI-assisted character creation pipeline using ComfyUI. Custom workflows for style-consistent character generation and animation.", categories:["ai","ui-ux"], tags:["ai","creative-tool","text-to-image","comfyui","character","stable-diffusion","interface"], tools:["ComfyUI","Python","Stable Diffusion"], thumbnail:"🎨", image:"images/AI/Character_Comfyui/Deliverables_3.webp", year:2025 },
  { id:"p09", title:"Resorsus — Platform UI", description:"UI/UX design for Resorsus platform. Clean, modern interface with comprehensive design system and dark theme.", categories:["ui-ux"], tags:["platform","saas","interface","dashboard","web","design","dark-mode"], tools:["Figma","React"], thumbnail:"💬", image:"images/UI/Resorsus/8e50e9a5-ad79-47a9-8529-8128556506cf_rw_1920.webp", year:2025 },
  { id:"p10", title:"Whaf — 3D Product Visualization", description:"3D product visualization and rendering for Whaf. High-fidelity models with realistic materials and lighting.", categories:["3d","ui-ux"], tags:["3d","product","visualization","rendering","blender","materials","ecommerce"], tools:["Blender","Substance Painter","Photoshop"], thumbnail:"💎", image:"images/3D/Whaf/Whaf1.webp", year:2025 },
  { id:"p11", title:"Gym — Fitness Center Design", description:"Architectural design and visualization for a modern fitness center. Interior layouts, equipment placement, and atmospheric renders.", categories:["architecture","3d"], tags:["gym","fitness","interior","visualization","rendering","archviz","commercial"], tools:["3ds Max","V-Ray","Photoshop"], thumbnail:"🏛", image:"images/Architecture/Gym/2 (1) (2).webp", year:2024 },
  { id:"p12", title:"AI Thesis — Research Project", description:"Academic research project exploring AI-driven design workflows. Thesis documentation with generative design experiments.", categories:["ai"], tags:["ai","research","thesis","generative","automation","academic","design"], tools:["Python","ComfyUI","LaTeX"], thumbnail:"🎞", image:"images/AI/Thesis/1 (1).webp", year:2025 },
  { id:"p13", title:"Huawei VR — Unity Environments", description:"VR environment development for Huawei training platform. Spatial interaction design and immersive scene building.", categories:["vr-ar"], tags:["vr","unity","environment","simulation","industrial","huawei","spatial-ui","immersive"], tools:["Unity","C#","Blender"], thumbnail:"⚡", image:"images/VR/Huawei/Unity4.webp", year:2024 },
  { id:"p14", title:"AERONIX — Design System", description:"Comprehensive design system for AERONIX EV platform. 100+ components, dark/light modes, and automotive-specific patterns.", categories:["ui-ux"], tags:["design-system","components","tokens","accessibility","automotive","figma","ev"], tools:["Figma","Storybook","React"], thumbnail:"🔧", image:"images/UI/AERONIX/Slide 16_9 - 3.webp", year:2025 },
  { id:"p15", title:"AI Art — Diffusion Collection", description:"Curated collection of AI-generated art exploring identity and perception. Custom-trained models on personal datasets.", categories:["ai"], tags:["ai-art","generative","diffusion","collection","identity","custom-model","training"], tools:["Stable Diffusion","ComfyUI","LoRA"], thumbnail:"🖼", image:"images/AI/Character_Comfyui/Deliverables_5.webp", year:2025 },
  { id:"p16", title:"VFX — 3D Visual Effects", description:"Real-time visual effects and 3D compositing. Particle systems, shader development, and post-processing pipelines.", categories:["3d"], tags:["vfx","visual-effects","shaders","3d","particles","compositing","generative"], tools:["Blender","After Effects","Unreal Engine"], thumbnail:"🌊", image:"images/3D/VFX/posst.webp", year:2025 },
  { id:"p17", title:"3D Materials — Texture Library", description:"Custom PBR material library with realistic metal, fabric, and organic surfaces. Procedural and hand-painted textures.", categories:["3d"], tags:["materials","textures","pbr","3d","substance","procedural","library"], tools:["Substance Painter","Blender","Photoshop"], thumbnail:"📈", image:"images/3D/Material/761c1a94-4679-498b-8b6d-c16150a59055_rw_1920.webp", year:2025 },
  { id:"p18", title:"3D Concept — Digital Sculpture", description:"Digital sculpture and concept art. High-poly modeling with detailed surface work and cinematic composition.", categories:["3d"], tags:["concept","sculpture","3d","digital","modeling","zbrush","art"], tools:["ZBrush","Blender","Photoshop"], thumbnail:"🌆", image:"images/3D/Concept/8089a030-25ee-409e-8036-c16b8cc426f4_rw_1920.webp", year:2025 },
  { id:"p19", title:"AERONIX — 3D Car Visuals", description:"High-fidelity 3D car visualization for AERONIX EV. Detailed exterior renders, lighting studies, and turntable animations.", categories:["3d","ui-ux"], tags:["3d","car","automotive","visualization","rendering","blender","ev"], tools:["Blender","Substance Painter","After Effects"], thumbnail:"🚗", image:"images/UI/AERONIX/ian-tan-db10-comp-v003-100.webp", year:2025 },
  { id:"p20", title:"Lumen — Portfolio Website", description:"AI-interface portfolio concept. Chat-based navigation, smart filtering, and ambient design system.", categories:["ui-ux"], tags:["portfolio","website","chat","interface","web","design","concept"], tools:["HTML/CSS/JS","Framer"], thumbnail:"✦", image:"", year:2026 }
];

// Shared folder tracking - which projects share which folders
const sharedFolders = {};
projects.forEach(p => {
  const folder = getImageFolder(p.image);
  if (!folder) return;
  if (!sharedFolders[folder]) sharedFolders[folder] = [];
  sharedFolders[folder].push(p.id);
});

// Build images[] for each project
projects.forEach((p, i) => {
  p.order = i;
  const folder = getImageFolder(p.image);
  if (!folder) { p.images = []; return; }

  const fullDir = path.join(__dirname, folder);
  const allFiles = scanDir(fullDir);

  // If folder is shared by multiple projects, only include the cover image
  if (sharedFolders[folder] && sharedFolders[folder].length > 1) {
    p.images = p.image ? [p.image] : [];
  } else {
    // Unique folder - include all webp files, cover first
    p.images = allFiles;
    if (p.image && p.images.includes(p.image)) {
      p.images = [p.image, ...p.images.filter(img => img !== p.image)];
    }
  }
});

const siteData = {
  settings: {
    siteTitle: "Fatih Gulen — Portfolio",
    logoText: "Fatih Gulen",
    heroLabel: "Design Portfolio",
    heroTitle: "Ask me anything.<br>I'll show you <em>the work.</em>",
    heroSubtitle: "Browse by category or describe what you're looking for. This portfolio understands context, tools, and intent.",
    searchPlaceholder: 'Try: "Show me your Unreal VR projects"',
    initialStateText: "Select a category or type a query to explore projects. Press <span class=\"keystroke\">Enter</span> to search.",
    footerText: "© 2026 Fatih Gulen",
    suggestedPrompts: [
      "Dashboard UI examples",
      "VR projects in Unreal",
      "AI workflows with ComfyUI",
      "Architectural visualizations",
      "3D product configurators"
    ],
    about: {
      avatarImage: "images/Fatih_Gulen/1767480367261.webp",
      avatarFallback: "FG",
      name: "Fatih Gulen",
      title: "Real-Time Experience Designer",
      bio: "Real-Time Experience Designer working across UI/UX, 3D, AI workflows, VR/AR experiences, and architectural visualization. I blend design thinking with emerging technologies to create meaningful, immersive digital experiences. Based in Germany.",
      links: [
        { type: "website", label: "Website", value: "fatihgulen.com", url: "https://fatihgulen.com" },
        { type: "linkedin", label: "LinkedIn", value: "in/faatihgulen", url: "https://www.linkedin.com/in/faatihgulen/" },
        { type: "email", label: "Email", value: "faatihgulen@gmail.com", url: "mailto:faatihgulen@gmail.com" },
        { type: "phone", label: "Telefon", value: "+49 176 3716 0838", url: "tel:+4917637160838" }
      ]
    },
    footerLinks: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/faatihgulen/" },
      { label: "Website", url: "https://fatihgulen.com" },
      { label: "Email", url: "mailto:faatihgulen@gmail.com" }
    ]
  },
  categories: [
    { id: "ui-ux", label: "UI / UX", order: 0 },
    { id: "3d", label: "3D", order: 1 },
    { id: "ai", label: "AI", order: 2 },
    { id: "vr-ar", label: "VR / AR", order: 3 },
    { id: "architecture", label: "Architecture", order: 4 }
  ],
  keywordMap: {
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
  },
  projects: projects
};

// Write
const outPath = path.join(__dirname, 'data', 'site.json');
fs.writeFileSync(outPath, JSON.stringify(siteData, null, 2), 'utf8');
console.log(`Generated ${outPath}`);
console.log(`Projects: ${projects.length}`);
projects.forEach(p => console.log(`  ${p.id}: ${p.title} — ${p.images.length} images`));
