import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json({ limit: "50mb" }));

// Helper to turn {0:123,1:45,...} into Buffer
const bufferFromIntObj = (obj) => Buffer.from(Object.values(obj));

const WHATSAPP_INFO = {
  audio: "WhatsApp Audio Keys",
};

function deriveKeys(mediaKey, type = "audio") {
  return crypto.hkdfSync(
    "sha256",
    Buffer.alloc(0),
    mediaKey,
    WHATSAPP_INFO[type],
    80
  );
}

function decryptMedia(mediaKey, encFileBuffer) {
  const expandedKey = deriveKeys(mediaKey);

  const aesKey = expandedKey.subarray(0, 32);
  const iv = expandedKey.subarray(32, 48);

  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);
  let decrypted = Buffer.concat([
    decipher.update(encFileBuffer),
    decipher.final(),
  ]);

  // Remove last 10 bytes (MAC)
  return decrypted.subarray(0, decrypted.length - 10);
}

app.post("/decrypt/audio", async (req, res) => {
  try {
    const { mediaKey, encryptedFileBase64 } = req.body;

    if (!mediaKey || !encryptedFileBase64) {
      return res.status(400).json({
        error: "mediaKey and encryptedFileBase64 are required",
      });
    }

    const mediaKeyBuffer = bufferFromIntObj(mediaKey);
    const encryptedBuffer = Buffer.from(encryptedFileBase64, "base64");

    const decrypted = decryptMedia(mediaKeyBuffer, encryptedBuffer);

    return res.json({
      success: true,
      mimeType: "audio/ogg",
      audioBase64: decrypted.toString("base64"),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: "Failed to decrypt",
      details: e.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Decrypt service running on port 3000");
});
