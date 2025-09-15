# iqembulamanzi

## Overview

iqembulamanzi (meaning "clean water" in isiZulu) is a community-powered platform inspired by the SewerWatch SA project, designed to monitor and address sewer manhole failures and overflows in South African municipalities. It empowers citizens to report incidents easily via web forms (with future WhatsApp integration), verifies them through designated community guardians, and ensures municipal accountability with transparent tracking. The system prevents environmental pollution, protects public health, and optimizes resource allocation by capturing incident locations, sending automated notifications, and providing data-driven insights.

Built on Node.js and Express, the current implementation includes foundational user management (registration/login for citizens and guardians), incident reporting with location capture, and an automated notification feature that alerts guardians via Twilio (integrated with WhatsApp Business API) to verify incidents on-site. This fulfills the core automated feature: capturing incident locations and notifying guardians for real-time verification, all via Twilio.

The project addresses key issues: lack of proactive monitoring, inefficient reporting, opaque resolution processes, and data gaps in sewage loss. Stakeholders include communities (especially townships), environment, municipalities, and water treatment plants.

## Problem Statement

Sewer overflows lead to untreated sewage polluting rivers, causing health risks and environmental damage. Root causes:
- No systematic monitoring of manholes.
- Inefficient, untracked citizen reporting.
- Lack of accountability from report to resolution.
- Unmeasured sewage losses impacting planning.

Vision: A simple, accountable pathway from detection to resolution, starting with web-based reporting and evolving to AI-enhanced, multi-channel (WhatsApp/USSD) systems.

## Core Features

1. **User Management**: Secure registration and login for citizens, guardians, and officials using JWT authentication.
2. **Incident Reporting**: Citizens submit reports with location (lat/long) and details via `/user_form.html`; stored in MongoDB.
3. **Guardian Notification**: Automated feature captures incident location and sends instant notifications to designated guardians via Twilio/WhatsApp Business API, prompting on-site verification (e.g., "Verify if incident at [location] is real").
4. **Incident Tracking**: CRUD operations for incidents; status updates (reported, verified, resolved).
5. **Verification Workflow**: Guardians confirm authenticity, add photos/context; escalates to municipalities if needed.
6. **Basic Dashboard**: Static pages for user/incident lists; future React.js municipal portal with maps and analytics.

Recent Addition: The guardian notification feature enables real-time alerts, ensuring swift verification and closing the accountability loop.

Future Enhancements (Roadmap Phases):
- Phase 1 (Current): Core reporting, user auth, Twilio notifications.
- Phase 2: AI/ML triage (categorization, prioritization), multi-language NLP.
- Phase 3: Public dashboard (D3.js visualizations), environmental impact metrics (sewage loss calculations).
- Phase 4: Mobile app, fraud detection, multi-municipal scaling.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose (for users, incidents with geospatial data)
- **Authentication**: JWT, bcryptjs
- **Notifications**: Twilio (WhatsApp Business API, SMS fallback)
- **Frontend**: Static HTML/CSS/JS (public/); future React.js
- **Validation & Utils**: Custom validators, axios, body-parser, dotenv
- **Other**: PostGIS potential for advanced location queries

## Installation

1. Clone the repository: `git clone https://github.com/iqembulamanzi/backend.git` and `cd backend`.
2. Install dependencies: `npm install`.
3. Set up `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/iqembulamanzi
   JWT_SECRET=your_strong_secret_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=whatsapp:+your_twilio_whatsapp_number
   PORT=3000
   ```
4. Ensure MongoDB is running (e.g., `mongod`).
5. Start the server: `npm start` or `node server.js`.

## Usage

1. Run the server (see Installation).
2. Access via browser: `http://localhost:3000`.
3. Key Pages/Routes:
   - `/login.html`: User login.
   - `/user_form.html`: Register or report incident (include location).
   - `/users.html`: List users (authenticated).
   - API: POST `/api/incidents` (report with location → triggers guardian notification).
4. Workflow Example:
   - Citizen registers/logs in, reports incident.
   - System captures location, saves to DB.
   - Automated Twilio notification sent to guardian: "Incident reported at [lat,long]. Please verify."
   - Guardian verifies/updates via app (future: WhatsApp reply).
   - Status tracked for resolution.

Test Notifications: Ensure Twilio creds in `.env`; reports will send WhatsApp messages.

## Project Structure

```
.
├── app.js              # Express app config (middleware, routes)
├── server.js           # Entry point (connects DB, starts server)
├── package.json        # Scripts, deps (name: "iqembulamanzi")
├── .env                # Secrets (gitignore)
├── config/
│   └── db.js           # MongoDB connection
├── public/             # Static assets
│   ├── login.html
│   ├── user_form.html  # Incident report form
│   └── users.html
├── src/
│   ├── controllers/
│   │   ├── userController.js
│   │   └── incidentController.js  # Handles reports, notifications
│   ├── middleware/
│   │   └── auth.js     # JWT auth
│   ├── models/
│   │   ├── User.js     # Users (citizen/guardian roles)
│   │   └── Incident.js # Incidents (location, status)
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── incidentRoutes.js
│   ├── services/
│   │   ├── userService.js
│   │   └── incidentService.js  # Notification logic via Twilio
│   └── validators/
│       └── userValidator.js
```

## Running Tests

No tests implemented. Add Jest: `npm install --save-dev jest`, then `npm test`.

## Contributing

1. Fork and clone.
2. Create feature branch: `git checkout -b feat/your-feature`.
3. Commit: `git commit -m "feat: description"`.
4. Push and PR to `main`.

Focus on modularity, error handling, and SA context (e.g., offline support).

## License

MIT License

For full project vision, see the [SewerWatch SA Project Definition](path/to/doc.md) (KPIs, risks, architecture).