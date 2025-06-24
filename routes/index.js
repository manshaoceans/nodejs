const express = require('express');
const path = require('path');
const router = express.Router();
const puppeteer = require("puppeteer");
// Serve the index.html file for the root route
async function generatePdfFromHTML(html) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    // margin: {
    //   top: "0.5in",
    //   bottom: "0.5in",
    //   left: "0.5in",
    //   right: "0.5in"
    // }
  });

  await browser.close();
  return pdfBuffer;
}

router.post("/generate-pdf-from-html", async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: "HTML is required" });
    }

    console.log("Generating PDF for URL:", html);
    const pdf = await generatePdfFromHTML(html);

    // Set proper headers for PDF download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
      "Content-Length": pdf.length,
      "Cache-Control": "no-cache",
    });

    res.send(pdf);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Error generating PDF" });
  }
});

module.exports = router;
