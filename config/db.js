const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://system:123@cluster0.3f6xqzx.mongodb.net/SewerManagerDB?retryWrites=true&w=majority';
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