# Backend Refactor Plan: Enhanced MVC Structure for Separation of Concerns

## Objective
Refactor the current basic MVC setup to achieve better modularity, code reuse, and separation of concerns. Currently, app.js contains mixed responsibilities (DB connection, middleware, routes, server start). We'll move:
- DB connection to `config/db.js` (config layer).
- App setup (middleware, routes) in `app.js` (export the app instance).
- Server start in a new `server.js` (entry point, awaits DB connect before listening).

This allows:
- Reusing the connected DB in controllers/models.
- Testing app without starting server.
- Environment-based configs (e.g., .env for URI).
- Easier maintenance and scaling.

## Proposed Structure
```
node_js_tutorial/
├── app.js (app setup: middleware, static, routes; export app)
├── server.js (import app, connect DB, start server)
├── config/
│   └── db.js (export async connectDB function with mongoose setup)
├── models/
│   └── User.js (schema and model, unchanged)
├── controllers/
│   └── userController.js (logic, update to use app.locals.dbName or connected instance)
├── routes/
│   └── userRoutes.js (endpoints, unchanged)
├── user_form.html (unchanged)
├── package.json (add 'start': 'node server.js' if needed)
└── .env (optional for URI)
```

## Step-by-Step Implementation

### 1. Create config/db.js
Export an async function to connect to MongoDB, log details, and set app.locals for DB name.

Code snippet:
```js
const mongoose = require('mongoose');

const connectDB = async (app) => {
  const mongoURI = process.env.MONGO_URI || 'mongodb+srv://system:123@cluster0.3f6xqzx.mongodb.net/Node_JS_TutorialDB?retryWrites=true&w=majority';
  console.log('Attempting connection to MongoDB URI:', mongoURI.replace(/\/\/.*@/, '//***:***@'));
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Connection readyState:', mongoose.connection.readyState); // 1 = connected
    app.locals.dbName = mongoose.connection.name;
    console.log('Collection for Users:', mongoose.connection.collections['users'] ? 'Exists' : 'Not yet created');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 2. Update app.js
- Remove DB connection.
- Keep middleware (express.urlencoded, json, static).
- Keep root GET '/' for HTML.
- Mount userRoutes.
- Export the app instance.

Code snippet:
```js
const express = require('express');
const path = require('path');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 2000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files like HTML

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'user_form.html'));
});

app.use(userRoutes);

module.exports = app;
```

### 3. Create server.js
- Import app and connectDB.
- Await connectDB(app).
- Start server on PORT.

Code snippet:
```js
const app = require('./app');
const connectDB = require('./config/db');
const PORT = 2000;

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
```

### 4. Update controllers/userController.js
- Use req.app.locals.dbName for logs (passed from app).
- No other changes needed, as mongoose is global after connect.

In submitUser and getUsers, replace 'req.app.locals.dbName || 'unknown'' with the passed value.

### 5. Optional: Add .env and dotenv
- Install dotenv: npm install dotenv
- In server.js: require('dotenv').config();
- Use process.env.MONGO_URI in db.js.

### 6. Update package.json
- Change "main": "server.js"
- Add "start": "node server.js"

### 7. Testing
- Run 'node server.js' (or 'npm start').
- Submit form: Check logs for connection, body parsing, save, verification.
- Verify data in /users and Compass.
- Ensure no errors, same functionality as before.

## Benefits
- **Modularity**: DB config reusable, app testable independently.
- **Separation**: Config (db.js), Setup (app.js), Entry (server.js).
- **Reusability**: connectDB can be used in tests or other apps.
- **Scalability**: Easy to add more configs (e.g., redis.js) or middleware files.

## Potential Risks
- Global mongoose: Models use it after connect; ensure connect before routes.
- Error handling: Add graceful shutdown on DB error.
- Environment: Use .env for production.

This plan achieves full separation while keeping the code simple and functional.