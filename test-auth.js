const https = require('https');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(url, key);

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "another_another_test@hutudns.com",
      password: "Password123!",
    });
    if (authError) throw authError;

    const crypto = require('crypto');
    const companyId = crypto.randomUUID();
    console.log("Creating company...");
    const { error: companyError } = await supabase.from('companies').insert({
      id: companyId,
      name: "Test Co",
      city: "Test",
      country: "Test",
    });
    if (companyError) throw companyError;

    console.log("Creating profile...");
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      company_id: companyId,
      full_name: "Test Name",
      email: "another_another_test@hutudns.com",
      role: "super_admin"
    });
    if (profileError) throw profileError;
    
    console.log("Success!");
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
