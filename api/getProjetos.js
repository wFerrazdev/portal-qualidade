// API para obter projetos do banco de dados
module.exports = async (req, res) => {
    console.log('=== API GETPROJETOS INICIADA ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        console.log('Método OPTIONS - retornando 200');
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        console.log('Método não permitido:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        console.log('Iniciando conexão com banco de dados...');
        
        // Conectar com PostgreSQL
        const { Pool } = require('pg');
        console.log('Pool importado com sucesso');
        
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        console.log('Pool criado com sucesso');
        
        // Buscar projetos
        console.log('Executando query: SELECT * FROM projetos ORDER BY id DESC');
        const result = await pool.query('SELECT * FROM projetos ORDER BY id DESC');
        console.log('Query executada com sucesso');
        console.log('Número de projetos encontrados:', result.rows.length);
        console.log('Projetos:', JSON.stringify(result.rows, null, 2));
        
        await pool.end();
        console.log('Pool fechado');
        
        console.log('Retornando resposta 200 com projetos');
        return res.status(200).json(result.rows);
        
    } catch (error) {
        console.error('ERRO CRÍTICO na API getProjetos:', error);
        console.error('Stack trace:', error.stack);
        console.error('Erro completo:', JSON.stringify(error, null, 2));
        
        return res.status(500).json({ 
            error: 'Failed to fetch projects', 
            details: error.message,
            stack: error.stack
        });
    }
}
