// Offline build step: encrypt the plaintext bookings packet with the shared PIN.
//
//   node scripts/encrypt-bookings.mjs <plain.json> <PIN> src/data/bookings.enc.ts
//
// Produces AES-256-GCM ciphertext (PBKDF2-SHA256 key) as a committed .ts module
// that the app decrypts client-side once the PIN is entered. The PLAINTEXT and
// the PIN are inputs only — never commit them; keep the plaintext outside the
// repo (e.g. a scratch dir). Only the output ciphertext is safe to commit,
// because this is a public repo. See the build-trip-companion-app skill:
// "Sensitive info behind a shared PIN".
import crypto from "node:crypto";
import fs from "node:fs";

const [, , plainPath, pin, outPath] = process.argv;
if (!plainPath || !pin || !outPath) {
  console.error(
    "usage: node scripts/encrypt-bookings.mjs <plain.json> <PIN> <out.ts>"
  );
  process.exit(1);
}

const plaintext = fs.readFileSync(plainPath, "utf8");
JSON.parse(plaintext); // fail fast if the packet isn't valid JSON

const iterations = 250000;
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(pin, salt, iterations, 32, "sha256");

const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
const tag = cipher.getAuthTag();
const data = Buffer.concat([ct, tag]); // Web Crypto expects ciphertext||tag

const payload = {
  v: 1,
  iterations,
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  data: data.toString("base64")
};

const banner =
  "// AUTO-GENERATED — encrypted bookings packet. Do not edit by hand.\n" +
  "// Plaintext lives outside the repo; regenerate with scripts/encrypt-bookings.mjs.\n" +
  "// AES-256-GCM, PBKDF2-SHA256. Unlocked client-side by the shared PIN.\n";
const body =
  banner +
  'import type { BookingsCipher } from "../lib/bookingsCrypto";\n\n' +
  "export const bookingsCipher: BookingsCipher = " +
  JSON.stringify(payload, null, 2) +
  ";\n";

fs.writeFileSync(outPath, body, "utf8");
console.log("wrote", outPath, "(" + data.length + " bytes ciphertext)");
