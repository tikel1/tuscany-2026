// One-shot script: fetch a freely-licensed photo for each attraction & stay
// from Wikipedia / Wikimedia Commons and save into public/images/.
//
// Sources are CC-licensed (Wikimedia / Wikipedia) — safe for personal use
// and for an open repo.
//
// Run with:   node scripts/fetch-images.mjs

import { writeFile, mkdir, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "public", "images");

const UA =
  "Mozilla/5.0 (compatible; tuscany-2026/1.0; +https://github.com/tikel1)";

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

/**
 * For each filename:
 *   { wiki: "Article_Title" }                    -> use Wikipedia REST summary lead image
 *   { commons: "File:Some_File.jpg" }            -> direct Wikimedia Commons file
 *   { url: "https://..." }                       -> direct URL (already CC/PD)
 */
const TARGETS = [
  // ---------- North attractions ----------
  ["canyon-park.jpg",        { wiki: "Bagni_di_Lucca" }],
  ["ponte-del-diavolo.jpg",  { wiki: "Ponte_della_Maddalena" }],
  ["selva-buffardello.jpg",  { wiki: "Castelnuovo_di_Garfagnana" }],
  ["serchio-rafting.jpg",    { wiki: "Serchio" }],
  ["pisa.jpg",               { wiki: "Piazza_dei_Miracoli" }],
  ["abetone.jpg",            { wiki: "Abetone" }],
  ["sentierelsa.jpg",        { wiki: "Elsa_(river)" }],

  // ---------- South attractions ----------
  ["porto-santo-stefano.jpg",{ wiki: "Porto_Santo_Stefano" }],
  ["cala-del-gesso.jpg",     { wiki: "Monte_Argentario" }],
  ["acqua-village.jpg",      { wiki: "Follonica" }],
  ["maremma-horse.jpg",      { wiki: "Maremmano" }],
  ["pitigliano.jpg",         { wiki: "Pitigliano" }],
  ["via-cava.jpg",           { wiki: "Vie_Cave" }],
  ["vitozza.jpg",            { wiki: "Sorano" }],
  ["saturnia.jpg",           { wiki: "Saturnia" }],
  ["bolsena.jpg",            { wiki: "Lake_Bolsena" }],
  ["civita.jpg",             { wiki: "Civita_di_Bagnoregio" }],

  // ---------- Stays ----------
  ["stay-larciano.jpg",      { wiki: "Larciano" }],
  ["stay-cortevecchia.jpg",  { wiki: "Semproniano" }],
  ["stay-hellosky.jpg",      { wiki: "Leonardo_da_Vinci_International_Airport" }]
];

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Bump a Wikimedia thumbnail URL to a wider width (when possible). */
function widenThumb(url, target = 1200) {
  // Pattern:  /thumb/a/aa/Foo.jpg/320px-Foo.jpg  ->  /thumb/a/aa/Foo.jpg/1200px-Foo.jpg
  const m = url.match(/\/thumb\/(.+?)\/(\d+)px-([^/]+)$/);
  if (!m) return url;
  return url.replace(/\/(\d+)px-([^/]+)$/, `/${target}px-$2`);
}

async function getWikiLeadImage(title) {
  const api = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(api, { headers: { "User-Agent": UA, "Accept": "application/json" } });
  if (!res.ok) throw new Error(`Wiki summary ${title} HTTP ${res.status}`);
  const data = await res.json();
  const original = data.originalimage?.source;
  const thumb = data.thumbnail?.source;
  // Prefer original if it's not too huge; else widen the thumb
  if (original && (data.originalimage?.width ?? 0) <= 2400) return original;
  if (thumb) return widenThumb(thumb, 1200);
  if (original) return original;
  return null;
}

async function getCommonsFile(fileTitle) {
  // Use the Commons API to resolve File:Foo.jpg to a direct URL
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&format=json&origin=*&titles=` +
    encodeURIComponent(fileTitle);
  const res = await fetch(api, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons ${fileTitle} HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  return page?.imageinfo?.[0]?.url ?? null;
}

async function downloadTo(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept": "image/*" } });
  if (!res.ok) throw new Error(`Download ${url} HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.byteLength;
}

async function resolveUrl(spec) {
  if (spec.url) return spec.url;
  if (spec.commons) return await getCommonsFile(spec.commons);
  if (spec.wiki) return await getWikiLeadImage(spec.wiki);
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
      await new Promise(r => setTimeout(r, 250));
    } catch (e) {
      console.log(`! fail  ${name}  ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone.  saved=${ok}  skipped=${skip}  failed=${fail}`);
  console.log(`Note: failed entries fall back to the styled placeholder in the app.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
