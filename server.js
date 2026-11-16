import express from "express";
import rateLimit from "express-rate-limit";
import { analyze } from "./src/engine.js";
import { assertPublicUrl } from "./src/guard.js";

const app = express();
app.set("trust proxy", 1);
app.use(express.static("public"));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a minute and try again." },
});

let running = 0;
const MAX_CONCURRENT = 2;

app.get("/api/analyze", limiter, async (req, res) => {
  const url = req.query.url;
  try {
    await assertPublicUrl(url);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Invalid URL" });
  }
  if (running >= MAX_CONCURRENT) {
    return res
      .status(503)
      .json({ error: "Server is busy. Please try again in a few seconds." });
  }
  running++;
  try {
    res.json(await analyze(url));
  } catch {
    res.status(500).json({ error: "Could not analyze this URL" });
  } finally {
    running--;
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on http://localhost:${port}`));
