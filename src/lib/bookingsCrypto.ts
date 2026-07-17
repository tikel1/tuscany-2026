/**
 * Client-side decryption for the bookings packet.
 *
 * The sensitive booking logistics (references, order numbers, phones, prices)
 * ship as an AES-256-GCM ciphertext (see `src/data/bookings.enc.ts`), keyed off
 * a short PIN via PBKDF2. This is NOT strong security — a 4-digit PIN is
 * brute-forceable by anyone who obtains the ciphertext — but it keeps the data
 * out of plaintext in the public repo/bundle and behind a shared PIN. The plan
 * is: casual-privacy for a family trip, not a vault.
 *
 * Format produced by the build step (`scripts` / offline): base64 of
 *   salt (16B) | iv (12B) stored separately, data = ciphertext||GCM-tag.
 */

export interface BookingsCipher {
  v: number;
  iterations: number;
  salt: string; // base64
  iv: string; // base64
  data: string; // base64 (ciphertext concatenated with the 16-byte GCM tag)
}

function b64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

async function deriveKey(
  pin: string,
  salt: ArrayBuffer,
  iterations: number
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin).buffer as ArrayBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

/**
 * Attempt to decrypt the cipher with `pin`. Returns the parsed payload on
 * success, or `null` when the PIN is wrong (GCM auth-tag failure throws).
 */
export async function decryptBookings<T>(
  cipher: BookingsCipher,
  pin: string
): Promise<T | null> {
  try {
    const key = await deriveKey(pin, b64ToBuf(cipher.salt), cipher.iterations);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64ToBuf(cipher.iv) },
      key,
      b64ToBuf(cipher.data)
    );
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    return null;
  }
}
