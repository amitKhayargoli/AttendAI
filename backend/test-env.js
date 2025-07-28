require('dotenv').config();

console.log('🔍 Testing environment variables...\n');

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('PORT:', process.env.PORT);

console.log('\n📋 All environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('SUPABASE') || key.includes('JWT') || key.includes('PORT')) {
    console.log(`${key}: ${process.env[key]}`);
  }
}); 