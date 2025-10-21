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
        const { Pool } = await import('pg');
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
        
        // Fallback para dados mock se houver erro
        const mockData = [
            {
                id: 1,
                nome: 'Projeto Alpha',
                descricao: 'Desenvolvimento de novo produto',
                status: 'Em Andamento',
                progresso: 75,
                data_inicio: '2024-01-15',
                data_fim: '2024-06-30',
                responsavel: 'João Silva',
                imagem_url: 'https://via.placeholder.com/300x200?text=Projeto+Alpha'
            },
            {
                id: 2,
                nome: 'Projeto Beta',
                descricao: 'Melhoria de processos',
                status: 'Concluído',
                progresso: 100,
                data_inicio: '2023-10-01',
                data_fim: '2024-02-28',
                responsavel: 'Maria Santos',
                imagem_url: 'https://via.placeholder.com/300x200?text=Projeto+Beta'
            }
        ];
        
        return res.status(200).json(mockData);
    }
}
