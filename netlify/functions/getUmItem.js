// Arquivo: netlify/functions/getUmItem.js
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

    if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers: corsHeaders, body: 'Preflight OK' }; }

    const { type, id } = event.queryStringParameters;

    if (!type || !id) {
        return { statusCode: 400, headers: corsHeaders, body: 'Os parametros "type" e "id" sao obrigatorios.' };
    }
    
    const allowedTables = ['projetos', 'auditorias', 'reunioes'];
    if (!allowedTables.includes(type)) {
        return { statusCode: 400, headers: corsHeaders, body: 'Tipo de item invalido.' };
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        const query = `SELECT * FROM ${type} WHERE id = $1`;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return { statusCode: 404, headers: corsHeaders, body: 'Item nao encontrado.' };
        }

        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify(result.rows[0])
        };
    } catch (error) {
        console.error('Erro ao buscar item:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Falha ao buscar dados.' })
        };
    } finally {
        await pool.end();
    }
};