// API para verificar estrutura da tabela projetos
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const { Pool } = await import('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        
        // Verificar se tabela existe
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'projetos'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            await pool.end();
            return res.status(200).json({
                tableExists: false,
                message: 'Tabela projetos não existe'
            });
        }
        
        // Pegar estrutura da tabela
        const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'projetos'
            ORDER BY ordinal_position;
        `);
        
        // Tentar buscar dados
        let sampleData = null;
        try {
            const data = await pool.query('SELECT * FROM projetos LIMIT 3');
            sampleData = data.rows;
        } catch (dataError) {
            sampleData = { error: dataError.message };
        }
        
        await pool.end();
        
        return res.status(200).json({
            tableExists: true,
            columns: structure.rows,
            sampleData,
            message: 'Estrutura da tabela verificada'
        });
        
    } catch (error) {
        console.error('Erro na API check-table:', error);
        return res.status(500).json({ 
            error: 'Erro ao verificar tabela',
            details: error.message
        });
    }
}
