const { Pool } = require('pg');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS'
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'Preflight OK' };
  }

  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, headers: corsHeaders, body: 'Metodo nao permitido.' };
  }
  
  const auditId = event.queryStringParameters.id;
  if (!auditId) {
    return { statusCode: 400, headers: corsHeaders, body: 'ID da auditoria e obrigatorio.' };
  }

  try {
    const data = JSON.parse(event.body);
    const { titulo, tipo, data_evento, status, responsavel, descricao } = data;

    if (!titulo) {
      return { statusCode: 400, headers: corsHeaders, body: 'O campo "titulo" e obrigatorio.' };
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const query = `
      UPDATE auditorias 
      SET titulo = $1, tipo = $2, data_evento = $3, status = $4, responsavel = $5, descricao = $6
      WHERE id = $7
      RETURNING *;
    `;
    const values = [titulo, tipo, data_evento, status, responsavel, descricao, auditId];
    const result = await pool.query(query, values);
    await pool.end();

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows[0])
    };

  } catch (error) {
    console.error('Erro ao atualizar auditoria:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao atualizar auditoria.' })
    };
  }
};