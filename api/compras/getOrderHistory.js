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
        const numero = event.queryStringParameters?.numero;

        if (!numero) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Número do pedido não fornecido' })
            };
        }

        // Buscar histórico
        const result = await pool.query(
            `SELECT h.* 
             FROM purchase_order_history h
             JOIN purchase_orders o ON h.order_id = o.id
             WHERE o.numero = $1
             ORDER BY h.data_mudanca DESC`,
            [numero]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.rows)
        };
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erro ao buscar histórico' })
        };
    }
};

