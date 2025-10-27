// API Consolidada para Reuniões - GET, POST, PUT, DELETE
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Dados mock para fallback
const mockReunioes = [
    {
        id: 1,
        titulo: 'Reunião Semanal de Qualidade',
        data_reuniao: '2024-01-15',
        participantes: ['João Silva', 'Maria Santos'],
        pauta: 'Reunião para revisar indicadores de qualidade',
        link_ata: 'https://exemplo.com/ata1.pdf'
    },
    {
        id: 2,
        titulo: 'Reunião de Planejamento',
        data_reuniao: '2024-01-20',
        participantes: ['Ana Costa', 'Pedro Lima'],
        pauta: 'Planejamento das atividades do mês',
        link_ata: 'https://exemplo.com/ata2.pdf'
    }
];

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const { id } = req.query;
        
        if (req.method === 'GET') {
            if (id) {
                // GET - Buscar reunião específica por ID
                const reuniao = mockReunioes.find(r => r.id === parseInt(id));
                if (!reuniao) {
                    return res.status(404).json({ error: 'Reunião não encontrada' });
                }
                return res.status(200).json(reuniao);
            } else {
                // GET - Buscar todas as reuniões
                return res.status(200).json(mockReunioes);
            }
            
        } else if (req.method === 'POST') {
            // POST - Adicionar nova reunião
            const newReuniao = {
                id: Math.max(...mockReunioes.map(r => r.id)) + 1,
                ...req.body
            };
            mockReunioes.push(newReuniao);
            return res.status(201).json(newReuniao);
            
        } else if (req.method === 'PUT') {
            // PUT - Atualizar reunião
            if (!id) {
                return res.status(400).json({ error: 'ID da reunião é obrigatório' });
            }
            
            const index = mockReunioes.findIndex(r => r.id === parseInt(id));
            if (index === -1) {
                return res.status(404).json({ error: 'Reunião não encontrada' });
            }
            
            mockReunioes[index] = { ...mockReunioes[index], ...req.body };
            return res.status(200).json(mockReunioes[index]);
            
        } else if (req.method === 'DELETE') {
            // DELETE - Excluir reunião
            if (!id) {
                return res.status(400).json({ error: 'ID da reunião é obrigatório' });
            }
            
            const index = mockReunioes.findIndex(r => r.id === parseInt(id));
            if (index === -1) {
                return res.status(404).json({ error: 'Reunião não encontrada' });
            }
            
            mockReunioes.splice(index, 1);
            return res.status(200).json({ message: 'Reunião excluída com sucesso' });
            
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Erro na API de reuniões:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
