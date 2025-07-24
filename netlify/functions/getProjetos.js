// Arquivo: netlify/functions/getProjetos.js
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
        const result = await pool.query('SELECT * FROM projetos ORDER BY created_at ASC;');
        return { 
            statusCode: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            body: JSON.stringify(result.rows) 
        };
    } catch (error) {
        console.error("Erro na funcao getProjetos:", error);
        return { 
            statusCode: 500, 
            headers: corsHeaders, 
            body: JSON.stringify({ error: 'Falha ao buscar projetos.' }) 
        };
    } finally {
        await pool.end();
    }
};