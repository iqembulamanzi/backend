# iqembulamanzi

## Overview

HEAD
iqembulamanzi (meaning "team water" in isiZulu) is a community-powered platform inspired by the SewerWatch SA project, designed to monitor and address sewer manhole failures and overflows in South African municipalities. It empowers citizens to report incidents easily via web forms (with future WhatsApp integration), verifies them through designated community guardians, and ensures municipal accountability with transparent tracking. The system prevents environmental pollution, protects public health, and optimizes resource allocation by capturing incident locations, sending automated notifications, and providing data-driven insights.

Built on Node.js and Express, the current implementation includes foundational user management (registration/login for citizens and guardians), incident reporting with location capture, and an automated notification feature that alerts guardians via Twilio (integrated with WhatsApp Business API) to verify incidents on-site. This fulfills the core automated feature: capturing incident locations and notifying guardians for real-time verification, all via Twilio.
=======
iqembulamanzi (meaning "team water" in isiZulu) is a community-powered platform inspired by the SewerWatch SA project, designed to monitor and address sewer manhole failures and overflows in South African municipalities. It empowers citizens to report incidents easily via web forms and WhatsApp, verifies them through municipal managers and admins, and ensures accountability with transparent tracking. The system prevents environmental pollution, protects public health, and optimizes resource allocation by capturing incident locations, sending automated notifications to group members, and providing data-driven insights.

Built on Node.js and Express, the current implementation includes foundational user management (registration/login for citizens, managers, and admins), incident reporting with location capture and image validation, and an automated notification feature that broadcasts alerts to group members via Twilio (integrated with WhatsApp Business API) for awareness and verification. This fulfills the core automated feature: capturing incident locations and notifying group members for real-time awareness and follow-up, all via Twilio.
>>>>>>> jobcard

The project addresses key issues: lack of proactive monitoring, inefficient reporting, opaque resolution processes, and data gaps in sewage loss. Stakeholders include communities (especially townships), environment, municipalities, and water treatment plants.

## Problem Statement

Sewer overflows lead to untreated sewage polluting rivers, causing health risks and environmental damage. Root causes:
- No systematic monitoring of manholes.
- Inefficient, untracked citizen reporting.
- Lack of accountability from report to resolution.
- Unmeasured sewage losses impacting planning.

Vision: A simple, accountable pathway from detection to resolution, starting with web-based reporting and evolving to AI-enhanced, multi-channel (WhatsApp/USSD) systems.

## Core Features

<<<<<<< HEAD
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
=======
1. **User Management**: Secure registration and login for citizens, managers, and admins using JWT authentication.
2. **Team Management**: Maintenance teams with members, leaders, and specialized roles for different types of sewage infrastructure work.
3. **Incident Reporting**: Citizens submit reports with location (lat/long), images, and details via web forms or WhatsApp; stored in MongoDB with ML-based image validation.
4. **Group Notification**: Automated feature captures incident location and broadcasts instant notifications to group members via Twilio/WhatsApp Business API, enabling awareness and follow-up (e.g., "New incident reported at [location]").
5. **Incident Tracking**: CRUD operations for incidents; status updates (open, in_progress, verified, allocated, closed).
6. **Job-Card Allocation**: Clerks allocate verified incidents to maintenance teams, creating trackable job-cards with geolocation and priority.
7. **Verification Workflow**: Managers/Admins verify incidents on-site, update status and details; reporters are notified of verification and expected resolution timeline.
8. **Real-time Progress Tracking**: Teams update job-card status via mobile API; managers monitor progress in real-time.
9. **Basic Dashboard**: Static pages for user/incident/job-card lists; future React.js municipal portal with maps and analytics.

Recent Additions: Job-card allocation system enables complete workflow from incident detection through team assignment to resolution tracking. Teams can receive job-cards via mobile API and update progress with geolocation support.

Future Enhancements (Roadmap Phases):
- Phase 1 (Current): Core reporting, user auth, Twilio notifications, team management, job-card allocation.
- Phase 2: AI/ML triage (categorization, prioritization), multi-language NLP, mobile team app.
- Phase 3: Public dashboard (D3.js visualizations), environmental impact metrics (sewage loss calculations), real-time WebSocket updates.
- Phase 4: Advanced analytics, fraud detection, multi-municipal scaling, predictive maintenance.
>>>>>>> jobcard

## Technologies Used

- **Backend**: Node.js, Express.js
<<<<<<< HEAD
- **Database**: MongoDB with Mongoose (for users, incidents with geospatial data)
- **Authentication**: JWT, bcryptjs
- **Notifications**: Twilio (WhatsApp Business API, SMS fallback)
- **Frontend**: Static HTML/CSS/JS (public/); future React.js
- **Validation & Utils**: Custom validators, axios, body-parser, dotenv
- **Other**: PostGIS potential for advanced location queries
=======
- **Database**: MongoDB with Mongoose (for users, incidents, teams, job-cards with geospatial data)
- **Authentication**: JWT, bcryptjs
- **Notifications**: Twilio (WhatsApp Business API, SMS fallback)
- **Machine Learning**: TensorFlow/Keras for image classification (sewage detection)
- **Team Management**: Job-card allocation system with real-time status tracking
- **Frontend**: Static HTML/CSS/JS (public/); future React.js
- **Validation & Utils**: Custom validators, axios, body-parser, dotenv
- **Geocoding**: OpenStreetMap Nominatim API
- **Other**: Python subprocess for ML inference, geospatial queries for location-based operations
>>>>>>> jobcard

## Installation

1. Clone the repository: `git clone https://github.com/iqembulamanzi/backend.git` and `cd backend`.
2. Install dependencies: `npm install`.
3. Set up `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/iqembulamanzi
   JWT_SECRET=your_strong_secret_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
<<<<<<< HEAD
   TWILIO_PHONE_NUMBER=whatsapp:+your_twilio_whatsapp_number
   PORT=3000
=======
   TWILIO_WHATSAPP_FROM=whatsapp:+your_twilio_whatsapp_number
   PORT=2000
>>>>>>> jobcard
   ```
4. Ensure MongoDB is running (e.g., `mongod`).
5. Start the server: `npm start` or `node server.js`.

## Usage

1. Run the server (see Installation).
<<<<<<< HEAD
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
=======
2. Access via browser: `http://localhost:2000`.
3. Key Pages/Routes:
   - `/login.html`: User login.
   - `/user_form.html`: Register or report incident (include location and image).
   - `/users.html`: List users (authenticated).
   - WhatsApp: Send messages to Twilio number for incident reporting.
   - API Endpoints:
     - `POST /api/incidents` (report with location → triggers group notification)
     - `POST /api/job-cards/allocate` (allocate verified incidents to teams)
     - `GET /api/job-cards/team/:teamId` (teams receive assigned job-cards)
     - `PUT /api/job-cards/:id/status` (update job-card progress)
4. Complete Workflow Example:
   - Citizen registers/logs in, reports incident with image and location.
   - System validates image using ML, saves to DB with priority triage.
   - Automated Twilio notification broadcast to group members: "New incident reported at [location]".
   - Manager/Admin verifies incident on-site, updates status to 'verified'.
   - Clerk allocates verified incident to appropriate maintenance team, creating job-card.
   - Team receives job-card via mobile API with geolocation for navigation.
   - Team updates status as they work: assigned → in_progress → completed.
   - Manager monitors progress in real-time via dashboard.
   - Reporters notified of verification and resolution timeline.

Test Notifications: Ensure Twilio creds in `.env`; reports will send WhatsApp messages to group members.
Test Job-Cards: Create teams and users through the API or database for testing allocation workflow.
>>>>>>> jobcard

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
<<<<<<< HEAD
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
=======
│   │   ├── incidentController.js  # Handles reports, notifications
│   │   └── jobCardController.js   # Job-card allocation and tracking
│   ├── middleware/
│   │   └── auth.js     # JWT auth
│   ├── models/
│   │   ├── User.js        # Users (citizen/manager/admin roles)
│   │   ├── Incident.js    # Incidents (location, status, reporters)
│   │   ├── GroupMember.js # Notification group members
│   │   ├── Team.js        # Maintenance teams with members/leaders
│   │   └── JobCard.js     # Job-cards linking incidents to teams
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── incidentRoutes.js
│   │   └── jobCardRoutes.js # Job-card API endpoints
│   ├── services/
│   │   ├── userService.js
│   │   ├── incidentService.js     # Incident logic and geocoding
│   │   ├── notificationService.js # WhatsApp notifications
│   │   ├── imageAnalysisService.js # ML image validation
│   │   └── jobCardService.js      # Job-card business logic
│   └── validators/
│       └── userValidator.js
├── docs/
│   └── api.md          # Complete API documentation
>>>>>>> jobcard
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
