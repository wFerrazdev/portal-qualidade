const { Pool } = require('pg');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
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
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'Preflight OK' };
  }

  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, headers: corsHeaders, body: 'Metodo nao permitido.' };
  }
  
  const auditId = event.queryStringParameters.id;
  if (!auditId) {
    return { statusCode: 400, headers: corsHeaders, body: 'ID da auditoria e obrigatorio.' };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const query = 'DELETE FROM auditorias WHERE id = $1;';
    await pool.query(query, [auditId]);
    await pool.end();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Auditoria excluida com sucesso.' })
    };

  } catch (error) {
    console.error('Erro ao excluir auditoria:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao excluir auditoria.' })
    };
  }
};
