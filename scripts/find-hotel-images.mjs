// One-shot: scrape image URLs from the actual hotel websites so we can
// pick a hero shot that matches what guests will really see.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const TARGETS = [
  "https://tenutacortevecchia.it/en/",
  "https://tenutacortevecchia.it/en/agriturismo-tuscany-pool/",
  "https://tenutacortevecchia.it/en/apartment-three-rooms/",
  "https://www.airbnb.com/rooms/1554711"
];

const RE = /(?:src|data-src|data-lazy-src|content)=["']([^"']*\.(?:jpg|jpeg|png|webp))/gi;

for (const url of TARGETS) {
  console.log(`\n=== ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    if (!res.ok) {
      console.log(`  HTTP ${res.status}`);
      continue;
    }
    const html = await res.text();
    const seen = new Set();
    let m;
    while ((m = RE.exec(html))) {
      let u = m[1];
      if (u.startsWith("//")) u = "https:" + u;
      if (u.startsWith("/")) u = new URL(u, url).toString();
      if (seen.has(u)) continue;
      // Skip tiny images, icons, sprites
      if (/icon|sprite|logo|favicon|placeholder|loader|spinner/i.test(u)) continue;
      seen.add(u);
      console.log("  " + u);
    }
    if (seen.size === 0) console.log("  (no images found)");
  } catch (e) {
    console.log("  ERR " + e.message);
  }
}
