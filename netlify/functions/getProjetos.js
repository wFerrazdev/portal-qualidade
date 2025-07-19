const { Pool } = require('pg');

// Reutilizando os mesmos headers para consistência
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

exports.handler = async function (event, context) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const result = await pool.query('SELECT * FROM projetos ORDER BY created_at DESC;');
    
    return {
      statusCode: 200,
      // Adicionamos os headers na resposta de sucesso
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows)
    };

  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return {
      statusCode: 500,
       // Adicionamos os headers também na resposta de erro
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao buscar dados do banco de dados.' })
    };

  } finally {
    await pool.end();
  }
};