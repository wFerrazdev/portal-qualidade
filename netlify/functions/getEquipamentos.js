// CONTEÚDO CORRETO PARA: netlify/functions/getEquipamentos.js (o PLURAL)

const { Pool } = require('pg');

exports.handler = async function(event, context) {
    // Cria uma nova conexão com o banco de dados.
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // Executa a consulta SQL para buscar TODOS os equipamentos.
        const { rows } = await pool.query('SELECT * FROM equipamentos ORDER BY codigo ASC;');

        await pool.end();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rows),
        };
    } catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
        await pool.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor.' }),
        };
    }
};