# 🚀 Complete LMS Setup Guide

This guide will help you set up and run the full-stack Learning Management System.

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v17 or higher)
- npm or yarn

## 🗄️ Database Setup

### 1. Start PostgreSQL

Make sure PostgreSQL is running on your system.

### 2. Access PostgreSQL

```bash
/Library/PostgreSQL/17/bin/psql -U postgres -d lms_db
```

Password: `2504`

### 3. Verify Database

The database `lms_db` should already exist. If not, create it:

```sql
CREATE DATABASE lms_db;
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory

```bash
cd lms-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

The `.env` file should already be configured with:

```env
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=2h
DB_USER=postgres
DB_PASSWORD=2504
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
COOKIE_SECRET=mycookiekey
```

### 4. Start Backend Server

```bash
node index.js
```

The backend will:
- Connect to PostgreSQL
- Automatically create all required tables (users, courses, enrollments, lessons, etc.)
- Start listening on `http://localhost:3000`

You should see:
```
✅ Environment variables loaded
✅ Express + middleware initialized
⏳ Connecting to PostgreSQL...
✅ Connected to PostgreSQL database
🔄 Initializing database tables...
✅ Users table ready
✅ Courses table ready
✅ Enrollments table ready
... (more tables)
✨ All tables initialized successfully!
🚀 Server running at http://localhost:3000
```

## 🎨 Frontend Setup

### 1. Open New Terminal

Keep the backend running and open a new terminal.

### 2. Navigate to Frontend Directory

```bash
cd lms-frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 👤 Creating Test Users

### Method 1: Using the Register Page

1. Go to `http://localhost:5173`
2. Click "Sign up" or go to `/register`
3. Fill in the registration form
4. New users are created as **students** by default

### Method 2: Direct Database Insert

To create users with different roles, connect to PostgreSQL and run:

```sql
-- Create an Admin User
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin User', 'admin@lms.com', '$2b$10$YourHashedPasswordHere', 'admin');

-- Create an Instructor
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Instructor Name', 'instructor@lms.com', '$2b$10$YourHashedPasswordHere', 'instructor');

-- Create a Student (or use registration)
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Student Name', 'student@lms.com', '$2b$10$YourHashedPasswordHere', 'student');
```

**Note:** To generate a proper password hash, you can use the register endpoint or create a small script.

### Method 3: Quick Test User Script

Create a file `lms-backend/createTestUsers.js`:

```javascript
const bcrypt = require('bcrypt');
const pool = require('./db');

async function createTestUsers() {
  try {
    const password = await bcrypt.hash('password123', 10);
    
    // Admin
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Admin User', 'admin@lms.com', password, 'admin']
    );
    
    // Instructor
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['John Instructor', 'instructor@lms.com', password, 'instructor']
    );
    
    // Student
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Jane Student', 'student@lms.com', password, 'student']
    );
    
    console.log('✅ Test users created successfully!');
    console.log('Email: admin@lms.com | Password: password123');
    console.log('Email: instructor@lms.com | Password: password123');
    console.log('Email: student@lms.com | Password: password123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUsers();
```

Run it:
```bash
node createTestUsers.js
```

## 🎯 Testing the System

### 1. Login as Different Roles

**Student Login:**
- URL: `http://localhost:5173/login`
- Email: `student@lms.com`
- Password: `password123`
- Redirects to: `/student-dashboard`

**Instructor Login:**
- Email: `instructor@lms.com`
- Password: `password123`
- Redirects to: `/instructor-dashboard`

**Admin Login:**
- Email: `admin@lms.com`
- Password: `password123`
- Redirects to: `/admin-dashboard`

### 2. Test Instructor Features

1. Login as instructor
2. Click "Create Course" button
3. Fill in: Title, Description, Price
4. View your courses in the dashboard
5. Click on a course to see details

### 3. Test Student Features

1. Login as student
2. View recommended courses
3. Click on a course and enroll
4. View enrolled courses in your dashboard
5. Track your progress

### 4. Test Admin Features

1. Login as admin
2. View platform statistics
3. See all users and courses
4. Monitor pending course approvals

## 📊 Database Schema

The system automatically creates these tables:

- **users** - User accounts (students, instructors, admins)
- **courses** - Course information
- **enrollments** - Student course enrollments with progress
- **lessons** - Course lessons/modules
- **wishlist** - Student wishlists
- **cart** - Shopping cart items
- **assignments** - Course assignments
- **submissions** - Student assignment submissions
- **quizzes** - Course quizzes
- **achievements** - Student achievements
- **messages** - User messaging
- **ratings** - Course ratings and reviews
- **coupons** - Discount coupons
- **payouts** - Instructor payouts

## 🎨 Design Features

The LMS follows a modern, clean design with:

- **Color Palette:** Blue (#2563eb) primary, with teal/green accents
- **Typography:** Inter-like sans-serif font
- **Layout:** Responsive with sidebar navigation
- **Components:** Rounded corners (rounded-2xl), subtle shadows (shadow-md)
- **Spacing:** Consistent padding and margins
- **Hover Effects:** Smooth transitions on interactive elements

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Courses
- `GET /courses` - Get all courses (role-based)
- `POST /courses` - Create course (instructor/admin)
- `GET /courses/:id` - Get course details
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Enrollments
- `POST /enrollments` - Enroll in course
- `GET /enrollments` - Get enrollments (role-based)

### Dashboard Data
- `GET /student/dashboard-data` - Student dashboard data
- `GET /instructor/dashboard-data` - Instructor dashboard data
- `GET /admin/stats` - Admin statistics

### Users (Admin only)
- `GET /users` - Get all users
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure port 3000 is not in use

### Frontend won't connect to backend
- Verify backend is running on port 3000
- Check CORS settings in `lms-backend/index.js`
- Verify axios baseURL in `lms-frontend/src/api/axios.js`

### Database connection errors
- Test PostgreSQL connection:
  ```bash
  /Library/PostgreSQL/17/bin/psql -U postgres -d lms_db
  ```
- Verify password: `2504`
- Check database exists: `\l` in psql

### Login/Authentication issues
- Clear localStorage in browser dev tools
- Check JWT_SECRET in `.env`
- Verify password hashing in `auth.js`

## 📁 Project Structure

```
Code-lms/
├── lms-backend/
│   ├── index.js            # Main server file
│   ├── auth.js             # Authentication routes
│   ├── db.js               # Database connection
│   ├── initDb.js           # Database initialization
│   ├── .env                # Environment variables
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── routes/
│       ├── courses.js
│       ├── enrollments.js
│       ├── users.js
│       └── ... (other routes)
│
└── lms-frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Button.jsx
    │   │   ├── Modal.jsx
    │   │   └── ...
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   └── pages/
    │       ├── Auth/
    │       ├── Dashboard/
    │       └── CourseDetails.jsx
    └── package.json
```

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database `lms_db` exists
- [ ] Backend dependencies installed (`npm install` in lms-backend)
- [ ] Backend server running on port 3000
- [ ] All database tables created automatically
- [ ] Frontend dependencies installed (`npm install` in lms-frontend)
- [ ] Frontend running on port 5173
- [ ] Can access login page
- [ ] Can register a new user
- [ ] Can login and see appropriate dashboard
- [ ] Role-based access control working

## 🎓 Next Steps

1. **Add Sample Data** - Create courses, enroll students
2. **Test All Features** - Try creating courses, enrolling, viewing progress
3. **Customize Design** - Adjust colors, fonts, layouts as needed
4. **Add More Features** - Implement lessons, quizzes, assignments
5. **Deploy** - Prepare for production deployment

## 📞 Support

If you encounter any issues, check:
1. Console errors in browser developer tools
2. Backend terminal output for errors
3. PostgreSQL logs
4. Network tab in browser dev tools for API requests

---

**Happy Learning! 📚**
