import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import fs from "node:fs";

const url = process.argv[2] || "http://localhost:4173";

const chrome = await launch({
  chromeFlags: ["--headless", "--no-sandbox"],
});

try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: ["html", "json"],
    logLevel: "info",
    onlyCategories: [
      "performance",
      "accessibility",
      "best-practices",
      "seo",
    ],
  });

  if (!result) {
    throw new Error("Lighthouse did not return a report.");
  }

  const report = result.report;
  const reports = Array.isArray(report) ? report : [report];

  fs.writeFileSync(
    "lighthouse-report.html",
    reports[0]
  );

  const jsonReport = reports.find(
    (item) => item.trimStart().startsWith("{")
  );

  if (jsonReport) {
    fs.writeFileSync("lighthouse-report.json", jsonReport);
  }

  console.log("Lighthouse audit completed.");
  console.log("HTML report: lighthouse-report.html");
  console.log("JSON report: lighthouse-report.json");
} finally {
  await chrome.kill();
}
