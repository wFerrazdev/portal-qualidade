const { Pool } = require('pg');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS' // Permitimos o método DELETE
};

exports.handler = async function (event, context) {
  // --- BLOCO DE SEGURANÇA DE ESCRITA (VERSÃO CORRIGIDA) ---
  const { user } = context.clientContext;
  if (!user || !user.app_metadata || !user.app_metadata.roles || !user.app_metadata.roles.includes('admin')) {
      return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' })
      };
  }
  // --- FIM DO BLOCO DE SEGURANÇA ---
  // Resposta para a requisição de preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'Preflight OK' };
  }

  // Só permitimos o método DELETE
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, headers: corsHeaders, body: 'Metodo nao permitido.' };
  }
  
  const projectId = event.queryStringParameters.id;
  if (!projectId) {
    return { statusCode: 400, headers: corsHeaders, body: 'ID do projeto e obrigatorio.' };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Comando SQL para DELETAR um registro da tabela ONDE o id corresponder
    const query = 'DELETE FROM projetos WHERE id = $1;';
    
    await pool.query(query, [projectId]);
    
    await pool.end();

    // Retorna uma resposta de sucesso
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Projeto excluido com sucesso.' })
    };

  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao excluir projeto.' })
    };
  }
};