// Importa a ferramenta 'pg' que instalamos para conectar ao PostgreSQL
const { Pool } = require('pg');

// As Netlify Functions são exportadas como um 'handler' (manipulador de eventos)
exports.handler = async function (event, context) {
  // Cria uma nova conexão com o banco de dados usando a nossa chave secreta
  // que está segura nas variáveis de ambiente do Netlify.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Necessário para a conexão com o Neon
    }
  });

  try {
    // Executa uma consulta SQL para selecionar TODOS os projetos da nossa tabela
    // Ordenando pelos mais recentes primeiro.
    const result = await pool.query('SELECT * FROM projetos ORDER BY created_at DESC;');

    // Se a consulta for bem-sucedida, retorna os dados para o navegador.
    return {
      statusCode: 200, // Código de sucesso HTTP
      headers: {
        'Content-Type': 'application/json' // Informa ao navegador que estamos enviando JSON
      },
      body: JSON.stringify(result.rows) // Converte os resultados em texto JSON
    };

  } catch (error) {
    // Se algo der errado (ex: erro de conexão, consulta errada)...
    console.error('Erro ao buscar projetos:', error);
    // Retorna uma mensagem de erro.
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao buscar dados do banco de dados.' })
    };

  } finally {
    // Garante que a conexão com o banco de dados seja sempre fechada
    // independentemente de ter dado sucesso ou erro.
    await pool.end();
  }
};