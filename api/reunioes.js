// API Consolidada para Reuniões - GET, POST, DELETE
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
            // GET - Buscar todas as reuniões
            const result = await pool.query('SELECT * FROM reunioes ORDER BY data DESC');
            return res.status(200).json(result.rows);
            
        } else if (req.method === 'POST') {
            // POST - Adicionar nova reunião
            const { titulo, data, hora, participantes, status, descricao } = req.body;
            
            const result = await pool.query(
                'INSERT INTO reunioes (titulo, data, hora, participantes, status, descricao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [titulo, data, hora, participantes, status, descricao]
            );
            
            return res.status(201).json(result.rows[0]);
            
        } else if (req.method === 'DELETE') {
            // DELETE - Excluir reunião
            const { id } = req.query;
            
            if (!id) {
                return res.status(400).json({ error: 'ID da reunião é obrigatório' });
            }
            
            const result = await pool.query('DELETE FROM reunioes WHERE id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Reunião não encontrada' });
            }
            
            return res.status(200).json({ message: 'Reunião excluída com sucesso' });
            
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Erro na API de reuniões:', error);
        
        // Fallback para dados mock se houver erro
        if (req.method === 'GET') {
            const mockData = [
                {
                    id: 1,
                    titulo: 'Reunião Semanal de Qualidade',
                    data: '2024-01-15',
                    hora: '14:00',
                    participantes: ['João Silva', 'Maria Santos'],
                    status: 'Agendada',
                    descricao: 'Reunião para revisar indicadores de qualidade'
                },
                {
                    id: 2,
                    titulo: 'Reunião de Planejamento',
                    data: '2024-01-20',
                    hora: '10:00',
                    participantes: ['Ana Costa', 'Pedro Lima'],
                    status: 'Realizada',
                    descricao: 'Planejamento das atividades do mês'
                }
            ];
            return res.status(200).json(mockData);
        }
        
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
