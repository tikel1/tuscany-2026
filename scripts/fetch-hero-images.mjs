// One-shot script: fetch a curated set of beauty-shot photos for the Hero
// carousel. All sources are CC-licensed (Wikimedia Commons featured / quality
// pictures) with proper attribution provided in src/components/Hero.tsx.
//
// Run with:   node scripts/fetch-hero-images.mjs

import { writeFile, mkdir, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "public", "images", "hero");

const UA =
  "Mozilla/5.0 (compatible; tuscany-2026/1.0; +https://github.com/tikel1)";

// Each entry: [filename, { commons: "File:Xyz.jpg" } or { url: "..." }]
// All Commons targets are pulled at 2400 px wide (ample for a hero background)
const TARGETS = [
  // Iconic Val d'Orcia / Crete Senesi landscapes — the screensaver Tuscany
  [
    "val-dorcia-hills.jpg",
    { commons: "File:Endless_hills_of_Pienza1.jpg" }
  ],
  [
    "val-dorcia-lonely-tree.jpg",
    { commons: "File:Tuscan_landscape_with_lonely_tree.jpg" }
  ],
  [
    "crete-orcia-sunrise.jpg",
    { commons: "File:Sunrise_in_Crete_dell'Orcia.jpg" }
  ],
  [
    "tuscan-landscape-pano.jpg",
    { commons: "File:Tuscan_Landscape_6.JPG" }
  ],

  // Pitigliano & Sorano — the cliff cities we'll visit on Day 8
  [
    "pitigliano-panorama.jpg",
    {
      commons:
        "File:01665_ITA_Tuscany_Pitigliano_S_from_viewpoint_V-P.jpg"
    }
  ],
  [
    "sorano-blue-hour.jpg",
    {
      commons:
        "File:01844b_ITA_Tuscany_Sorano_blue_hour_3_to_1_V-P.jpg"
    }
  ],

  // Saturnia — the dawn pools (Day 9)
  [
    "saturnia-falls.jpg",
    {
      commons: "File:Terme_di_Saturnia_-_Cascate_del_Mulino-0518.jpg"
    }
  ],

  // Lake Bolsena — sunset over the volcanic lake (Day 9)
  [
    "bolsena-sunset.jpg",
    {
      commons: "File:Tramonto_sulle_sponde_del_lago_di_Bolsena.jpg"
    }
  ],

  // The signature cypress row at sunset — pure Tuscany
  [
    "cypresses-sunset.jpg",
    {
      commons: "File:Cipressi_di_S.Quirico_d'Orcia_al_tramonto.jpg"
    }
  ],

  // Maremma Regional Park aerial — the wild south coast we'll ride through
  [
    "maremma-aerial.jpg",
    {
      commons:
        "File:Toscana_-_Maremma_Regional_Park_-_aerial_photo_with_Torre_di_Collelungo.jpg"
    }
  ],

  // Tuscan coast at sunset — Castello del Boccale on the Livorno coast
  [
    "coast-sunset.jpg",
    { commons: "File:Tramonto_al_Castello_del_Boccale.jpg" }
  ]
];

const TARGET_WIDTH = 2400;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithRetry(url, opts = {}, tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, opts);
      if (res.status === 429 || res.status >= 500) {
        const wait = 1500 * Math.pow(2, i);
        console.log(`  retry ${i + 1}/${tries} after ${wait}ms (HTTP ${res.status})`);
        await sleep(wait);
        continue;
      }
      return res;
    } catch (e) {
      lastErr = e;
      const wait = 1500 * Math.pow(2, i);
      await sleep(wait);
    }
  }
  if (lastErr) throw lastErr;
  throw new Error(`gave up after ${tries} attempts: ${url}`);
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Use the Commons imageinfo API to ask for a JPEG thumbnail at the requested
 * width. Returns the thumb URL (or the original if no thumb is available).
 */
async function getCommonsThumb(fileTitle, width) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo` +
    `&iiprop=url&iiurlwidth=${width}&format=json&origin=*&titles=` +
    encodeURIComponent(fileTitle);
  const res = await fetchWithRetry(api, {
    headers: { "User-Agent": UA, Accept: "application/json" }
  });
  if (!res.ok) throw new Error(`Commons ${fileTitle} HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

async function downloadTo(url, dest) {
  const res = await fetchWithRetry(url, {
    headers: { "User-Agent": UA, Accept: "image/*" }
  });
  if (!res.ok) throw new Error(`Download ${url} HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.byteLength;
}

async function resolveUrl(spec) {
  if (spec.url) return spec.url;
  if (spec.commons) return await getCommonsThumb(spec.commons, TARGET_WIDTH);
  return null;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const [name, spec] of TARGETS) {
    const dest = resolve(OUT_DIR, name);
    if (await fileExists(dest)) {
      console.log(`= skip  ${name}  (already exists)`);
      skip++;
      continue;
    }
    try {
      const url = await resolveUrl(spec);
      if (!url) {
        console.log(`! miss  ${name}  (no image found for ${JSON.stringify(spec)})`);
        fail++;
        continue;
      }
      const bytes = await downloadTo(url, dest);
      console.log(`+ saved ${name}  ${(bytes / 1024).toFixed(0)} KB  <- ${url}`);
      ok++;
      // Be polite to Wikimedia
      await sleep(300);
    } catch (e) {
      console.log(`! fail  ${name}  ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone.  saved=${ok}  skipped=${skip}  failed=${fail}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
