// Arquivo: netlify/functions/deleteReuniao.js
const { Pool } = require('pg');
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'DELETE, OPTIONS' };

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers: corsHeaders }; }
  if (event.httpMethod !== 'DELETE') { return { statusCode: 405, headers: corsHeaders, body: 'Metodo nao permitido.' }; }
  const reuniaoId = event.queryStringParameters.id;
  if (!reuniaoId) { return { statusCode: 400, headers: corsHeaders, body: 'ID da reunião e obrigatorio.' }; }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query('DELETE FROM reunioes WHERE id = $1;', [reuniaoId]);
    await pool.end();
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'Reuniao excluida com sucesso.' }) };
  } catch (error) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Falha ao excluir reunião.' }) };
  }
};