import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let isConnected = false;
let mongoServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    console.log('✓ MongoDB already connected');
    return;
  }

  try {
    const NODE_ENV = process.env.NODE_ENV || 'development';
    let mongoUri: string;

    if (NODE_ENV === 'development') {
      // Use in-memory MongoDB for development
      console.log('🔧 Starting in-memory MongoDB for development...');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'swipehire',
        },
      });
      mongoUri = mongoServer.getUri();
      console.log('✓ In-memory MongoDB started');
    } else {
      // Use environment variable for production
      mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }
    }

    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    await mongoose.connect(mongoUri, options);
    isConnected = true;

    console.log('✓ MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        if (mongoServer) {
          await mongoServer.stop();
        }
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}

export function getConnectionState(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
