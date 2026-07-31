const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePermissions() {
  console.log("Starting granular permissions migration...");
  
  const newPerms = [
    { permission_key: 'equipment.create', description: 'Create equipment records' },
    { permission_key: 'equipment.edit', description: 'Edit equipment details' },
    { permission_key: 'equipment.delete', description: 'Delete equipment records' },
    { permission_key: 'properties.create', description: 'Create new properties' },
    { permission_key: 'properties.edit', description: 'Edit property details' },
    { permission_key: 'properties.delete', description: 'Delete properties' },
    { permission_key: 'tasks.create', description: 'Create and assign new tasks' },
    { permission_key: 'tasks.edit', description: 'Edit existing tasks' },
    { permission_key: 'tasks.delete', description: 'Delete tasks' },
  ];

  // 1. Insert new permissions
  const { data: insertedPerms, error: insertError } = await supabase
    .from('permissions')
    .upsert(newPerms, { onConflict: 'permission_key' })
    .select();

  if (insertError) {
    console.error("Error inserting permissions:", insertError);
    return;
  }
  console.log("New permissions inserted.");

  // Fetch all current permissions for mapping IDs
  const { data: allPerms } = await supabase.from('permissions').select('*');
  const permMap = Object.fromEntries(allPerms.map(p => [p.permission_key, p.id]));

  const mappingsToMake = [];

  // 2. Fetch existing roles mapped to `.manage`
  const oldKeys = ['equipment.manage', 'properties.manage', 'tasks.manage'];
  
  for (const oldKey of oldKeys) {
    const oldId = permMap[oldKey];
    if (!oldId) continue; // Already deleted or doesn't exist

    const { data: rolePerms } = await supabase
      .from('role_permissions')
      .select('role_id')
      .eq('permission_id', oldId);

    if (rolePerms) {
      const prefix = oldKey.split('.')[0];
      const createId = permMap[`${prefix}.create`];
      const editId = permMap[`${prefix}.edit`];
      const deleteId = permMap[`${prefix}.delete`];

      for (const rp of rolePerms) {
        mappingsToMake.push({ role_id: rp.role_id, permission_id: createId });
        mappingsToMake.push({ role_id: rp.role_id, permission_id: editId });
        mappingsToMake.push({ role_id: rp.role_id, permission_id: deleteId });
      }
    }
  }

  // 3. Insert mappings
  if (mappingsToMake.length > 0) {
    const { error: mapError } = await supabase
      .from('role_permissions')
      .upsert(mappingsToMake, { onConflict: 'role_id, permission_id' });
      
    if (mapError) console.error("Error mapping roles:", mapError);
    else console.log(`Mapped ${mappingsToMake.length} new role permissions.`);
  }

  // 4. Delete old `.manage` permissions
  for (const oldKey of oldKeys) {
    const oldId = permMap[oldKey];
    if (oldId) {
      const { error: delError } = await supabase
        .from('permissions')
        .delete()
        .eq('id', oldId);
        
      if (delError) console.error(`Error deleting ${oldKey}:`, delError);
      else console.log(`Deleted deprecated permission: ${oldKey}`);
    }
  }

  console.log("Migration complete!");
}

migratePermissions();
