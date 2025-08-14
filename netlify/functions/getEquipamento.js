const { Pool } = require('pg');

exports.handler = async function(event, context) {
    const { codigo } = event.queryStringParameters;

    if (!codigo) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Código do equipamento é obrigatório.' }) };
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const { rows } = await pool.query('SELECT * FROM equipamentos WHERE codigo = $1;', [codigo]);
        await pool.end();

        if (rows.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ message: 'Equipamento não encontrado.' }) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rows[0]) // Retorna apenas o primeiro (e único) resultado
        };
    } catch (error) {
        console.error('Erro ao buscar equipamento:', error);
        await pool.end();
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno do servidor.' }) };
    }
};