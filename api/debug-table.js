// API para debug da estrutura da tabela projetos
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Conectar com PostgreSQL
        const { Pool } = await import('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        // Verificar se a tabela existe
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'projetos'
            );
        `);
        
        // Se a tabela existe, pegar a estrutura
        let tableStructure = null;
        if (tableExists.rows[0].exists) {
            const structure = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'projetos'
                ORDER BY ordinal_position;
            `);
            tableStructure = structure.rows;
        }
        
        // Tentar buscar dados da tabela
        let tableData = null;
        try {
            const data = await pool.query('SELECT * FROM projetos LIMIT 5');
            tableData = data.rows;
        } catch (dataError) {
            tableData = { error: dataError.message };
        }
        
        await pool.end();
        
        return res.status(200).json({
            tableExists: tableExists.rows[0].exists,
            tableStructure,
            tableData,
            environment: process.env.NODE_ENV || 'development'
        });
        
    } catch (error) {
        console.error('Erro na API debug-table:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        });
    }
}
