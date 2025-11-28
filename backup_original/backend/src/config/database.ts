import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  // Use MONGO_URI from .env
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn("⚠️ MONGO_URI missing — running WITHOUT database");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Do NOT throw — allow server to continue running
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});
