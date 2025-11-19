import express from "express";
import cors from "cors";
import { decryptWA } from "./src/decryptAudio.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/decrypt/audio", async (req, res) => {
  try {
    const { mediaKey, fileEncSha256, fileEnc } = req.body;

    if (!mediaKey || !fileEnc) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const audioBuffer = await decryptWA({
      mediaKey,
      fileEncSha256,
      fileEnc: Buffer.from(fileEnc, "base64"),
    });

    return res.json({
      success: true,
      audioBase64: audioBuffer.toString("base64")
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to decrypt audio" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Decryptor running on port ${port}`));
