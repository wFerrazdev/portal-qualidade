// Arquivo: netlify/functions/getAuditorias.js
const { Pool } = require('pg');
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async function (event, context) {
    // --- BLOCO DE SEGURANÇA DE LEITURA ---
    const { user } = context.clientContext;
    if (!user) {
        return {
            statusCode: 401, // Unauthorized
            body: JSON.stringify({ error: 'Voce precisa estar logado para ver estes dados.' })
        };
    }
    // --- FIM DO BLOCO DE SEGURANÇA ---

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers: corsHeaders }; }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        const result = await pool.query('SELECT * FROM auditorias ORDER BY data_evento DESC;');
        return { 
            statusCode: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            body: JSON.stringify(result.rows) 
        };
    } catch (error) {
        console.error("Erro na funcao getAuditorias:", error);
        return { 
            statusCode: 500, 
            headers: corsHeaders, 
            body: JSON.stringify({ error: 'Falha ao buscar auditorias.' }) 
        };
    } finally {
        await pool.end();
    }
};