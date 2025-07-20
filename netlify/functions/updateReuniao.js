// Arquivo: netlify/functions/updateReuniao.js
const { Pool } = require('pg');
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'PUT, OPTIONS' };

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers: corsHeaders }; }
  if (event.httpMethod !== 'PUT') { return { statusCode: 405, headers: corsHeaders, body: 'Metodo nao permitido.' }; }
  const reuniaoId = event.queryStringParameters.id;
  if (!reuniaoId) { return { statusCode: 400, headers: corsHeaders, body: 'ID da reunião e obrigatorio.' }; }
  try {
    const data = JSON.parse(event.body);
    const { titulo, data_reuniao, participantes, pauta, link_ata } = data;
    if (!titulo) { return { statusCode: 400, headers: corsHeaders, body: 'O campo "titulo" e obrigatorio.' }; }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const query = 'UPDATE reunioes SET titulo = $1, data_reuniao = $2, participantes = $3, pauta = $4, link_ata = $5 WHERE id = $6 RETURNING *;';
    const values = [titulo, data_reuniao, participantes, pauta, link_ata, reuniaoId];
    const result = await pool.query(query, values);
    await pool.end();
    return { statusCode: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify(result.rows[0]) };
  } catch (error) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Falha ao atualizar reunião.' }) };
  }
};