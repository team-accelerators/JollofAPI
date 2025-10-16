// scripts/copy-swagger.js
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "../src/docs/swagger");
const destDir = path.join(__dirname, "../dist/docs/swagger");

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stats = fs.statSync(srcPath);

    if (stats.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (stats.isFile() && item.endsWith(".json")) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${item}`);
    }
  }
}

copyDir(srcDir, destDir);
console.log("✨ Swagger JSON files copied successfully.");
