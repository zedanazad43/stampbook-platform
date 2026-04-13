#!/usr/bin/env node
/**
 * Build script for Stampbook Platform
 * - Ensures the public/ directory is ready for static deployment
 * - Writes a build manifest with version + timestamp
 * - Used by Cloudflare Pages, GitHub Pages, and Vercel deploy workflows
 */
"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT   = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

// 1. Make sure public/ exists
if (!fs.existsSync(PUBLIC)) {
  fs.mkdirSync(PUBLIC, { recursive: true });
}

// 2. Write build manifest (so deployments are traceable)
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const manifest = {
  name:       pkg.name,
  version:    pkg.version,
  buildTime:  new Date().toISOString(),
  commit:     process.env.GITHUB_SHA || "local"
};
fs.writeFileSync(
  path.join(PUBLIC, "build-manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log("✅  Build complete");
console.log("    version  :", manifest.version);
console.log("    buildTime:", manifest.buildTime);
console.log("    output   :", PUBLIC);
