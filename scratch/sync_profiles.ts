import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const r = await s.auth.admin.listUsers();
  const users = r.data.users;
  
  const { data: profiles } = await s.from('profiles').select('id');
  const profileIds = profiles!.map(p => p.id);
  
  const missing = users.filter(u => !profileIds.includes(u.id));
  console.log(`Found ${missing.length} missing profiles.`);
  
  for (const u of missing) {
    const { error } = await s.from('profiles').insert({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || 'Unknown'
    });
    
    if (error) console.error(`Error inserting ${u.email}:`, error.message);
    else console.log(`Inserted ${u.email}`);
  }
}

run();
