// import dotenv from 'dotenv';
// dotenv.config()
import { setupSwagger } from './swager';
import "./jobs/vendorCron";

import app from './server';
import {connectDB} from '../config/connectDB'

import cron from 'node-cron';
import axios from 'axios';

// import crypto from 'crypto';

// // Random bytes → hex string
// const randomHex = crypto.randomBytes(16).toString("hex");
// console.log("Random Hex:", randomHex);

const PORT = process.env.PORT || 5000;


cron.schedule('*/1440 * * * *', async () => {
  try {
    const url = process.env.SERVER_URL!;
    await axios.get(url);
    console.log('Ping sent to:', url);
  } catch (err) {
    console.error('Ping failed', err);
  }
});


const startServer = async () => {
  try {
    // 1️⃣ Connect to MongoDB — wait for it!
    await connectDB(process.env.MONGO_URI!);

    // 2️⃣ Setup Swagger after DB OK
    setupSwagger(app);

    // 3️⃣ Start API server ONLY after DB success
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📘 Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

startServer();
