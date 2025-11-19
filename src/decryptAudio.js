import crypto from "crypto";

export async function decryptWA({ mediaKey, fileEncSha256, fileEnc }) {

  const mk = Buffer.from(Object.values(mediaKey));

  const hkdf = crypto.hkdfSync(
    "sha256",
    Buffer.alloc(32, 0),
    mk,
    Buffer.from("WhatsApp Audio Keys"),
    80
  );

  const aesKey = hkdf.subarray(0, 32);
  const iv = hkdf.subarray(32, 48);

  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);
  let decrypted = Buffer.concat([decipher.update(fileEnc), decipher.final()]);

  decrypted = decrypted.subarray(0, decrypted.length - 10);

  return decrypted;
}
