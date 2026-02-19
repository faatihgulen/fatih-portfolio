const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'data', 'site.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// ─── API: Read site data ───
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Save site data ───
app.post('/api/data', (req, res) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Scan all image directories ───
app.get('/api/images/scan', (req, res) => {
  try {
    const imagesDir = path.join(__dirname, 'images');
    const result = {};
    const cats = fs.readdirSync(imagesDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const cat of cats) {
      const catPath = path.join(imagesDir, cat.name);
      const projs = fs.readdirSync(catPath, { withFileTypes: true }).filter(d => d.isDirectory());
      for (const proj of projs) {
        const projPath = path.join(catPath, proj.name);
        const files = fs.readdirSync(projPath)
          .filter(f => /\.(webp|jpg|jpeg|png|gif|mp4)$/i.test(f))
          .map(f => `images/${cat.name}/${proj.name}/${f}`);
        result[`${cat.name}/${proj.name}`] = files;
      }
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Upload images ───
const upload = multer({ dest: path.join(__dirname, 'uploads') });
app.post('/api/upload', upload.array('images', 20), async (req, res) => {
  try {
    const targetDir = path.join(__dirname, req.body.targetDir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const uploaded = [];
    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = path.parse(file.originalname).name + '.webp';
      const dest = path.join(targetDir, name);

      if (['.mp4', '.gif'].includes(ext)) {
        // Copy video/gif files as-is
        const copyName = file.originalname;
        const copyDest = path.join(targetDir, copyName);
        fs.copyFileSync(file.path, copyDest);
        uploaded.push(req.body.targetDir + '/' + copyName);
      } else {
        await sharp(file.path).webp({ quality: 80 }).toFile(dest);
        uploaded.push(req.body.targetDir + '/' + name);
      }
      fs.unlinkSync(file.path);
    }
    res.json({ success: true, files: uploaded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Delete image ───
app.delete('/api/images', (req, res) => {
  try {
    const filePath = path.join(__dirname, req.body.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Portfolio server running at http://localhost:${PORT}`);
  console.log(`  Admin panel at http://localhost:${PORT}/admin.html\n`);
});
