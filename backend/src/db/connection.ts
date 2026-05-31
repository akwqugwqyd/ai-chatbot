import mongoose, { connect, disconnect } from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;
mongoose.set("bufferCommands", false);

async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }

    if (connectionPromise) {
      return connectionPromise;
    }

    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL is not configured");
    }

    connectionPromise = connect(mongoUrl, {
      serverSelectionTimeoutMS: 10000,
    });

    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    console.log(error);
    throw new Error("Could not Connect To MongoDB");
  }
}
  
async function disconnectFromDatabase() {
  try {
    await disconnect();
  } catch (error) {
    console.log(error);
    throw new Error("Could not Disconnect From MongoDB");
  }
}

export { connectToDatabase, disconnectFromDatabase };
