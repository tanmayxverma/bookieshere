import fs from "node:fs";
import path from "node:path";

const targetDir = path.resolve(".stitch/unified_ui");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const screens = [
  {
    index: 1,
    id: "9783abe5b1554457a7d9278ceac5d95a",
    slug: "01_premium_web_experience",
    title: "BOOKIE - Premium Web Experience",
    stepFile: "C:/Users/HP/.gemini/antigravity-ide/brain/3fc49b2b-d5bf-4890-ad86-73134cd6147e/.system_generated/steps/40/output.txt",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AEtjO1WlZbEAldnOkBCKiUO4lGv12WTTo4psAk17S3ndAA8G1YfjBMor5VPe9nSNxq4mBY0082FYTIDg9HgdBtr0TrgwHLou6PcnUHkwf1iWUvnLuhygohLPatLt7O6P6dR-ST89M36OKqYFx9wKMcTDJDdzBjjXFWa5WHccdB-SO8K6VAB6NEUEJ9__5zCl1Gsh0pyX1M-95_e-omuHJsVV371JjzKSOze1n6qxhkkRmkH7F_QsoT6Iny6ogBSh"
  },
  {
    index: 2,
    id: "18bdb4fe8a544179a2d5a0b04e4705e0",
    slug: "02_materials_library",
    title: "BOOKIE - Materials Library (Web Experience)",
    stepFile: "C:/Users/HP/.gemini/antigravity-ide/brain/3fc49b2b-d5bf-4890-ad86-73134cd6147e/.system_generated/steps/42/output.txt",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AEtjO1XNMERdZPc-zIwONBMB1VoDYgZT15RSr6pbzvNMlbRIgg6UaKIXyuie0JzmiFRdjkOhRy4f9ZVWNMA9UHebyeUSjjIzq5OJmnLCya9x32RVlMyusi_5Ih1L2hexF-npmkocBwdVOr6fCL5vDW63CMBfHJL-MlAxuC-1cjII6bUxpBCzT9vchQsvX_sRZwboFGcrcaW8j7YFqzCVvK9NNyqEaH11RMvNY6-6Cm7HMSr-yXQZVm8RPO-_Uzay"
  },
  {
    index: 3,
    id: "7f21206e1d92476586ba3e1c17f5018c",
    slug: "03_test_series_hub",
    title: "BOOKIE - Test Series Hub",
    stepFile: "C:/Users/HP/.gemini/antigravity-ide/brain/3fc49b2b-d5bf-4890-ad86-73134cd6147e/.system_generated/steps/44/output.txt",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AEtjO1UYs2Q8JNnPg0RsavD-DtPY7ZhAYBQ4pppI-bF9TIw-H_2Pv-TrFragZtzwGZ60eYmUBWugqhcYnzljM1ijGDNtTHfFrNRxBY_7SQ7PWHsRu5RNSHOD_dcmQPM0rziFCuMPAYFM-_wY6z9hXTwdOwpCiALIAwyrRXizc3yKGWu3n7qbh12RlESy_0VcFuOzaSxAQ1PxYsbnx2Z-UfWO4RWsY0eqqLzvcNtBdxiOIonoa-IrCxsg7MN7Vg"
  },
  {
    index: 4,
    id: "5a48ea75aad74e56b26d93bd40ca2d52",
    slug: "04_aspirant_lounge",
    title: "BOOKIE - Aspirant Lounge (Community)",
    stepFile: "C:/Users/HP/.gemini/antigravity-ide/brain/3fc49b2b-d5bf-4890-ad86-73134cd6147e/.system_generated/steps/46/output.txt",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AEtjO1WBT-VC5kt5BCpCsYWQK08QoaCUUIhH3GPG4gfcSbelrcQ20A3NbQmxnqDrqqYueB23ttzFCZ190dKOeejkTzUWuaaRIQsA0G8oemYRYt8SDxM8Z6-0bdImQo1LzVUGUo8YjcD0VU6e1vFhFbrkCgAv3v0_6LB3iDHnA5SlgGaXJ0ntIrJxdTA3ekTSyNQfZ3mnZGV2inQCZe2UW58ZMBgZkVKXWOCi1n2_5LGhzgZl7hvt6uBIQFfqW2t1"
  },
  {
    index: 5,
    id: "3fe4f63d4e33434c93d51bbbcd7fbaff",
    slug: "05_typography_guidelines",
    title: "BOOKIE Typography Guidelines - Ruling Main Font",
    isMarkdown: true,
    screenshotUrl: null
  },
  {
    index: 6,
    id: "20d3924ee8854d7ab35d4cabffb747ee",
    slug: "06_direct_support_inbox",
    title: "BOOKIE - Direct 1v1 Support & Inbox",
    stepFile: "C:/Users/HP/.gemini/antigravity-ide/brain/3fc49b2b-d5bf-4890-ad86-73134cd6147e/.system_generated/steps/48/output.txt",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AEtjO1W5oiUtei9VZy9Aqfr75uKVyEhHAJ5SmoNGqC0W6Qd8MxOPg78Ud86iI8PadZDk_DJjr-bL45Us6TwA97scSjGKWO2HE0lgFnI4SBhsY0Xsa7HNDDNdzwPjLFbclQ-E_ei9C9IhqA46-fA3dtgwMoIUB8eXkWff7FvRGNg9yctu2MTodrez_hff0e2Z1zttBzAHj-WbzOwA5dnUdQx0VV61obARgvqojOBC5AnLbA6hu9l5tMIWG8IkmXI"
  },
  {
    index: 7,
    id: "68b7bd93e27544c8b173c827be1c149b",
    slug: "07_ultra_premium_navbar",
    title: "BOOKIE - Ultra-Premium Master Navigation Bar",
    stepFile: "C:/Users/HP/.gemini/antigravity-ide/brain/3fc49b2b-d5bf-4890-ad86-73134cd6147e/.system_generated/steps/50/output.txt",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AEtjO1UDlDu7TiSZi29CdeX9AQZ_AKEYBE5EoCCntexOSHnehAJzl8O1s-PMrNDfVfGJ8v-x1kWoxhn-d97dYs63Pikk_7dQ0nU6uRh3jUQythPzHslM42NLXjtslEMqVZGdhLGECMcjUlmw30u3PgDIJhpcButes4EA4bjhYWG_DetF3E-Eusu7X0U06bUM4NKPBCUo5WPzsP4d8xzVwy_w37ja9xk4phFyTrlpxWHarLM_n7hYkrt9uFdeeT6L"
  },
  {
    index: 8,
    id: "592b69144d7d4af3bdfddf3dbdb86c7d",
    slug: "08_ai_mobile_assistant",
    title: "BOOKIE - Bookie AI Mobile Assistant",
    stepFile: "C:/Users/HP/.gemini/antigravity-ide/brain/3fc49b2b-d5bf-4890-ad86-73134cd6147e/.system_generated/steps/52/output.txt",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AEtjO1WclTZe_o5eBaLXJ_M2O5h0rCF-yaVJ-t2VA85RjW9D4azEP_D59VdTiNVIvk80esIvwOwrf9L7iz7T5_nqkuGyWEXZi0O0Ib38wjz7wyo5iEFMolZ1abTl4ZgqfAWlpyQ4sBE0W-x7CJF5J6Mor436fS7X5xX8BmHiG42M47JIgP4B8_PJ9B1GbComkQW1JeXhGSXW--quKkXBL3R8Wf8KXtNv-KKM-VzejkRH87r3dVjygPU6PfLVSzzm"
  }
];

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const ab = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(ab));
}

async function main() {
  const manifest = [];

  for (const s of screens) {
    console.log(`Processing [${s.index}/8] ${s.title}...`);
    let codeContent = "";
    const ext = s.isMarkdown ? "md" : "html";
    const codeFileName = `${s.slug}.${ext}`;
    const codeFilePath = path.join(targetDir, codeFileName);

    if (s.stepFile && fs.existsSync(s.stepFile)) {
      const raw = fs.readFileSync(s.stepFile, "utf-8");
      try {
        const parsed = JSON.parse(raw);
        codeContent = parsed.html || parsed.code || "";
      } catch {
        codeContent = raw;
      }
      fs.writeFileSync(codeFilePath, codeContent);
      console.log(`  Saved code (${Math.round(codeContent.length / 1024)} KB) -> ${codeFileName}`);
    } else if (s.index === 5) {
      codeContent = `# Typography Specification & Style Guide\n\n## Project: BOOKIE Design System\n**Target Screen Reference:** BOOKIE - Premium Web Experience\n\n### Core Directive: The Ruling Main Font\n\nThe primary ruling font established across the headline hierarchy in BOOKIE - Premium Web Experience is **Syne** (specifically Syne 800/900 ExtraBold & Black).\n\nMoving forward, **Syne** is designated as the **Ruling Main Font** across the entire BOOKIE platform for:\n- All primary hero headlines (H1)\n- Major section headers (H2)\n- High-impact display numbers and metrics\n- Brand identity anchors and key campaign banners\n\n### Complete Multi-Font Typographic Hierarchy\n\n| Role | Font Family | Weights | Applied To | Design Purpose |\n| :--- | :--- | :--- | :--- | :--- |\n| **Ruling Main Font (Display & Headings)** | **Syne** | 800, 900 | Hero headlines, primary page titles, bold visual hooks | High-impact geometric weight, cutting-edge tech aura, bold presence |\n| **Secondary & UI Headings** | **Plus Jakarta Sans** | 700, 800 | Section headers, card titles, modal titles | Sharp, authoritative, modern neo-grotesque readability |\n| **Editorial & Human Voice** | **Newsreader** (Serif) | 400, 400 Italic | Subheaders, student quotes, relatable hostel wisdom | Warm, thoughtful, literary contrast |\n| **Technical & Telemetry Data** | **JetBrains Mono** | 500, 700 | Countdown timers, coupon codes, keyboard badges, test codes | Crisp, engineering precision for data and status tags |\n| **Universal Body Copy** | **Inter** | 400, 500 | Explanatory paragraphs, feature lists, meta descriptions | Neutral, high-legibility scanning with zero visual fatigue |\n`;
      fs.writeFileSync(codeFilePath, codeContent);
      console.log(`  Saved typography markdown -> ${codeFileName}`);
    }

    let imgFileName = null;
    if (s.screenshotUrl) {
      imgFileName = `${s.slug}.png`;
      const imgPath = path.join(targetDir, imgFileName);
      if (!fs.existsSync(imgPath)) {
        try {
          await downloadFile(s.screenshotUrl, imgPath);
          console.log(`  Downloaded screenshot -> ${imgFileName}`);
        } catch (e) {
          console.error(`  Failed screenshot download: ${e.message}`);
        }
      } else {
        console.log(`  Screenshot already exists -> ${imgFileName}`);
      }
    }

    manifest.push({
      index: s.index,
      id: s.id,
      title: s.title,
      slug: s.slug,
      codeFile: codeFileName,
      imageFile: imgFileName
    });
  }

  fs.writeFileSync(path.join(targetDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  let readme = `# Unified Page UI Redesign — Stitch Project\n\n`;
  readme += `**Project Title:** Unified Page UI Redesign\n`;
  readme += `**Project ID:** \`17283985692445407013\`\n\n`;
  readme += `| # | Screen ID | Title | Image | Code |\n`;
  readme += `|---|---|---|---|---|\n`;
  for (const m of manifest) {
    const imgStr = m.imageFile ? `[\`${m.imageFile}\`](./${m.imageFile})` : `*None*`;
    const codeStr = m.codeFile ? `[\`${m.codeFile}\`](./${m.codeFile})` : `*None*`;
    readme += `| ${m.index} | \`${m.id}\` | **${m.title}** | ${imgStr} | ${codeStr} |\n`;
  }
  fs.writeFileSync(path.join(targetDir, "README.md"), readme);
  console.log(`\nSuccessfully processed all 8 screens in ${targetDir}`);
}

main().catch(console.error);
