import express from "express";
import bodyParser from "body-parser";
import { decryptWhatsAppAudio } from "./decryptAudio.js";

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Cognus WhatsApp Media Decrypt API" });
});

app.post("/decrypt/audio", async (req, res) => {
  try {
    const { mediaKey, fileEnc } = req.body;

    const audioBase64 = decryptWhatsAppAudio({
      mediaKey,
      fileEnc
    });

    res.json({
      success: true,
      audio: audioBase64,
      mime: "audio/ogg"
    });
  } catch (e) {
    console.error("Decrypt error:", e);
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Decrypt API running on port", port));
