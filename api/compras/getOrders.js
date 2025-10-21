const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

exports.handler = async (event, context) => {
    // Habilitar CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const result = await pool.query(
            `SELECT * FROM purchase_orders ORDER BY numero DESC`
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.rows)
        };
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erro ao buscar pedidos' })
        };
    }
};

