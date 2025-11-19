// WhatsApp Audio Decryption Core
// Fully compatible with Evolution API v2.3.6 + Baileys format

import crypto from 'crypto';

export function decryptWhatsAppAudio({ mediaKey, fileEnc, fileEncSha256 }) {
  if (!mediaKey || !fileEnc) {
    throw new Error("Missing parameters (mediaKey or fileEnc)");
  }

  const mediaKeyBuffer = Buffer.from(Object.values(mediaKey));
  const encryptedBuffer = Buffer.from(fileEnc, "base64");

  // Derivar chaves com HKDF (WhatsApp Audio Keys)
  const info = Buffer.from("WhatsApp Audio Keys");

  const expandedKey = crypto.hkdfSync(
    "sha256",
    Buffer.alloc(0),
    mediaKeyBuffer,
    info,
    80
  );

  const aesKey = expandedKey.subarray(0, 32);
  const iv = expandedKey.subarray(32, 48);

  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);

  let decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  decrypted = decrypted.subarray(0, decrypted.length - 10); // remove MAC

  return decrypted.toString("base64");
}
