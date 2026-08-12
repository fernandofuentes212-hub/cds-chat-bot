const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getLatestPromo() {
    const { data, error } = await supabase
        .from('cds_promociones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error al obtener la promoción de Supabase:', error.message);
        throw error;
    }

    return data;
}

module.exports = { supabase, getLatestPromo };