// Importa a biblioteca para conectar ao PostgreSQL.
const { Pool } = require('pg');

exports.handler = async function(event, context) {
    // Cria uma nova conexão com o banco de dados usando a URL que está nas variáveis de ambiente do Netlify.
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // Executa a consulta SQL para buscar todos os equipamentos, ordenados por código.
        const { rows } = await pool.query('SELECT * FROM equipamentos ORDER BY codigo ASC;');

        // Fecha a conexão com o banco de dados.
        await pool.end();

        // Retorna os dados encontrados com um status de sucesso.
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rows),
        };
    } catch (error) {
        // Em caso de erro, loga o erro e retorna uma mensagem de falha.
        console.error('Erro ao buscar equipamentos:', error);
        await pool.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor.' }),
        };
    }
};