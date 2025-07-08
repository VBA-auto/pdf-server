import express from "express";
import { chromium } from "playwright";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3001;

// CORS setup
const allowedOrigins = ["http://localhost:3000", "https://preparationvae.fr"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Optional: Parse JSON body if needed
app.use(express.json());

app.get("/download", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing URL");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(1000); // small wait for animations etc.

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
    res.status(500).send("PDF generation failed: " + err.message);
  }
});

app.listen(port, () => {
  console.log(`✅ PDF server running at http://localhost:${port}`);
});
