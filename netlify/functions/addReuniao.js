// Arquivo: netlify/functions/addReuniao.js
const { Pool } = require('pg');
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

exports.handler = async function (event, context) {
  // --- BLOCO DE SEGURANÇA DE PERMISSÃO ---
    const { user } = context.clientContext;
    // Verifica se não há usuário OU se o usuário não tem a role 'admin'
    if (!user || !user.app_metadata.roles.includes('admin')) {
        return {
            statusCode: 403, // Forbidden (Proibido)
            body: JSON.stringify({ error: 'Acesso negado. Apenas administradores podem realizar esta acao.' })
        };
    }
    // --- FIM DO BLOCO DE SEGURANÇA ---
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers: corsHeaders }; }
  if (event.httpMethod !== 'POST') { return { statusCode: 405, headers: corsHeaders, body: 'Metodo nao permitido.' }; }
  try {
    const data = JSON.parse(event.body);
    const { titulo, data_reuniao = null, participantes = [], pauta = '', link_ata = '' } = data;
    if (!titulo) { return { statusCode: 400, headers: corsHeaders, body: 'O campo "titulo" e obrigatorio.' }; }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const query = 'INSERT INTO reunioes (titulo, data_reuniao, participantes, pauta, link_ata) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
    const values = [titulo, data_reuniao, participantes, pauta, link_ata];
    const result = await pool.query(query, values);
    await pool.end();
    return { statusCode: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify(result.rows[0]) };
  } catch (error) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Falha ao adicionar reunião.' }) };
  }
};