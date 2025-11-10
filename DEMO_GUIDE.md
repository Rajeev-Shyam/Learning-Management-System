# 🎓 LMS Demo Guide - Quick Access Setup

## 🚀 System Ready!

Your Learning Management System is now configured for instant demo access. Both Login and Register pages feature **Quick Demo Access** buttons that allow you to instantly view different user perspectives without filling forms.

---

## 📍 Access Points

### Frontend Application
**URL:** http://localhost:5174

### Backend API
**URL:** http://localhost:3000

---

## 👥 Demo Users & Quick Access

### On Login Page (http://localhost:5174/login)
You'll see two Quick Demo Access buttons:

#### 👨‍🎓 **Student Demo**
- Click the **green "Student"** button
- Instantly access the Student Dashboard
- View enrolled courses and progress
- Browse recommended courses

#### 👨‍🏫 **Instructor Demo**
- Click the **purple "Instructor"** button
- Instantly access the Instructor Dashboard
- View your created courses
- See student enrollment statistics
- Check revenue analytics

### On Register Page (http://localhost:5174/register)
Same Quick Demo Access buttons available for instant testing.

---

## 🔐 Test User Credentials

If you need to manually log in:

### Student Account
```
Email: student@lms.com
Password: password123
```

### Instructor Account
```
Email: instructor@lms.com
Password: password123
```

### Admin Account
```
Email: admin@lms.com
Password: password123
```

---

## 🎨 Current Features

### ✅ Implemented Pages
- **Authentication**
  - Login with Quick Access
  - Register with Quick Access
  - JWT-based authentication
  - Role-based routing

- **Student Dashboard**
  - Enrolled courses display
  - Progress tracking
  - Recommended courses
  - Modern, responsive UI

- **Instructor Dashboard**
  - Course management
  - Student enrollment stats
  - Revenue overview
  - Course creation interface

- **Admin Dashboard**
  - Platform statistics
  - User management overview
  - Course approval system
  - Analytics dashboard

- **Additional Pages**
  - Home page
  - Courses browsing
  - Course details
  - 404 Not Found page

---

## 🗂️ Database Structure

### Tables Created (14 total)
1. **users** - User accounts and profiles
2. **courses** - Course information
3. **enrollments** - Student-course relationships
4. **lessons** - Course content
5. **wishlist** - Saved courses
6. **cart** - Shopping cart items
7. **assignments** - Course assignments
8. **submissions** - Student submissions
9. **quizzes** - Quiz questions and answers
10. **achievements** - Student achievements
11. **messages** - In-app messaging
12. **ratings** - Course ratings and reviews
13. **coupons** - Discount codes
14. **payouts** - Instructor payment tracking

---

## 🚦 How to Use the Demo

### Quick Start (Recommended)
1. Open http://localhost:5174
2. You'll land on the Login page
3. Click either:
   - **👨‍🎓 Student** button → See student experience
   - **👨‍🏫 Instructor** button → See instructor experience
4. Explore the dashboard!

### Traditional Login
1. Enter the email and password manually
2. Click "Sign In"
3. System redirects based on user role

### Try Different Roles
- Click "Logout" from any dashboard
- Click a different Quick Access button
- Experience the system from another perspective

---

## 🎯 What You Can Do

### As a Student 👨‍🎓
- ✅ View enrolled courses
- ✅ Track learning progress
- ✅ Browse course catalog
- ✅ See recommended courses
- ✅ Access course details

### As an Instructor 👨‍🏫
- ✅ View your courses
- ✅ See enrollment statistics
- ✅ Check revenue analytics
- ✅ Create new courses
- ✅ Monitor student progress

### As an Admin 👨‍💼
- ✅ View platform statistics
- ✅ Monitor user activity
- ✅ Approve/reject courses
- ✅ Manage users
- ✅ Track enrollments

---

## 🔧 Technical Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Port:** 5174

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** PostgreSQL 17
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Port:** 3000

---

##  Development

### Start Backend Server
```bash
cd lms-backend
npm start
```

### Start Frontend Server
```bash
cd lms-frontend
npm run dev
```

### Create More Test Users
```bash
cd lms-backend
node createTestUsers.js
```

### Check Database
```bash
cd lms-backend
node checkDb.js
```

---

## 🎨 UI/UX Features

- ✨ Modern gradient backgrounds
- 🎯 Clean, intuitive interfaces
- 📱 Responsive design
- 🌈 Color-coded user roles
- ⚡ Fast navigation
- 🔒 Secure authentication
- 💅 Professional styling with Tailwind CSS

---

## 🔮 Future Enhancements

Based on the Figma designs provided, the system can be expanded with:

**Phase 2-18 Features** (35+ additional pages):
- Password reset flow
- User profile pages
- Comprehensive settings system
- Community features
- Revenue dashboards with charts
- Advanced admin analytics
- Course moderation system
- Financial management
- Refund processing
- Instructor payouts
- Coupons management
- User management interface
- System health monitoring
- Real-time notifications
- File upload system
- In-app messaging
- Video player integration

---

## 📝 Notes

- Quick Access buttons are for **demo purposes only**
- For production, implement proper form validation
- All passwords are "password123" for test accounts
- Database is automatically initialized on backend startup
- CORS is configured for localhost development

---

## 🆘 Troubleshooting

### Backend Not Starting
```bash
cd lms-backend
npm install
npm start
```

### Frontend Not Starting
```bash
cd lms-frontend
npm install
npm run dev
```

### Database Connection Issues
- Ensure PostgreSQL is running
- Check .env file in lms-backend
- Default password: 2504
- Database name: lms_db

### Quick Access Buttons Not Working
- Ensure backend is running on port 3000
- Check browser console for errors
- Verify test users were created

---

## ✅ Demo Checklist

- [x] Backend server running (port 3000)
- [x] Frontend server running (port 5174)
- [x] PostgreSQL database connected
- [x] Test users created
- [x] Quick Access buttons added
- [x] Student dashboard functional
- [x] Instructor dashboard functional
- [x] Admin dashboard functional
- [x] Authentication working

---

## 🎉 Success!

Your LMS demo is ready! Open http://localhost:5174 and click any Quick Access button to start exploring.

**Enjoy testing your Learning Management System!** 🚀
