import fs from "fs";
import path from "path";
import { OpenAPIV3 } from "openapi-types";

const swaggerDir = path.join(__dirname);

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

// Merge all JSON route files
fs.readdirSync(swaggerDir)
  .filter((file) => file.endsWith(".json"))
  .forEach((file) => {
    const filePath = path.join(swaggerDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    Object.assign(swaggerBase.paths, content.paths);
  });

export default swaggerBase;
