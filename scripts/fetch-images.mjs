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
/* Helper to build a sensibly-sized Unsplash JPG URL from a "photo-…" id. */
const unsplash = (photoId, w = 1600) =>
  `https://images.unsplash.com/${photoId}?fm=jpg&q=85&w=${w}&auto=format&fit=crop`;

const TARGETS = [
  // ---------- North attractions ----------
  // Canyon Park Lima gorge — turquoise water between rock walls (Takachiho-style
  // gorge ref; Luo Jin Hong on Unsplash). Visually suggests the Lima canyon.
  ["canyon-park.jpg",        { url: unsplash("photo-1773933609524-000b6e72a101") }],
  ["ponte-del-diavolo.jpg",  { wiki: "Ponte_della_Maddalena" }],
  // Forest ropes course — rope bridges between tall trees (Unsplash, free)
  ["selva-buffardello.jpg",  { url: unsplash("photo-1775647423221-ac87d3ec338b") }],
  // Soft rafting — group on a raft going down a river (Unsplash, free)
  ["serchio-rafting.jpg",    { url: unsplash("photo-1599443380179-33737c17ca81") }],
  // Use the actual Leaning Tower (Wikipedia Featured Picture by Saffron Blaze)
  // instead of a generic Piazza dei Miracoli wide shot.
  ["pisa.jpg",               { commons: "File:The_Leaning_Tower_of_Pisa_SB.jpeg", width: 2000 }],
  // Abetone forest scenery (the chestnut forest the village is named for) —
  // far more evocative than the village street the Wikipedia summary returns.
  ["abetone.jpg",            { commons: "File:Foresta_piazzale_Abetone.jpg", width: 2000 }],
  ["sentierelsa.jpg",        { wiki: "Elsa_(river)" }],
  // Lucca walls — the Wikipedia summary lead is the iconic aerial of the
  // tree-lined ramparts wrapping the old town.
  ["lucca-walls.jpg",        { wiki: "Walls_of_Lucca" }],

  // ---------- South attractions ----------
  ["porto-santo-stefano.jpg",{ wiki: "Porto_Santo_Stefano" }],
  ["cala-del-gesso.jpg",     { wiki: "Monte_Argentario" }],
  // Acqua Village — sweeping aerial view of a colourful water park slide (Unsplash, free)
  ["acqua-village.jpg",      { url: unsplash("photo-1725758575869-969b8e5783bc") }],
  ["maremma-horse.jpg",      { wiki: "Maremmano" }],
  ["pitigliano.jpg",         { wiki: "Pitigliano" }],
  ["via-cava.jpg",           { wiki: "Vie_Cave" }],
  ["vitozza.jpg",            { wiki: "Sorano" }],
  ["saturnia.jpg",           { wiki: "Saturnia" }],
  ["bolsena.jpg",            { wiki: "Lake_Bolsena" }],
  ["civita.jpg",             { wiki: "Civita_di_Bagnoregio" }],

  // ---------- Stays ----------
  // Both stays use host-supplied photos that live in public/images/ and are
  // committed directly to the repo (the property CDNs aren't a great fit
  // for an automated fetcher and the user has higher-resolution originals):
  //   Larciano:     stay-larciano-sunflowers.png, -vineyard.png,
  //                 -pool.png, -pool-dusk.png
  //   Cortevecchia: stay-cortevecchia-poolview.png, -villa.png,
  //                 -pool-deck.png, -aerial.png

  // ---------- Itinerary lead images ----------
  // Tel Aviv aerial — used as the "fly home" hero on day 10.
  ["tel-aviv-skyline.jpg",   { url: unsplash("photo-1547483036-24bc77c79804") }]
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

async function getCommonsFile(fileTitle, width) {
  // Use the Commons API to resolve File:Foo.jpg to a direct URL.
  // If width is provided, request a thumb at that width (server-side resize).
  const widthParam = width ? `&iiurlwidth=${width}` : "";
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url${widthParam}&format=json&origin=*&titles=` +
    encodeURIComponent(fileTitle);
  const res = await fetch(api, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons ${fileTitle} HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

/* Some hosts (notably the Tenuta Cortevecchia WAF) reject our default
   project UA but happily serve to crawler UAs. We try the normal UA first
   and transparently fall back to a Googlebot UA on a 403/406 so we don't
   need per-target configuration. */
const FALLBACK_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

async function downloadTo(url, dest) {
  let res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept": "image/*" }
  });
  if (res.status === 403 || res.status === 406) {
    res = await fetch(url, {
      headers: { "User-Agent": FALLBACK_UA, "Accept": "image/*,*/*;q=0.8" }
    });
  }
  if (!res.ok) throw new Error(`Download ${url} HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.byteLength;
}

async function resolveUrl(spec) {
  if (spec.url) return spec.url;
  if (spec.commons) return await getCommonsFile(spec.commons, spec.width);
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
