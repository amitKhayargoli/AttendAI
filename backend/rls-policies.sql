-- RLS Policies for AttendAI Database

-- Colleges table policies
CREATE POLICY "Enable read access for all users" ON colleges FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON colleges FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON colleges FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON colleges FOR DELETE USING (true);

-- Admins table policies
CREATE POLICY "Enable read access for all users" ON admins FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON admins FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON admins FOR DELETE USING (true);

-- Students table policies
CREATE POLICY "Enable read access for all users" ON students FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON students FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON students FOR DELETE USING (true);

-- Teachers table policies
CREATE POLICY "Enable read access for all users" ON teachers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON teachers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON teachers FOR DELETE USING (true);

-- Subjects table policies
CREATE POLICY "Enable read access for all users" ON subjects FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON subjects FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON subjects FOR DELETE USING (true);

-- Student_subjects table policies
CREATE POLICY "Enable read access for all users" ON student_subjects FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON student_subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON student_subjects FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON student_subjects FOR DELETE USING (true);

-- Attendance table policies
CREATE POLICY "Enable read access for all users" ON attendance FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON attendance FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON attendance FOR DELETE USING (true);

-- OTP requests table policies
CREATE POLICY "Enable read access for all users" ON otp_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON otp_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON otp_requests FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON otp_requests FOR DELETE USING (true); 