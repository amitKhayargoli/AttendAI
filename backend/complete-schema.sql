-- Drop existing tables if they exist
DROP TABLE IF EXISTS class_attendance CASCADE;
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS colleges CASCADE;
DROP TABLE IF EXISTS otp_requests CASCADE;

-- Drop any existing indexes
DROP INDEX IF EXISTS idx_students_college_id;
DROP INDEX IF EXISTS idx_teachers_college_id;
DROP INDEX IF EXISTS idx_subjects_college_id;
DROP INDEX IF EXISTS idx_classes_subject_id;
DROP INDEX IF EXISTS idx_classes_teacher_id;
DROP INDEX IF EXISTS idx_classes_college_id;
DROP INDEX IF EXISTS idx_class_enrollments_class_id;
DROP INDEX IF EXISTS idx_class_enrollments_student_id;
DROP INDEX IF EXISTS idx_class_attendance_class_id;
DROP INDEX IF EXISTS idx_class_attendance_student_id;
DROP INDEX IF EXISTS idx_class_attendance_date;
DROP INDEX IF EXISTS idx_otp_requests_personal_email;
DROP INDEX IF EXISTS idx_otp_requests_expires_at;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create colleges table
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  personal_email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  course VARCHAR(255) NOT NULL,
  contact VARCHAR(20),
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  face_descriptor FLOAT[],
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  personal_email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  contact VARCHAR(20),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  level VARCHAR(50) NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  schedule_day VARCHAR(20) NOT NULL CHECK (schedule_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(50),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_enrollments table
CREATE TABLE class_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Create class_attendance table
CREATE TABLE class_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id, date)
);

-- Create OTP requests table
CREATE TABLE otp_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personal_email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_college_id ON students(college_id);
CREATE INDEX idx_teachers_college_id ON teachers(college_id);
CREATE INDEX idx_subjects_college_id ON subjects(college_id);
CREATE INDEX idx_classes_subject_id ON classes(subject_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_college_id ON classes(college_id);
CREATE INDEX idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX idx_class_attendance_class_id ON class_attendance(class_id);
CREATE INDEX idx_class_attendance_student_id ON class_attendance(student_id);
CREATE INDEX idx_class_attendance_date ON class_attendance(date);
CREATE INDEX idx_otp_requests_personal_email ON otp_requests(personal_email);
CREATE INDEX idx_otp_requests_expires_at ON otp_requests(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_requests ENABLE ROW LEVEL SECURITY; 