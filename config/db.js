/**
 * Database Configuration
 *
 * Handles MongoDB connection using Mongoose.
 * Provides connection logging and error handling.
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the provided URI or default connection string.
 * Logs connection details and exits on failure.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://iqembulamanzi_db_user:123@cluster0.q13u1o1.mongodb.net/SewerManagerDB?retryWrites=true&w=majority';
  console.log('Attempting connection to MongoDB URI:', mongoURI.replace(/\/\/.*@/, '//***:***@'));
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Connection readyState:', mongoose.connection.readyState); // 1 = connected
    console.log('Collection for Users:', mongoose.connection.collections['users'] ? 'Exists' : 'Not yet created');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;