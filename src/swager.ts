

import swaggerUi from "swagger-ui-express";
import { Express } from "express";

 import swaggerDocument from "./docs/swagger";


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















