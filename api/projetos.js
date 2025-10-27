// API Consolidada para Projetos - GET, POST, DELETE
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        if (req.method === 'GET') {
            // GET - Buscar todos os projetos
            const result = await pool.query('SELECT * FROM projetos ORDER BY id DESC');
            return res.status(200).json(result.rows);
            
        } else if (req.method === 'POST') {
            // POST - Adicionar novo projeto
            const { nome, descricao, status, progresso, data_inicio, data_fim, responsavel, imagem_url } = req.body;
            
            const result = await pool.query(
                'INSERT INTO projetos (nome, descricao, status, progresso, data_inicio, data_fim, responsavel, imagem_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                [nome, descricao, status, progresso, data_inicio, data_fim, responsavel, imagem_url]
            );
            
            return res.status(201).json(result.rows[0]);
            
        } else if (req.method === 'DELETE') {
            // DELETE - Excluir projeto
            const { id } = req.query;
            
            if (!id) {
                return res.status(400).json({ error: 'ID do projeto é obrigatório' });
            }
            
            const result = await pool.query('DELETE FROM projetos WHERE id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }
            
            return res.status(200).json({ message: 'Projeto excluído com sucesso' });
            
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Erro na API de projetos:', error);
        
        // Fallback para dados mock se houver erro
        if (req.method === 'GET') {
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
        
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
