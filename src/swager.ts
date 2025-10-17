
import path from "path";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import fs from "fs";

// Path to your swagger.json file
const swaggerFile = path.join(__dirname, "../swagger.json");
const swaggerData = fs.readFileSync(swaggerFile, "utf8");
const swaggerDocument = JSON.parse(swaggerData);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "JollofAI API Docs",
    customCss: `
      .swagger-ui .topbar { background-color: #f97316; }
      .swagger-ui .topbar-wrapper .link span { color: white !important; }
    `,
  }));

  console.log("✅ Swagger UI is available at http://localhost:5000/api-docs");
};




















// // src/swagger.ts
// import swaggerJSDoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';
// import YAML from "yamljs";
// import { Express } from 'express';



// const swaggerSpec  = YAML.load("./config/swagger.yaml");
  
// export const setupSwagger = (app: Express) => {
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// };
