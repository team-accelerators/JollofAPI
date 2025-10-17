import fs from "fs";
import path from "path";
import { OpenAPIV3 } from "openapi-types";

const swaggerDir = __dirname

const swaggerBase: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "JollofAI Backend API",
    version: "1.0.0",
    description:
      "API documentation for JollofAI — an AI cooking and lifestyle assistant."
  },
  servers: [
    { url: "http://localhost:5000/api", description: "Local Server" },
    { url: "https://jollofai.onrender.com/api", description: "Production Server" }
  ],
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    }
  },
  security: [{ BearerAuth: [] }],
  paths: {},
  tags: []
};


// Merge all JSON route files safely
fs.readdirSync(swaggerDir)
  .filter((file) => file.endsWith(".json"))
  .forEach((file) => {
    const filePath = path.join(swaggerDir, file);

    try {
      const raw = fs.readFileSync(filePath, "utf-8").trim();

      // skip empty files
      if (!raw) {
        console.warn(`⚠️ Skipping empty file: ${file}`);
        return;
      }

      // parse JSON
      const content = JSON.parse(raw);

      if (content.paths && typeof content.paths === "object") {
        Object.assign(swaggerBase.paths, content.paths);
        console.log(`✅ Merged: ${file}`);
      } else {
        console.warn(`⚠️ No 'paths' key in: ${file}`);
      }
    } catch (err: any) {
      console.error(`❌ Failed to parse ${file}: ${err.message}`);
    }
  });

export default swaggerBase;
