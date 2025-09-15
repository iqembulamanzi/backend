require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 2000;

const startServer = async () => {
  try {
    await connectDB(app);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();