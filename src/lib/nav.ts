export function navUrl(coords: [number, number], name?: string): string {
  const base = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;
  return name ? `${base}&destination_place_id=&travelmode=driving` : base;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
