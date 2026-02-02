const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// --- INITIAL SETUP ---

// Load environment variables from the .env file
dotenv.config();

// Establish the connection to the MongoDB database
connectDB();

// Initialize the Express application
const app = express();

// --- MIDDLEWARE ---

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from your frontend
app.use(cors());

// Enable the Express app to parse JSON formatted request bodies
app.use(express.json());

// --- API ROUTES ---

// A simple root route to confirm the server is running
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Use the route handlers we created for different API endpoints
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/generate', require('./routes/generateRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// --- START THE SERVER ---

// Get the port number from environment variables, defaulting to 5000
const PORT = process.env.PORT || 5000;

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

