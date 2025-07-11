const mongoose = require('mongoose');
const dotenv = require('dotenv')
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected ✅');
  } catch (error) {
    console.error('MongoDB connection failed ❌', error);
    process.exit(1); 
  }
};

module.exports = connectDB;
