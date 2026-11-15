import express from "express";
import { analyze } from "./src/engine.js";

const app = express();
app.use(express.static("public"));

app.get("/api/analyze", async (req, res) => {
  const url = req.query.url;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
  } catch {
    return res.status(400).json({ error: "Please enter a valid http(s) URL" });
  }
  try {
    res.json(await analyze(url));
  } catch {
    res.status(500).json({ error: "Could not analyze this URL" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on http://localhost:${port}`));