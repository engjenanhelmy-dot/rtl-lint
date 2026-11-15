import express from "express";
import { analyze } from "./src/engine.js";
import { assertPublicUrl } from "./src/guard.js";

const app = express();
app.use(express.static("public"));

app.get("/api/analyze", async (req, res) => {
  const url = req.query.url;
  try {
    await assertPublicUrl(url);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Invalid URL" });
  }
  try {
    res.json(await analyze(url));
  } catch {
    res.status(500).json({ error: "Could not analyze this URL" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on http://localhost:${port}`));
