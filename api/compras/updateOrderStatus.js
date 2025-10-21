const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'PUT') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { numero, newStatus, observacao } = JSON.parse(event.body);
        const client = await pool.connect();
        
        // Buscar status atual
        const currentOrder = await client.query(`
            SELECT status FROM compras_pedidos WHERE numero = $1
        `, [numero]);
        
        if (currentOrder.rows.length === 0) {
            client.release();
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Pedido não encontrado' })
            };
        }
        
        const currentStatus = currentOrder.rows[0].status;
        
        // Atualizar status do pedido
        await client.query(`
            UPDATE compras_pedidos 
            SET status = $1 
            WHERE numero = $2
        `, [newStatus, numero]);
        
        // Adicionar ao histórico
        await client.query(`
            INSERT INTO compras_historico (numero_pedido, status_anterior, status_novo, data_mudanca, observacao)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            numero,
            currentStatus,
            newStatus,
            new Date().toISOString(),
            observacao || `Status alterado de ${currentStatus} para ${newStatus}`
        ]);
        
        client.release();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
    }
};