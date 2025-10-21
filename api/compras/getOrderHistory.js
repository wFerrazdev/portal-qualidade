const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { numero } = event.queryStringParameters || {};
        
        if (!numero) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Número do pedido é obrigatório' })
            };
        }

        const client = await pool.connect();
        
        const result = await client.query(`
            SELECT 
                status_anterior as "statusAnterior",
                status_novo as "statusNovo",
                data_mudanca as "dataMudanca",
                observacao
            FROM compras_historico 
            WHERE numero_pedido = $1
            ORDER BY data_mudanca ASC
        `, [numero]);
        
        client.release();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.rows)
        };
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
    }
};