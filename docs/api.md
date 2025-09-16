# SewerWatch SA API Documentation

## Overview
The SewerWatch SA API is a RESTful backend service built with Node.js, Express.js, and MongoDB (via Mongoose). It manages user registration, authentication, and incident (ticket) reporting for sewer maintenance issues. Incidents can be reported via WhatsApp webhooks using Twilio, with support for text, media, and location sharing.

Key features:
- User management (Guardian, Manager, Admin roles) with geospatial location.
- Incident CRUD focused on sewage issues (categories: manhole_overflow, toilet_backup, pipe_burst, other).
- JWT-based authentication for protected routes.
- WhatsApp integration for public incident creation.
- Geospatial queries (2dsphere indexes on User and Incident locations).

**Base URL:** `http://localhost:2000` (development; update for staging/prod).

**Version:** 1.0.0 (initial).

**Headers:**
- `Content-Type: application/json` for JSON payloads.
- `Authorization: Bearer <token>` for protected routes (JWT from login).

**Error Responses:** Standard JSON `{ success: false, message: "Error description" }` with HTTP status (400, 401, 404, 500).

**Dependencies:** Mongoose, bcryptjs, jsonwebtoken, twilio, express-validator (inferred).

## Authentication
All protected routes require a JWT token in the `Authorization` header as `Bearer <token>`. Tokens expire in 24 hours.

### Login (Obtain Token)
- **Endpoint:** `POST /login`
- **Description:** Authenticate user and return JWT.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f...abc",
      "email": "user@example.com",
      "role": "Guardian"
    }
  }
  ```
- **Errors:**
  - 400: Validation failed (missing email/password).
  - 401: Invalid credentials.
  - 500: Server error.

### Register User
- **Endpoint:** `POST /submit`
- **Description:** Create a new user (Guardian by default).
- **Request Body:**
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+27123456789",
    "password": "password123",
    "role": "Guardian",
    "address": "123 Main St, Johannesburg",
    "lat": -26.2041,
    "lng": 28.0473
  }
  ```
  - `role`: Optional (Guardian/Manager/Admin; defaults to Guardian).
  - `lat`/`lng`: For location (Point [lng, lat]).
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Welcome, John! Your account has been created with role: Guardian."
  }
  ```
- **Errors:**
  - 400: Validation failed or duplicate email.
  - 500: Server error (e.g., DB save).

### Get All Users (Protected)
- **Endpoint:** `GET /users`
- **Description:** Fetch all users (excludes passwords).
- **Auth:** Required (JWT).
- **Response (200):**
  ```json
  [
    {
      "_id": "64f...abc",
      "userId": "USR001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+27123456789",
      "address": "123 Main St",
      "location": { "type": "Point", "coordinates": [28.0473, -26.2041] },
      "role": "Guardian",
      "createdAt": "2025-09-16T12:00:00.000Z"
    }
  ]
  ```
- **Errors:**
  - 401: No/invalid token.
  - 500: Fetch error.

## Incidents (Tickets)
Incidents represent sewer issues with geospatial data, media, and assignment to Guardians.

### User Model Schema (Reference)
```javascript
{
  userId: String (unique),
  first_name: String (req),
  last_name: String (req),
  email: String (unique, req),
  phone: String,
  address: String (req),
  location: { type: 'Point', coordinates: [Number, Number] } // [lng, lat]
  role: String (Guardian/Manager/Admin),
  password: String (req, hashed),
  createdAt: Date
}
```
- Index: `{ location: '2dsphere' }` for geospatial queries.

### Incident Model Schema (Reference)
```javascript
{
  reporters: [{
    phone: String (req),
    reportedAt: Date,
    description: String
  }],
  category: String (manhole_overflow/toilet_backup/pipe_burst/other; default: 'other'),
  priority: String (P0/P1/P2; default: 'P2'),
  status: String (open/in_progress/allocated/verified/closed; default: 'open'),
  location: { type: 'Point', coordinates: [Number, Number] } // [lng, lat]
  guardianAssigned: ObjectId (ref: 'Users'),
  verifiedBy: ObjectId (ref: 'Users'),
  mediaUrls: [String],
  sewageLossEstimate: Number (default: 0), // liters
  createdAt: Date,
  updatedAt: Date
}
```
- Index: `{ location: '2dsphere' }` for geospatial queries (deduplication, assignment).
- Reporters array supports multiple reports for same incident (deduplication by 10m radius).

### WhatsApp Webhook (Public - Alternative Handlers)
Two handlers for Twilio WhatsApp: `/api/incidents/webhook` (basic text/media) and `/whatsapp` (enhanced with location support). Both support deduplication (10m radius match for open incidents; appends reporter to existing).

#### Basic Webhook
- **Endpoint:** `POST /api/incidents/webhook`
- **Description:** Receive WhatsApp message, deduplicate/create incident, reply via TwiML.
- **Auth:** None (public).
- **Request Body:** Twilio form-encoded (e.g., `From=whatsapp:+27123456789&Body=Overflow at park&MediaUrl0=https://...`).
  - Headers: `X-Twilio-Signature` for validation.
- **Processing:** Validates signature, parses From/Body/MediaUrl0, checks for geo match, appends to existing or creates new with default category/location, replies with ID and match status.
- **Response:** XML TwiML (e.g., `<Response><Message>Added to existing ID: 64f... or Created new ID: 64f...</Message></Response>`).
- **Errors:** XML error message if invalid format.

#### Enhanced Webhook (Location Support)
- **Endpoint:** `POST /whatsapp`
- **Description:** Handles text, location shares, media; deduplicates/updates existing open incidents.
- **Auth:** None.
- **Request Body:** Twilio form-encoded.
  - `Body`: Message text.
  - `From`: Sender (whatsapp:+...).
  - `Latitude`/`Longitude`: For location shares.
  - `MediaUrl0`: Optional media.
- **Processing:**
  - If location shared: Find/update latest open incident for reporter phone or create new (dedup if geo match).
  - If text: Dedup/create incident, prompt for location.
  - Replies indicate new/existing and guide user.
- **Response:** XML TwiML with guidance/confirmation/ID and match status.
- **Errors:** XML error message.

### Get Open Incidents (Protected)
- **Endpoint:** `GET /api/incidents`
- **Description:** Fetch unresolved incidents (status != 'resolved').
- **Auth:** Required.
- **Query Params:** None (filters open in service).
- **Response (200):**
  ```json
  [
    {
      "_id": "64f...def",
      "reporterPhone": "+27123456789",
      "description": "Manhole overflow",
      "category": "manhole_overflow",
      "priority": "P1",
      "status": "open",
      "location": { "type": "Point", "coordinates": [28.0473, -26.2041] },
      "guardianAssigned": "64f...abc",
      "mediaUrls": ["https://..."],
      "sewageLossEstimate": 500,
      "createdAt": "2025-09-16T12:00:00.000Z",
      "updatedAt": "2025-09-16T12:10:00.000Z"
    }
  ]
  ```
- **Errors:**
  - 401: Unauthorized.
  - 500: Fetch error.

### Update Incident (Protected)
- **Endpoint:** `PUT /api/incidents/:id`
- **Description:** Update incident (e.g., status, assignment, location).
- **Auth:** Required.
- **Path Param:** `id` (Mongo ObjectId).
- **Request Body:**
  ```json
  {
    "status": "in_progress",
    "guardianAssigned": "64f...abc",
    "priority": "P0",
    "sewageLossEstimate": 1000,
    "location": { "type": "Point", "coordinates": [28.0473, -26.2041] }
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "incident": { ...updated incident... }
  }
  ```
- **Errors:**
  - 401: Unauthorized.
  - 404: Incident not found.
  - 500: Update error.

### Verify Incident (Protected - Guardian/Admin)
- **Endpoint:** `PUT /api/incidents/verify/:id`
- **Description:** Guardian verifies incident, sets status 'verified', updates precise location/description, notifies all reporters (72h resolution message).
- **Auth:** Required (Guardian/Admin role).
- **Path Param:** `id` (Mongo ObjectId).
- **Request Body:**
  ```json
  {
    "lat": -26.2041,
    "lng": 28.0473,
    "description": "Verified manhole overflow at precise location"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "incident": { ...verified incident with updated location, verifiedBy... }
  }
  ```
- **Processing:** Appends verifiedBy, triggers broadcast via Twilio WhatsApp to all reporters in array.
- **Errors:**
  - 401: Unauthorized.
  - 403: Insufficient role.
  - 404: Incident not found.
  - 400: Already verified.
  - 500: Update/notification error.

## Additional Notes
- **Geospatial Features:** Use MongoDB $geoNear/$geoWithin for location-based assignment (e.g., nearest Guardian).
- **Validation:** User/incident inputs validated (e.g., required fields, enums).
- **Security:** Passwords hashed (bcrypt); JWT secret in `.env`. Webhook validates Twilio signature.
- **Enhancements Implemented:** Multi-reporter deduplication (10m geo radius), reporters array, Guardian verification with notifications.
- **Future:** POST /api/incidents for direct creation, GET /api/incidents/:id, DELETE, NLP (Dialogflow), advanced notifications.
- **Testing:** Use Postman/Swagger. Local: `npm start` (assumes server.js runs app).
- **Environment:** MongoDB URI in `.env` (MONGO_URI); Twilio creds (TWILIO_ACCOUNT_SID, etc.).

For full code, see `src/` (models, controllers, services, routes). Contact for OpenAPI/Swagger integration.



Summary

Authentication
POST /login → Authenticate user and return JWT.
POST /submit → Register a new user (Guardian by default).

Users
GET /users → Fetch all users (protected).

Incidents
POST /api/incidents/webhook → Basic WhatsApp webhook (dedup, text/media).
POST /whatsapp → Enhanced WhatsApp webhook (dedup, text/location/media).
GET /api/incidents → Get open/unresolved incidents (protected).
PUT /api/incidents/:id → Update an incident (protected).
PUT /api/incidents/verify/:id → Verify incident (Guardian/Admin, protected).
