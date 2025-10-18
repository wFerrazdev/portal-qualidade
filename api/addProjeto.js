// API para adicionar projeto
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { titulo, descricao, status, progresso, data_inicio, data_fim, responsavel, imagem_url } = req.body;
        
        if (!titulo || !descricao || !status || !responsavel) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Conectar com PostgreSQL
        const { Pool } = await import('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        // Inserir projeto
        const result = await pool.query(
            'INSERT INTO projetos (titulo, descricao, status, progresso, data_inicio, data_fim, responsavel, imagem_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [titulo, descricao, status, progresso || 0, data_inicio, data_fim, responsavel, imagem_url]
        );
        
        await pool.end();
        
        return res.status(201).json(result.rows[0]);
        
    } catch (error) {
        console.error('Erro na API addProjeto:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        });
    }
}
