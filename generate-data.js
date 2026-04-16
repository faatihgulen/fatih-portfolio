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
  { id:"p01", title:"AERONIX - EV Dashboard UI", description:"End-to-end dashboard and interface design for an electric vehicle platform. Drive mode, charging screens, and immersive interior and HMI visualizations.", categories:["ui-ux","ai"], tags:["dashboard","ev","automotive","dark-mode","figma","design-system","car"], tools:["Figma","VizcomAI","ComfyUI","Procreate"], thumbnail:"UI", image:"images/UI/AERONIX/Drive.webp", year:2026 },
  { id:"p02", title:"GroceryMate - Mobile App", description:"Complete mobile grocery shopping experience. Intuitive product browsing, cart management, and delivery tracking with clean UI.", categories:["ui-ux"], tags:["mobile","grocery","app","ios","figma","prototype","ecommerce"], tools:["Figma"], thumbnail:"APP", image:"images/UI/GroceryMate/26e8c458-b65e-4b0e-b1c0-8372f63651b9.webp", year:2025 },
  //{ id:"p03", title:"Hipicon - Brand Identity", description:"Brand identity and UI design for Hipicon. Visual language, component system, and marketing collateral.", categories:["ui-ux"], tags:["branding","identity","ui","web","interaction","design"], tools:["Figma","Photoshop","Canva"], thumbnail:"BRAND", image:"images/UI/Hipicon/3045a34b-7d15-4e97-80b1-7c4169b84e62_rw_1200.webp", year:2020 },
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
