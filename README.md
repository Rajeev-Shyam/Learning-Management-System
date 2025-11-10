# LMS Platform - Full-Stack Learning Management System

A complete Learning Management System built with React, Node.js, Express, and PostgreSQL.

##Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Instructor, Admin)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### Student Dashboard
- View enrolled courses with progress tracking
- Progress bars showing completion percentage
- Course details with lessons and resources
- Statistics: Total courses, completed, in-progress, average progress

### Instructor Dashboard
- Create and manage courses
- View student enrollments per course
- Track course ratings and performance
- Revenue tracking
- Course approval status monitoring

### Admin Dashboard
- Platform-wide statistics
- User management (view all users by role)
- Course approval/rejection system
- Monitor total enrollments, pending approvals
- Comprehensive analytics

### Database Features
- Auto-initialization of all required tables
- Full relational database schema with foreign keys
- Support for courses, lessons, enrollments, progress tracking
- Extended features: wishlist, cart, assignments, quizzes, achievements, messages, ratings, coupons, payouts

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd Code-lms
```

### 2. Backend Setup

```bash
cd lms-backend
npm install
```

Create a `.env` file in the `lms-backend` directory:
```env
PORT=3000
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=lms_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

### 3. Frontend Setup

```bash
cd lms-frontend
npm install
```

## Running the Application

### Start Backend (Terminal 1)
```bash
cd lms-backend
node index.js
```

The backend will:
- Connect to PostgreSQL
- Auto-create all database tables
- Start on http://localhost:3000

### Start Frontend (Terminal 2)
```bash
cd lms-frontend
npm run dev
```

The frontend will start on http://localhost:5173

## Database Schema

The application automatically creates the following tables:

### Core Tables
- **users**: User accounts with roles (student, instructor, admin)
- **courses**: Course information with instructor details
- **enrollments**: Student course enrollments with progress tracking
- **lessons**: Course lessons with content and videos
- **lesson_progress**: Individual lesson completion tracking

### Extended Tables
- **wishlist**: Student course wishlists
- **cart**: Shopping cart for course purchases
- **assignments**: Course assignments
- **submissions**: Student assignment submissions
- **quizzes**: Course quizzes
- **quiz_attempts**: Student quiz attempts
- **achievements**: Student achievements and badges
- **messages**: User messaging system
- **ratings**: Course ratings and reviews
- **coupons**: Discount coupons
- **payouts**: Instructor payout tracking

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## Project Structure

```
Code-lms/
├── lms-backend/
│   ├── index.js              # Main server file
│   ├── db.js                 # Database connection
│   ├── initDb.js             # Database schema initialization
│   ├── auth.js               # Authentication routes
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification
│   └── routes/
│       ├── courses.js
│       ├── enrollments.js
│       ├── users.js
│       └── [other routes...]
│
└── lms-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── CourseCard.jsx
    │   │   ├── StatCard.jsx
    │   │   ├── ProgressBar.jsx
    │   │   ├── Table.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   ├── Dashboard/
    │   │   │   ├── StudentDashboard.jsx
    │   │   │   ├── InstructorDashboard.jsx
    │   │   │   └── AdminDashboard.jsx
    │   │   ├── Home.jsx
    │   │   └── Courses.jsx
    │   ├── api/
    │   │   └── axios.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Courses
- `GET /courses` - Get courses (role-based)
- `POST /courses` - Create course (instructor/admin)
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `PATCH /courses/:id/status` - Approve/reject course (admin)

### Enrollments
- `GET /enrollments` - Get enrollments
- `POST /enrollments` - Enroll in course

### Users (Admin)
- `GET /users` - Get all users
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Dashboard Data
- `GET /admin/stats` - Admin statistics
- `GET /student/dashboard-data` - Student dashboard data
- `GET /instructor/dashboard-data` - Instructor dashboard data

## Default Users

After setup, you can create users through the registration page:
- **Students** - Can enroll in courses and track progress
- **Instructors** - Can create and manage courses
- **Admins** - Can manage all users and approve courses

## UI Design

The application features a modern, clean design with:
- Responsive layout for mobile, tablet, and desktop
- Consistent color palette (blue, green, purple, orange accent colors)
- Clean typography with Inter font family
- Smooth transitions and hover effects
- Professional shadows and borders
- Intuitive navigation with sidebar and navbar

## Data Flow

1. **User Registration/Login** → JWT token stored in localStorage
2. **Dashboard Access** → Role-based routing to appropriate dashboard
3. **Data Fetching** → Axios with Bearer token authentication
4. **Real-time Updates** → Dashboard data refreshed on actions

## Development Notes

- All database tables are created automatically on first run
- JWT tokens expire based on JWT_EXPIRES_IN setting
- Frontend uses TailwindCSS utility classes for consistent styling
- Backend uses proper error handling and validation
- CORS is enabled for local development

## Future Enhancements

- Course content creation (lessons, videos)
- Real-time notifications
- Payment integration
- Advanced analytics
- Course ratings and reviews UI
- Message center
- Assignment submission interface
- Quiz taking interface

## Contributors

Rajeev Shyam Kumar, OneYesInfotech Technical team

## Support

For issues and questions, please open an issue on the repository.
