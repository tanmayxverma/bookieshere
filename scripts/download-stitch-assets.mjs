import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const API_KEY = "AQ.Ab8RN6KAwhIfl4sO5_Aa-LhzTwVReTpdh0rxsxxPAY_LDfAbBQ";
const PROJECT_ID = "17297096438450244819";

const screens = [
  { index: 1, id: "196bd87aa0674e1d8f088fbb33342684", slug: "01_ypt_leaderboard" },
  { index: 2, id: "2a0899f309134863b9aedf3cb497329e", slug: "02_master_academic_homepage" },
  { index: 3, id: "7046a00475774dbf9197e830dd7fefaa", slug: "03_ypt_stats_calendar" },
  { index: 4, id: "7f1362e29f4540c6a750d47cd170b964", slug: "04_materials_library_vault" },
  { index: 5, id: "7fea337709d14729a0d7a1f8e8ffc49d", slug: "05_ypt_focus_timer" },
  { index: 6, id: "808a53a2844445d4b3d0625d392123a0", slug: "06_ypt_peer_rooms" },
  { index: 7, id: "89012a0cfd6e40818b9eb3178d701a37", slug: "07_design_specification_md" },
  { index: 8, id: "5c688b8186cc4dea8f7b3804b2e722e3", slug: "08_tests_mock_arena" },
  { index: 9, id: "aeb90025f67b42fbabf4d54d4afe198a", slug: "09_coaching_portals_gateway" },
  { index: 10, id: "8e662ca02b494b1396a38827056b0732", slug: "10_aspirant_community_codex" },
  { index: 11, id: "2c934dce5a4647f4bad5bd200b2e0b9a", slug: "11_support_direct_desk" },
  { index: 12, id: "3f303741e81c48fc9ce6f2fe1545da7a", slug: "12_donate_buy_chai" },
  { index: 13, id: "63548a653edc4d89b3f3a442b94d0bb9", slug: "13_aspirant_profile_dossier" },
  { index: 14, id: "3463549f292a4297a2f47829c7ba6427", slug: "14_ai_archival_mentor_drawer" },
  { index: 15, id: "3fa624e46fea45bd968a895076744b05", slug: "15_ai_mentor_emblem" }
];

const targetDir = path.resolve(".stitch/editorial_ink");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
}

async function main() {
  console.log(`Starting download for ${screens.length} Stitch screens into ${targetDir}...\n`);
  const manifest = [];

  for (const item of screens) {
    console.log(`--> [${item.index}/15] Screen ID: ${item.id} (${item.slug})`);
    const screenUrl = `https://stitch.googleapis.com/v1/projects/${PROJECT_ID}/screens/${item.id}`;
    const screenRes = await fetch(screenUrl, {
      headers: { "X-Goog-Api-Key": API_KEY }
    });

    if (!screenRes.ok) {
      console.error(`    FAILED to get screen metadata: ${screenRes.status}`);
      manifest.push({ ...item, status: "error", error: `${screenRes.status}` });
      continue;
    }

    const screenData = await screenRes.json();
    const title = screenData.title || item.slug;
    console.log(`    Title: "${title}"`);

    let imageFile = null;
    let codeFile = null;

    // 1. Download Screenshot if present
    if (screenData.screenshot?.downloadUrl) {
      const ext = screenData.screenshot.downloadUrl.includes("format=png") ? "png" : "png";
      const filename = `${item.slug}.png`;
      const filePath = path.join(targetDir, filename);
      console.log(`    Downloading image -> ${filename}...`);
      try {
        await downloadFile(screenData.screenshot.downloadUrl, filePath);
        const stats = fs.statSync(filePath);
        console.log(`    ✓ Image saved (${Math.round(stats.size / 1024)} KB)`);
        imageFile = filename;
      } catch (e) {
        console.error(`    ✗ Image download failed:`, e.message);
      }
    } else {
      console.log(`    ℹ No screenshot image URL present.`);
    }

    // 2. Download HTML / Code if present
    if (screenData.htmlCode?.downloadUrl) {
      const isMd = item.index === 7 || title.toLowerCase().endsWith(".md");
      const filename = `${item.slug}.${isMd ? "md" : "html"}`;
      const filePath = path.join(targetDir, filename);
      console.log(`    Downloading code -> ${filename}...`);
      try {
        await downloadFile(screenData.htmlCode.downloadUrl, filePath);
        const stats = fs.statSync(filePath);
        console.log(`    ✓ Code saved (${Math.round(stats.size / 1024)} KB)`);
        codeFile = filename;
      } catch (e) {
        console.error(`    ✗ Code download failed:`, e.message);
      }
    } else {
      console.log(`    ℹ No HTML/code download URL present.`);
    }

    manifest.push({
      index: item.index,
      id: item.id,
      slug: item.slug,
      title,
      deviceType: screenData.deviceType,
      imageFile,
      codeFile,
      prompt: screenData.prompt
    });

    console.log("");
  }

  // Write manifest JSON
  fs.writeFileSync(path.join(targetDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  // Write Index README
  let readme = `# Editorial Ink (Bookie Academic Journal) — Stitch Project Screens\n\n`;
  readme += `**Project ID:** \`${PROJECT_ID}\`\n`;
  readme += `**Source:** Google Stitch Design System Exploration\n`;
  readme += `**Style Authority:** Editorial Ink (Bookie Academic Journal)\n\n`;
  readme += `| # | Screen ID | Title | Image | Code / HTML |\n`;
  readme += `|---|---|---|---|---|\n`;

  for (const m of manifest) {
    const imgCell = m.imageFile ? `[\`${m.imageFile}\`](./${m.imageFile})` : `*None*`;
    const codeCell = m.codeFile ? `[\`${m.codeFile}\`](./${m.codeFile})` : `*None*`;
    readme += `| ${m.index} | \`${m.id}\` | **${m.title}** | ${imgCell} | ${codeCell} |\n`;
  }

  fs.writeFileSync(path.join(targetDir, "README.md"), readme);
  console.log(`✓ All 15 screens processed! Manifest & README generated at ${targetDir}`);
}

main().catch(console.error);
