import fs from "node:fs";
import path from "node:path";

const srcDir = path.resolve(".stitch/editorial_ink");
const designsDir = path.resolve(".stitch/designs");
const assetsDir = path.resolve(".stitch/assets");

if (!fs.existsSync(designsDir)) fs.mkdirSync(designsDir, { recursive: true });
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(srcDir, "manifest.json"), "utf8"));

for (const item of manifest) {
  // Screen 7 -> .stitch/DESIGN.md
  if (item.index === 7 || item.id === "89012a0cfd6e40818b9eb3178d701a37") {
    if (item.codeFile) {
      fs.copyFileSync(path.join(srcDir, item.codeFile), path.resolve(".stitch/DESIGN.md"));
      console.log(`Saved .stitch/DESIGN.md from ${item.codeFile}`);
    }
    continue;
  }

  // Screen 15 -> .stitch/assets/
  if (item.index === 15 || item.id === "3fa624e46fea45bd968a895076744b05") {
    if (item.imageFile) {
      fs.copyFileSync(path.join(srcDir, item.imageFile), path.join(assetsDir, "bookie_ai_archival_mentor_emblem.png"));
      fs.copyFileSync(path.join(srcDir, item.imageFile), path.join(designsDir, `${item.id}.png`));
    }
    if (item.codeFile) {
      fs.copyFileSync(path.join(srcDir, item.codeFile), path.join(assetsDir, "bookie_ai_archival_mentor_emblem.html"));
      fs.copyFileSync(path.join(srcDir, item.codeFile), path.join(designsDir, `${item.id}.html`));
    }
    console.log(`Saved Screen 15 into .stitch/assets/ and .stitch/designs/`);
    continue;
  }

  // Other screens -> .stitch/designs/<screenId>.html and .png
  if (item.imageFile) {
    fs.copyFileSync(path.join(srcDir, item.imageFile), path.join(designsDir, `${item.id}.png`));
  }
  if (item.codeFile) {
    fs.copyFileSync(path.join(srcDir, item.codeFile), path.join(designsDir, `${item.id}.html`));
  }
  console.log(`Saved screen ${item.id} (${item.slug}) into .stitch/designs/`);
}

console.log("Stitch paths synchronization complete!");
