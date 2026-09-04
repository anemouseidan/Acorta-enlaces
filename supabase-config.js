// Reemplaza estos dos valores con los de tu proyecto NUEVO de Supabase:
// Supabase → Settings → API → "Project URL" y "anon public" key.
const SUPABASE_URL = 'https://kvxafeookpsalgtcuopn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2eGFmZW9va3BzYWxndGN1b3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTA3MjksImV4cCI6MjEwNDA2NjcyOX0.PE8ScJAJj0HFgXI3GY8GS2ruUACcup7xNgGoqLSdVFE';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
