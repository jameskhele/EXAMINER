const mongoose = require('mongoose');

// Define the schema for the History collection
const historySchema = new mongoose.Schema({
  // Link to the user who generated this document. This is a reference to an ObjectId from the User collection.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Establishes a relationship with the User model
  },
  // The type of document that was generated (e.g., 'timetable', 'seating').
  type: {
    type: String,
    required: true,
    enum: ['timetable', 'seating', 'invigilators'], // Ensures the type is one of these values
  },
  // The actual generated data, stored as a flexible array of objects.
  data: {
    type: [mongoose.Schema.Types.Mixed],
    required: true,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Create and export the History model
const History = mongoose.model('History', historySchema);

module.exports = History;
