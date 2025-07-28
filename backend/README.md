# AttendAI Backend

Backend API for AttendAI - Face Detection Attendance System using Node.js, Express, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Then edit `.env` with your Supabase credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL="your-supabase-project-url"
   SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   CORS_ORIGIN="http://localhost:3000"
   ```

3. **Set up Supabase Database**
   - Create a new Supabase project
   - Go to SQL Editor in your Supabase dashboard
   - Run the SQL commands from `supabase-schema.sql`

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Request Examples

#### Register a Student
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "userType": "student",
    "collegeId": "college-uuid",
    "course": "Computer Science",
    "contact": "+1234567890"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "userType": "student"
  }'
```

## 🗄️ Database Schema

The database includes the following tables:
- `colleges` - College information
- `students` - Student profiles with face descriptors
- `teachers` - Teacher profiles
- `admins` - Admin profiles
- `subjects` - Course subjects
- `student_subjects` - Many-to-many relationship
- `attendance` - Attendance records
- `otp_requests` - OTP for password reset

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Project Structure
```
backend/
├── config/
│   └── supabase.js      # Supabase configuration
├── routes/
│   └── auth.js          # Authentication routes
├── server.js            # Main server file
├── supabase-schema.sql  # Database schema
├── package.json
└── README.md
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Row Level Security (RLS) enabled
- Input validation
- CORS configuration

## 🚀 Deployment

1. Set environment variables for production
2. Use `npm start` to run the production server
3. Consider using PM2 or similar process manager

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No (default: 7d) |
| `CORS_ORIGIN` | Allowed CORS origin | No (default: http://localhost:3000) | 