const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: unassignedTasks } = await supabase
    .from('corrective_actions')
    .select('id, finding_description, status, property_id, assigned_user_id')
    .eq('status', 'Unassigned');
    
  console.log("Unassigned tasks in DB:", unassignedTasks);

  const { data: users } = await supabase.from('profiles').select('id, full_name, default_property_id');
  const { data: pp } = await supabase.from('personnel_properties').select('*');
  
  console.log("Users default properties:", users);
  console.log("Personnel Properties mapping:", pp);
}

check();
