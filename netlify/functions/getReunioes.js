// Arquivo: netlify/functions/getReunioes.js
const { Pool } = require('pg');
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 200, headers: corsHeaders }; }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const result = await pool.query('SELECT * FROM reunioes ORDER BY data_reuniao DESC;');
    return { statusCode: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify(result.rows) };
  } catch (error) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Falha ao buscar reuniões.' }) };
  } finally {
    await pool.end();
  }
};