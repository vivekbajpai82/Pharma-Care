# 🏥 Pharma Care - Digital Prescription Management System

A comprehensive web application for doctors to create, manage, and share digital prescriptions with patients. Built with modern web technologies for seamless prescription generation and distribution.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Known Issues](#known-issues)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### For Doctors
- **User Authentication**: Secure signup/login with JWT tokens
- **Profile Management**: Update professional details, speciality, and hospital affiliation
- **Digital Prescription Creation**: Generate professional prescriptions with patient details
- **Medicine Database**: Comprehensive medicine categories and dosage information
- **PDF Generation**: Download prescriptions as PDF documents
- **Prescription History**: View and manage all created prescriptions
- **Multi-language Support**: Switch between English and Hindi
- **Statistics Dashboard**: Track medicine usage and prescription analytics

### Patient Features
- **Email Delivery**: Receive prescriptions via email (when configured)
- **WhatsApp Sharing**: Share prescriptions directly through WhatsApp
- **PDF Download**: Save prescriptions for pharmacy reference

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **jsPDF** - PDF generation
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **Resend API** - Email service (optional)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas account)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pharma-care.git
cd pharma-care
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🔐 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (Optional - Resend)
# Note: Requires domain verification for production
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev

# Alternative: Gmail SMTP (Works locally, blocked on some hosting platforms)
# EMAIL_USER=your_gmail@gmail.com
# EMAIL_PASS=your_gmail_app_password
```

### Frontend (.env)

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
```

## 🏃 Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run server
```

Backend will run on `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Start Backend in Production

```bash
cd backend
npm start
```

## 🌐 Deployment

### Backend Deployment (Render)

1. Create account on [Render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Add all backend environment variables

### Frontend Deployment (Netlify)

1. Create account on [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure:
   - **Base Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variables**: Add `VITE_API_URL` with your deployed backend URL

### Important Deployment Notes

#### Email Service Configuration

**Development (Local)**
- Gmail SMTP works with app passwords
- Resend free tier: emails only to registered account

**Production (Deployed)**
- **Gmail SMTP**: Blocked on Render free tier (port 587/465 blocked)
- **Resend API**: Requires domain verification to send to any email
- **Alternative**: Use Railway.app (allows SMTP ports) or verify a custom domain

**Current Limitation**: Email features work locally but require domain verification for production deployment.

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: multipart/form-data

Body:
- name: string (required)
- email: string (required)
- password: string (required)
- speciality: string (optional)
- registrationNumber: string (optional)
- profileImage: file (optional)
```

#### Login
```http
POST /api/login
Content-Type: application/json

Body:
{
  "email": "doctor@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/auth
Headers:
  x-auth-token: your_jwt_token
```

#### Forgot Password
```http
POST /api/forgot-password
Content-Type: application/json

Body:
{
  "email": "doctor@example.com"
}
```

#### Reset Password
```http
POST /api/reset-password/:resetToken
Content-Type: application/json

Body:
{
  "password": "newpassword123"
}
```

### Prescription Endpoints

#### Create Prescription
```http
POST /api/prescriptions
Headers:
  x-auth-token: your_jwt_token
Content-Type: application/json

Body:
{
  "patientDetails": {
    "name": "Patient Name",
    "age": 35,
    "gender": "Male",
    "weight": 70,
    "bloodPressure": "120/80",
    "medication": "Diabetes",
    "additionalInstructions": "Take after meals",
    "nextVisit": "2025-11-01"
  },
  "medicines": [
    {
      "name": "Medicine Name",
      "dosage": "1-0-1 after meals",
      "category": "Analgesics"
    }
  ],
  "recipientEmail": "patient@example.com",
  "recipientName": "Patient Name"
}
```

#### Get All Prescriptions
```http
GET /api/prescriptions
Headers:
  x-auth-token: your_jwt_token
```

#### Get Single Prescription
```http
GET /api/prescriptions/:id
Headers:
  x-auth-token: your_jwt_token
```

#### Delete Prescription
```http
DELETE /api/prescriptions/:id
Headers:
  x-auth-token: your_jwt_token
```

### Medicine Endpoints

#### Get All Medicines
```http
GET /api/medicines
```

#### Get Medicine Categories
```http
GET /api/medicines/categories
```

## 📁 Project Structure

```
pharma-care/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── upload.js          # Cloudinary upload
│   ├── models/
│   │   ├── User.js            # Doctor user model
│   │   ├── Prescription.js    # Prescription model
│   │   ├── Medicine.js        # Medicine model
│   │   └── DoctorStats.js     # Statistics model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── prescriptions.js   # Prescription routes
│   │   └── medicines.js       # Medicine routes
│   ├── seeders/
│   │   └── medicineSeeder.js  # Seed medicine database
│   ├── utils/
│   │   └── emailService.js    # Email functionality
│   ├── .env                   # Environment variables
│   ├── server.js              # Express server
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/        # Reusable components
    │   ├── pages/            # Page components
    │   ├── context/          # React Context
    │   ├── utils/            # Helper functions
    │   ├── App.jsx           # Main app component
    │   └── main.jsx          # Entry point
    ├── .env                  # Environment variables
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## ⚠️ Known Issues

### Email Service Limitations

**Issue**: Email delivery not working in production deployment
- **Cause**: Render free tier blocks SMTP ports (587, 465)
- **Workaround**: 
  - Local development: Use Gmail SMTP with app password
  - Production: Either verify a custom domain with Resend or migrate backend to Railway.app
- **Status**: Optional feature - core prescription functionality works without email

### Solutions in Progress
- Making email delivery optional (prescriptions save successfully even if email fails)
- Implementing alternative sharing methods (WhatsApp, PDF download)

## 🔮 Future Enhancements

- [ ] Domain verification for production email delivery
- [ ] SMS notifications using Twilio
- [ ] Patient portal for viewing prescriptions
- [ ] Prescription templates for common conditions
- [ ] Medicine interaction checker
- [ ] Appointment scheduling
- [ ] Billing and invoice generation
- [ ] Multi-doctor clinic support
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Vivek Bajpai** - Initial work - [GitHub Profile](https://github.com/vivekbajpai82)

## 📞 Support

For support, email bajpaivivek82@gmail.com or create an issue in the repository.

## 🙏 Acknowledgments

- Medicine database compiled from various medical sources
- UI design inspired by modern healthcare applications
- Special thanks to the open-source community

---

**Note**: This is a portfolio/educational project. For production medical use, ensure compliance with local healthcare regulations (HIPAA, etc.) and consult with legal advisors.
