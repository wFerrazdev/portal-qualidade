const { Pool } = require('pg');

// Vamos criar um objeto com os headers de permissão para reutilizar
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Permite acesso de qualquer origem
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' // Métodos permitidos
};

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
  // O navegador primeiro envia uma requisição 'OPTIONS' para "pedir permissão".
  // Precisamos responder a ela com sucesso para que ele prossiga.
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Preflight OK' })
    };
  }

  // O resto do código continua o mesmo, apenas adicionamos os headers na resposta
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Metodo nao permitido.' };
  }

  try {
    const data = JSON.parse(event.body);
    const { titulo, status = '', imagem_url = '', principais_feitos = [], progresso = 0 } = data;

    if (!titulo) {
      return { statusCode: 400, headers: corsHeaders, body: 'O campo "titulo" e obrigatorio.' };
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const query = `
      INSERT INTO projetos (titulo, status, imagem_url, principais_feitos, progresso)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *; 
    `;
    const values = [titulo, status, imagem_url, principais_feitos, progresso];
    const result = await pool.query(query, values);
    await pool.end();

    return {
      statusCode: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows[0])
    };

  } catch (error) {
    console.error('Erro ao adicionar projeto:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao adicionar projeto ao banco de dados.' })
    };
  }
};