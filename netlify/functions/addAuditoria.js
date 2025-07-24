const { Pool } = require('pg');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Metodo nao permitido.' };
  }

  try {
    const data = JSON.parse(event.body);

    // Pegamos os campos que definimos para a tabela 'auditorias'
    const {
      titulo,
      tipo = '',
      data_evento = null, // null é um bom padrão para datas
      status = '',
      responsavel = '',
      descricao = ''
    } = data;

    if (!titulo) {
      return { statusCode: 400, headers: corsHeaders, body: 'O campo "titulo" e obrigatorio.' };
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const query = `
      INSERT INTO auditorias (titulo, tipo, data_evento, status, responsavel, descricao)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *; 
    `;
    const values = [titulo, tipo, data_evento, status, responsavel, descricao];

    const result = await pool.query(query, values);
    await pool.end();

    return {
      statusCode: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows[0])
    };

  } catch (error) {
    console.error('Erro ao adicionar auditoria:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao adicionar auditoria ao banco de dados.' })
    };
  }
};