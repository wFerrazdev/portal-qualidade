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

    if (event.httpMethod !== 'PUT') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const { numero, newStatus, observacao } = JSON.parse(event.body);

        // Buscar order_id
        const orderResult = await pool.query(
            'SELECT id, status FROM purchase_orders WHERE numero = $1',
            [numero]
        );

        if (orderResult.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Pedido não encontrado' })
            };
        }

        const orderId = orderResult.rows[0].id;
        const oldStatus = orderResult.rows[0].status;

        // Atualizar status
        await pool.query(
            'UPDATE purchase_orders SET status = $1, data_atualizacao = CURRENT_TIMESTAMP WHERE id = $2',
            [newStatus, orderId]
        );

        // Adicionar ao histórico
        await pool.query(
            `INSERT INTO purchase_order_history (order_id, status_anterior, status_novo, observacao, data_mudanca)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
            [orderId, oldStatus, newStatus, observacao || `Status alterado para ${newStatus}`]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erro ao atualizar status', details: error.message })
        };
    }
};

