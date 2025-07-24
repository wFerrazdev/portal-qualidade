const { Pool } = require('pg');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS' // Agora permitimos o método PUT
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
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'Preflight OK' };
  }

  // Para atualizar, só permitiremos o método PUT
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, headers: corsHeaders, body: 'Metodo nao permitido.' };
  }
  
  const projectId = event.queryStringParameters.id;
  if (!projectId) {
    return { statusCode: 400, headers: corsHeaders, body: 'ID do projeto e obrigatorio.' };
  }

  try {
    const data = JSON.parse(event.body);
    const { titulo, status, imagem_url, principais_feitos, progresso } = data;

    if (!titulo) {
      return { statusCode: 400, headers: corsHeaders, body: 'O campo "titulo" e obrigatorio.' };
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Comando SQL para ATUALIZAR (UPDATE) um registro existente
    const query = `
      UPDATE projetos 
      SET titulo = $1, status = $2, imagem_url = $3, principais_feitos = $4, progresso = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [titulo, status, imagem_url, principais_feitos, progresso, projectId];
    const result = await pool.query(query, values);
    await pool.end();

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows[0])
    };

  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao atualizar projeto.' })
    };
  }
};