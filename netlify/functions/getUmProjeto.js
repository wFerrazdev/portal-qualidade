const { Pool } = require('pg');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async function (event, context) {
  // Se for uma requisição de preflight OPTIONS, apenas retorne OK.
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'Preflight OK' };
  }

  // Pega o 'id' que virá na URL (ex: /getUmProjeto?id=5)
  const projectId = event.queryStringParameters.id;

  if (!projectId) {
    return { statusCode: 400, headers: corsHeaders, body: 'ID do projeto e obrigatorio.' };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Seleciona o projeto ONDE o 'id' for igual ao que recebemos
    const result = await pool.query('SELECT * FROM projetos WHERE id = $1', [projectId]);
    
    // Se nenhum projeto for encontrado com esse id
    if (result.rows.length === 0) {
      return { statusCode: 404, headers: corsHeaders, body: 'Projeto nao encontrado.' };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows[0]) // Retorna apenas o primeiro (e único) resultado
    };

  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao buscar dados.' })
    };
  } finally {
    await pool.end();
  }
};