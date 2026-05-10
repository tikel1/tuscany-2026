// Fetch freely-licensed food + wine photos for the Food & Wine section.
//
// Same approach as scripts/fetch-images.mjs — Wikipedia / Wikimedia Commons,
// gracefully falling back to the styled placeholder in the app when an
// image can't be located.
//
// Run with:   node scripts/fetch-food-wine-images.mjs

import { writeFile, mkdir, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "public", "images");

const UA =
  "Mozilla/5.0 (compatible; tuscany-2026/1.0; +https://github.com/tikel1)";
const FALLBACK_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* { wiki } -> Wikipedia REST summary lead image
   { commons } -> direct Wikimedia Commons File:
   { url } -> direct URL */
const TARGETS = [
  // ---------- DISHES ----------
  // Most have their own English Wikipedia article; the lead image is
  // almost always the dish itself, which is exactly what we want.
  ["food-pici.jpg",             { wiki: "Pici" }],
  ["food-pappardelle.jpg",      { wiki: "Pappardelle" }],
  ["food-tortelli.jpg",         { wiki: "Tortelli" }],
  ["food-ribollita.jpg",        { wiki: "Ribollita" }],
  ["food-pappa-pomodoro.jpg",   { wiki: "Pappa_al_pomodoro" }],
  ["food-bistecca.jpg",         { wiki: "Bistecca_alla_fiorentina" }],
  // Buglione di agnello has no en.wiki article — fall back to the
  // generic Italian "spezzatino" stew lead image.
  ["food-buglione.jpg",         { wiki: "Spezzatino" }],
  ["food-acquacotta.jpg",       { wiki: "Acquacotta" }],
  // No dedicated en.wiki article — use the closely related "alle vongole"
  // (clams), which visually maps to the seafood-tossed look of "scoglio".
  ["food-spaghetti-scoglio.jpg",{ wiki: "Spaghetti_alle_vongole" }],
  // Sfratto dei Goym (Pitigliano Jewish-quarter pastry) has no CC
  // photo we can reliably surface; the dish card uses the styled
  // placeholder. Re-enable here if a Commons file appears.
  // ["food-sfratto.jpg", { wiki: "Sfratti" }],
  ["food-castagnaccio.jpg",     { wiki: "Castagnaccio" }],
  ["food-necci.jpg",            { wiki: "Necci" }],
  ["food-cantucci.jpg",         { wiki: "Cantuccini" }],
  // The plain "Schiacciata" article picks a Sicilian variant; falling
  // back to the closely related "Focaccia" gives the right shape and
  // texture for what Tuscans actually serve.
  ["food-schiacciata.jpg",      { wiki: "Focaccia" }],
  ["food-lardo.jpg",            { wiki: "Lardo_di_Colonnata" }],

  // ---------- WINERIES ----------
  // Almost no individual estate has a Wikipedia article, so we use the
  // appellation / village article — a vineyard or village panorama is
  // visually relevant and credibly representative of the producer.
  ["wine-capezzana.jpg",        { wiki: "Carmignano_(wine)" }],
  // Bacchereto's en article is missing — use the comune of Carmignano,
  // which is the village it sits inside of.
  ["wine-bacchereto.jpg",       { wiki: "Carmignano" }],
  // No standalone Villa di Artimino article on en.wiki — use the
  // hamlet, which surfaces a panorama of the very same hilltop estate.
  ["wine-artimino.jpg",         { wiki: "Artimino" }],
  // No "Chianti Montalbano" article on en.wiki — use the parent
  // Chianti article instead.
  ["wine-petrognano.jpg",       { wiki: "Chianti" }],
  // The Morellino article's lead is a tiny grape map, not a vineyard —
  // use the Maremma article for a richer landscape image.
  ["wine-le-pupille.jpg",       { wiki: "Maremma" }],
  ["wine-roccapesta.jpg",       { wiki: "Scansano" }],
  ["wine-tenuta-ammiraglia.jpg",{ wiki: "Magliano_in_Toscana" }],
  // No image on the Bianco di Pitigliano article — fall back to the
  // village it's named after; the visual is unmistakable.
  ["wine-cantine-pitigliano.jpg",{ wiki: "Pitigliano" }],
  ["wine-sassotondo.jpg",       { wiki: "Sovana" }]
];

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function widenThumb(url, target = 1200) {
  const m = url.match(/\/thumb\/(.+?)\/(\d+)px-([^/]+)$/);
  if (!m) return url;
  return url.replace(/\/(\d+)px-([^/]+)$/, `/${target}px-$2`);
}

async function getWikiLeadImage(title) {
  const api = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(api, {
    headers: { "User-Agent": UA, Accept: "application/json" }
  });
  if (!res.ok) throw new Error(`Wiki summary ${title} HTTP ${res.status}`);
  const data = await res.json();
  const original = data.originalimage?.source;
  const thumb = data.thumbnail?.source;
  if (original && (data.originalimage?.width ?? 0) <= 2400) return original;
  if (thumb) return widenThumb(thumb, 1200);
  if (original) return original;
  return null;
}

async function getCommonsFile(fileTitle, width = 1200) {
  const widthParam = width ? `&iiurlwidth=${width}` : "";
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url${widthParam}&format=json&origin=*&titles=` +
    encodeURIComponent(fileTitle);
  const res = await fetch(api, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons ${fileTitle} HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  // missing pages on Commons return a -1 id; treat as not-found
  if (page?.missing !== undefined) return null;
  const info = page?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

async function downloadTo(url, dest) {
  let res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*" }
  });
  if (res.status === 403 || res.status === 406) {
    res = await fetch(url, {
      headers: { "User-Agent": FALLBACK_UA, Accept: "image/*,*/*;q=0.8" }
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
      await sleep(250);
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
