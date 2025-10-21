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

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const order = JSON.parse(event.body);

        // Inserir pedido
        const orderResult = await pool.query(
            `INSERT INTO purchase_orders (numero, descricao, fornecedor, valor, observacoes, status, data_criacao)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [order.numero, order.descricao, order.fornecedor, order.valor, order.observacoes, order.status, order.dataCriacao]
        );

        const orderId = orderResult.rows[0].id;

        // Inserir histórico
        if (order.historico && order.historico.length > 0) {
            for (const item of order.historico) {
                await pool.query(
                    `INSERT INTO purchase_order_history (order_id, status_anterior, status_novo, observacao, data_mudanca)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [orderId, null, item.status, item.observacao, item.data]
                );
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, id: orderId })
        };
    } catch (error) {
        console.error('Erro ao adicionar pedido:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erro ao adicionar pedido', details: error.message })
        };
    }
};

