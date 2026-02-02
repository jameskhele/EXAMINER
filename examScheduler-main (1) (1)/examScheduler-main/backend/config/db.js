const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Establishes a connection to the MongoDB database using the connection string
 * from the environment variables.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB cluster
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log a success message to the console if the connection is successful
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log any errors that occur during the connection attempt and exit the process
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
