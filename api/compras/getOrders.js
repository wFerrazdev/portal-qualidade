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
        const client = await pool.connect();
        
        const result = await client.query(`
            SELECT 
                numero,
                descricao,
                fornecedor,
                valor,
                status,
                data_criacao as "dataCriacao",
                observacoes
            FROM compras_pedidos 
            ORDER BY data_criacao DESC
        `);
        
        client.release();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.rows)
        };
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
    }
};