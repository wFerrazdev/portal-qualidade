// API para obter projetos do banco de dados
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Conectar com PostgreSQL
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        // Buscar projetos
        const result = await pool.query('SELECT * FROM projetos ORDER BY id DESC');
        await pool.end();
        
        return res.status(200).json(result.rows);
        
    } catch (error) {
        console.error('Erro na API getProjetos:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch projects', 
            details: error.message
        });
    }
}
