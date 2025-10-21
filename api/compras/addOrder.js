const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const order = JSON.parse(event.body);
        const client = await pool.connect();
        
        // Inserir pedido
        const pedidoResult = await client.query(`
            INSERT INTO compras_pedidos (numero, descricao, fornecedor, valor, status, data_criacao, observacoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            order.numero,
            order.descricao,
            order.fornecedor,
            order.valor,
            order.status,
            order.dataCriacao,
            order.observacoes
        ]);
        
        // Inserir histórico inicial
        if (order.historico && order.historico.length > 0) {
            const historico = order.historico[0];
            await client.query(`
                INSERT INTO compras_historico (numero_pedido, status_anterior, status_novo, data_mudanca, observacao)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                order.numero,
                null,
                historico.status,
                historico.data,
                historico.observacao
            ]);
        }
        
        client.release();
        
        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, pedido: pedidoResult.rows[0] })
        };
    } catch (error) {
        console.error('Erro ao adicionar pedido:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
    }
};