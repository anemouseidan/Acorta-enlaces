// Reemplaza estos dos valores con los de tu proyecto NUEVO de Supabase:
// Supabase → Settings → API → "Project URL" y "anon public" key.
const SUPABASE_URL = 'https://TU-PROYECTO-NUEVO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-ANON-KEY-NUEVA-AQUI';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
