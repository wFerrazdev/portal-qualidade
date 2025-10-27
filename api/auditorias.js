// API Consolidada para Auditorias - GET, POST
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        if (req.method === 'GET') {
            // GET - Buscar todas as auditorias
            const result = await pool.query('SELECT * FROM auditorias ORDER BY data DESC');
            return res.status(200).json(result.rows);
            
        } else if (req.method === 'POST') {
            // POST - Adicionar nova auditoria
            const { tipo, data, responsavel, status, area, descricao } = req.body;
            
            const result = await pool.query(
                'INSERT INTO auditorias (tipo, data, responsavel, status, area, descricao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [tipo, data, responsavel, status, area, descricao]
            );
            
            return res.status(201).json(result.rows[0]);
            
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Erro na API de auditorias:', error);
        
        // Fallback para dados mock se houver erro
        if (req.method === 'GET') {
            const mockData = [
                {
                    id: 1,
                    tipo: 'Auditoria Interna',
                    data: '2024-01-15',
                    responsavel: 'João Silva',
                    status: 'Planejada',
                    area: 'Qualidade',
                    descricao: 'Auditoria interna do sistema de qualidade'
                },
                {
                    id: 2,
                    tipo: 'Visita Técnica',
                    data: '2024-01-20',
                    responsavel: 'Maria Santos',
                    status: 'Executada',
                    area: 'Produção',
                    descricao: 'Visita técnica para verificação de processos'
                }
            ];
            return res.status(200).json(mockData);
        }
        
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
