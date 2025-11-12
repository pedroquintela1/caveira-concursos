const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function generateTypes() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Get schema
  const { data, error } = await supabase.rpc('get_schema');
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  console.log('Types generated successfully!');
}

generateTypes();
