import mongoose from "mongoose"

export const connectDB = async  (url:string) : Promise<typeof mongoose> => {

try {
  console.time('mongoose_connect');

  const connection =  mongoose.connect(url);
  console.timeEnd('mongoose_connect');
  console.log('🟢 Connected to MongoDB');
  return connection;
} catch (error) {
  console.error('🔴 MongoDB connection error:', error);
  throw error;
}
}

