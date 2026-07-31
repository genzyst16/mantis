const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://srmqbppyqorvlvwipwmq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXFicHB5cW9ydmx2d2lwd21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE0MDcyMSwiZXhwIjoyMTAwNzE2NzIxfQ.4LH9mW2RFyUmcBlamRzHkBn5z88QwKXLWbCJB7sjh_g'
);

async function testDelete() {
  const userId = 'c47e02a8-7abf-49fa-88a1-ebaf358e45e9'; // geray@hhgroup.ph
  
  console.log("Attempting to update created_by to null...");
  const { data, error } = await supabase.from('inspection_templates').update({ created_by: null }).eq('created_by', userId).select();
  if (error) {
    console.log("Error updating", error);
  } else {
    console.log("Updated rows:");
    data.forEach(t => console.log(t.id, t.created_by));
  }
}

testDelete();
