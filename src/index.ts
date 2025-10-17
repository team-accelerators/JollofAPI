import { setupSwagger } from './swager';
import "./jobs/vendorCron";
import dotenv from 'dotenv';
import app from './server';
import {connectDB} from '../config/connectDB'

import cron from 'node-cron';
import axios from 'axios';

// import crypto from 'crypto';

// // Random bytes → hex string
// const randomHex = crypto.randomBytes(16).toString("hex");
// console.log("Random Hex:", randomHex);

const PORT = process.env.PORT || 5000;
dotenv.config()

cron.schedule('*/1440 * * * *', async () => {
  try {
    const url = process.env.SERVER_URL!;
    await axios.get(url);
    console.log('Ping sent to:', url);
  } catch (err) {
    console.error('Ping failed', err);
  }
});


const MONGO_URL = process.env.MONGO_URI
 const startServer  = async () => {
  try{
await connectDB(MONGO_URL!);
}catch (err){
  console.error('Failed to connect to MongoDB', err);
    process.exit(1);
}


}

startServer();

setupSwagger(app);
  
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Swagger docs at http://localhost:5000/api-docs');
});