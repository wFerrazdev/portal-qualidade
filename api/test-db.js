const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    try {
        const client = await pool.connect();
        
        // Verificar se as tabelas existem
        const tablesCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('compras_pedidos', 'compras_historico')
        `);
        
        // Verificar estrutura da tabela compras_pedidos
        const columnsCheck = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'compras_pedidos'
            ORDER BY ordinal_position
        `);
        
        // Contar registros existentes
        const countCheck = await client.query(`
            SELECT COUNT(*) as total FROM compras_pedidos
        `);
        
        client.release();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tables: tablesCheck.rows,
                columns: columnsCheck.rows,
                totalRecords: countCheck.rows[0].total,
                message: 'Conexão com banco funcionando'
            })
        };
        
    } catch (error) {
        console.error('Erro ao testar banco:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: 'Erro ao conectar com banco',
                details: error.message 
            })
        };
    }
};
