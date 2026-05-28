import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Atenção técnico: Variáveis de ambiente do Supabase não encontradas. Certifique-se de configurá-las no painel da Vercel!"
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
