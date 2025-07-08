import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*", // production e specific domain use koro
  })
);

app.get("/download", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing URL");

  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, 2000);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=fiche.pdf",
      "Content-Length": pdf.length,
    });

    res.send(pdf);
  } catch (err) {
    await browser.close();
    console.error("❌ PDF generation failed:", err.message);
    res.status(500).send("PDF generation failed: " + err.message);
  }
});

app.listen(port, () => {
  console.log(`✅ PDF server running at http://localhost:${port}`);
});
