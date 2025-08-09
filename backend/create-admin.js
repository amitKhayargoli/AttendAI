require('dotenv').config();
const supabase = require('./config/supabase');
const bcrypt = require('bcryptjs');

async function createInitialData() {
  try {
    console.log('🚀 Setting up initial data for AttendAI...\n');

    // 1. Create a college
    console.log('1️⃣ Creating college...');
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .insert([
        {
          name: 'AttendAI University',
          domain: 'attendai.edu'
        }
      ])
      .select()
      .single();

    if (collegeError) {
      console.error('❌ Error creating college:', collegeError);
      return;
    }

    console.log('✅ College created:', college.name);
    console.log('   ID:', college.id);

    // 2. Create admin account
    console.log('\n2️⃣ Creating admin account...');
    const adminPassword = 'admin123'; // Change this in production!
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .insert([
        {
          name: 'System Administrator',
          email: 'admin@attendai.edu',
          password_hash: adminPasswordHash,
          college_id: college.id
        }
      ])
      .select()
      .single();

    if (adminError) {
      console.error('❌ Error creating admin:', adminError);
      return;
    }

    console.log('✅ Admin account created:');
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Password:', adminPassword);
    console.log('   ID:', admin.id);

    // 3. Create some sample subjects
    console.log('\n3️⃣ Creating sample subjects...');
    const subjects = [
      {
        name: 'Computer Science Fundamentals',
        code: 'CS101',
        level: 'Beginner',
        college_id: college.id
      },
      {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        level: 'Intermediate',
        college_id: college.id
      },
      {
        name: 'Database Management Systems',
        code: 'CS301',
        level: 'Advanced',
        college_id: college.id
      }
    ];

    const { data: createdSubjects, error: subjectsError } = await supabase
      .from('subjects')
      .insert(subjects)
      .select();

    if (subjectsError) {
      console.error('❌ Error creating subjects:', subjectsError);
      return;
    }

    console.log('✅ Sample subjects created:');
    createdSubjects.forEach(subject => {
      console.log(`   - ${subject.name} (${subject.code})`);
    });

    // 4. Create a sample teacher
    console.log('\n4️⃣ Creating sample teacher...');
    const teacherPassword = 'teacher123';
    const teacherPasswordHash = await bcrypt.hash(teacherPassword, 10);

    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .insert([
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@attendai.edu',
          password_hash: teacherPasswordHash,
          contact: '+1-555-0123',
          college_id: college.id
        }
      ])
      .select()
      .single();

    if (teacherError) {
      console.error('❌ Error creating teacher:', teacherError);
      return;
    }

    console.log('✅ Sample teacher created:');
    console.log('   Name:', teacher.name);
    console.log('   Email:', teacher.email);
    console.log('   Password:', teacherPassword);
    console.log('   ID:', teacher.id);

    // 5. Assign teacher to subjects
    console.log('\n5️⃣ Assigning teacher to subjects...');
    const { error: updateError } = await supabase
      .from('subjects')
      .update({ teacher_id: teacher.id })
      .in('code', ['CS101', 'CS201']);

    if (updateError) {
      console.error('❌ Error assigning teacher:', updateError);
      return;
    }

    console.log('✅ Teacher assigned to CS101 and CS201');

    console.log('\n🎉 Initial setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   College: AttendAI University');
    console.log('   Admin: admin@attendai.edu / admin123');
    console.log('   Teacher: sarah.johnson@attendai.edu / teacher123');
    console.log('   Subjects: CS101, CS201, CS301');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
createInitialData(); 