# iqembulamanzi - Citizen Incident Reporting System

![GitHub last commit](https://img.shields.io/github/last-commit/iqembulamanzi/backend)
![GitHub repo size](https://img.shields.io/github/repo-size/iqembulamanzi/backend)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Overview

**iqembulamanzi** (meaning "team water" in isiZulu) is a community-powered platform designed to monitor and address sewer manhole failures and overflows in South African municipalities. The system empowers citizens to report incidents, facilitates verification through municipal managers and admins, and ensures accountability with transparent tracking.

The platform prevents environmental pollution, protects public health, and optimizes resource allocation by capturing incident locations, sending automated notifications, and providing data-driven insights for municipal management.

## 🌟 Key Features

### Core Functionality
- **User Management**: Secure registration and login for citizens, managers, and admins using JWT authentication
- **Team Management**: Maintenance teams with members, leaders, and specialized roles for different types of infrastructure work
- **Incident Reporting**: Citizens submit reports with location (lat/long), images, and details via web forms
- **Group Notification**: Automated Twilio/WhatsApp Business API notifications to group members for awareness and verification
- **Incident Tracking**: Complete CRUD operations with status updates (open, in_progress, verified, allocated, closed)
- **Job-Card Allocation**: Complete workflow from incident detection through team assignment to resolution tracking

### Advanced Features
- **ML Image Validation**: TensorFlow/Keras integration for sewage detection and incident validation
- **Real-time Progress Tracking**: Teams update job-card status via mobile API with geolocation support
- **Multi-channel Reporting**: Support for web forms and WhatsApp integration
- **Geospatial Operations**: Location-based queries and operations using MongoDB geospatial features

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose (geospatial data support)
- **Authentication**: JWT, bcryptjs
- **Notifications**: Twilio (WhatsApp Business API, SMS fallback)
- **Machine Learning**: TensorFlow/Keras for image classification
- **Frontend**: Static HTML/CSS/JS with future React.js integration
- **Geocoding**: OpenStreetMap Nominatim API
- **Validation**: Custom validators with comprehensive error handling

## 📁 Project Structure

```
├── app.js                    # Express application configuration
├── server.js                 # Application entry point
├── package.json              # Project dependencies and scripts
├── .env                      # Environment variables (excluded from git)
├── .env.example              # Environment template
├── .gitignore               # Git ignore patterns
├── config/
│   └── db.js                # MongoDB connection configuration
├── public/                   # Static frontend files
│   ├── login.html           # User authentication page
│   ├── user_form.html       # Incident reporting form
│   └── users.html           # User management interface
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── incidentController.js    # Incident management logic
│   │   ├── jobCardController.js     # Job-card allocation system
│   │   └── userController.js        # User management operations
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/              # Data models
│   │   ├── Incident.js      # Incident records with geospatial data
│   │   ├── JobCard.js       # Job-card assignments and tracking
│   │   ├── Team.js          # Maintenance teams structure
│   │   └── User.js          # User accounts with role-based access
│   ├── routes/              # API endpoint definitions
│   │   ├── incidentRoutes.js    # Incident management endpoints
│   │   ├── jobCardRoutes.js     # Job-card system endpoints
│   │   └── userRoutes.js        # User management endpoints
│   ├── services/            # Business logic services
│   │   ├── imageAnalysisService.js  # ML image validation
│   │   ├── incidentService.js      # Incident processing logic
│   │   ├── jobCardService.js       # Job-card management
│   │   └── userService.js          # User operations
│   └── validators/
│       └── userValidator.js    # Input validation logic
└── docs/                    # Documentation files
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/iqembulamanzi/backend.git
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/iqembulamanzi
   JWT_SECRET=your_strong_secret_key_here
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+your_twilio_whatsapp_number
   PORT=2000
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   npm start
   # or
   node server.js
   ```

## 📱 Usage Guide

### Access Points
- **Web Interface**: `http://localhost:2000`
- **Login Page**: `/login.html`
- **Incident Reporting**: `/user_form.html`
- **User Management**: `/users.html` (authenticated users only)

### API Endpoints

#### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User authentication
- `GET /api/users` - List all users (admin only)

#### Incident Management
- `POST /api/incidents` - Report new incident
- `GET /api/incidents` - List incidents
- `PUT /api/incidents/:id` - Update incident status
- `DELETE /api/incidents/:id` - Remove incident

#### Job-Card System
- `POST /api/job-cards/allocate` - Allocate incident to team
- `GET /api/job-cards/team/:teamId` - Get team assignments
- `PUT /api/job-cards/:id/status` - Update job-card progress

### Workflow Example

1. **Citizen Reporting**
   - User registers/logs in
   - Reports incident with image and location via web form
   - System validates image using ML and saves to database

2. **Notification & Verification**
   - Automated WhatsApp notification sent to group members
   - Manager/Admin verifies incident on-site
   - Status updated to 'verified'

3. **Job-Card Allocation**
   - Clerk allocates verified incident to maintenance team
   - Job-card created with geolocation for navigation
   - Team receives assignment via mobile API

4. **Progress Tracking**
   - Team updates status: assigned → in_progress → completed
   - Manager monitors progress in real-time
   - Reporters notified of verification and resolution timeline

## 🔧 Development

### Testing Notifications
- Ensure Twilio credentials are configured in `.env`
- Report incidents to test WhatsApp group notifications

### Job-Card Testing
- Create teams and users through API or database
- Test allocation workflow with realistic scenarios

### ML Image Validation
- ML models are stored in `ml/models/` directory
- Image analysis service validates incident authenticity
- Supports various image formats for sewage detection

## 🛡️ Security Features

- JWT-based authentication with secure token management
- Role-based access control (citizen, manager, admin)
- Input validation and sanitization
- Password hashing with bcrypt
- CORS configuration for API security

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core reporting functionality
- ✅ User authentication system
- ✅ Twilio WhatsApp notifications
- ✅ Team management system
- ✅ Job-card allocation workflow

### Phase 2 (Planned)
- AI/ML triage and categorization
- Multi-language NLP support
- Mobile team application
- Enhanced geolocation features

### Phase 3 (Future)
- Public dashboard with D3.js visualizations
- Environmental impact metrics
- Real-time WebSocket updates
- Advanced analytics

### Phase 4 (Long-term)
- Advanced fraud detection
- Multi-municipal scaling
- Predictive maintenance algorithms
- IoT sensor integration

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add new feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Submit a pull request

### Development Guidelines
- Follow existing code style and conventions
- Add appropriate error handling
- Include documentation for new features
- Ensure responsive design for mobile compatibility
- Consider South African context and offline support needs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌐 Contact & Support

- **Repository**: [https://github.com/iqembulamanzi/backend](https://github.com/iqembulamanzi/backend)
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Documentation**: Check the `/docs` folder for detailed API documentation

## 🙏 Acknowledgments

- Inspired by the SewerWatch SA project
- Built for South African municipalities
- Community-driven development approach
- Focus on environmental protection and public health

---

**Made with ❤️ for cleaner, safer communities in South Africa**
