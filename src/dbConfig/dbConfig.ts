import mongoose from 'mongoose';

export async function connectToMongo() {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try{
    mongoose.connect(process.env.MONGODB_URI!)
    const connection = mongoose.connection;

    connection.on('connected', () => {
    })

    connection.on('error', (error) => {
      console.log("Error in connecting to MongoDB", + error);
      process.exit();
    })

  } catch (error){
    console.log("Something went wrong in connecting to MongoDB db");
    console.log(error);
  }
}