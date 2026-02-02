const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema for the User collection
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Each email must be unique
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// --- Password Hashing Middleware ---
// Before a new user document is saved, automatically hash the password
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Password Comparison Method ---
// Add a method to the user schema to compare an entered password with the stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
