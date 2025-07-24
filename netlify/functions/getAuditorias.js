const { Pool } = require('pg');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async function (event, context) {
  // --- BLOCO DE SEGURANÇA DE LEITURA ---
    const { user } = context.clientContext;
    // Apenas verifica se existe um usuário. Não precisa ser admin para ver.
    if (!user) {
        return {
            statusCode: 401, // Unauthorized (Não Autorizado)
            body: JSON.stringify({ error: 'Voce precisa estar logado para ver estes dados.' })
        };
    }
  // Resposta para a requisição de preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'Preflight OK' };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // A única mudança principal está aqui: buscamos da tabela 'auditorias'
    // e ordenamos pela data do evento, mostrando os mais recentes primeiro.
    const result = await pool.query('SELECT * FROM auditorias ORDER BY data_evento DESC;');

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows)
    };

  } catch (error) {
    console.error('Erro ao buscar auditorias:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao buscar dados do banco de dados.' })
    };
  } finally {
    await pool.end();
  }
};