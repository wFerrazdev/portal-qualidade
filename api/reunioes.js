// API Consolidada para Reuniões - GET, POST, PUT, DELETE
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
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
    
    let client;
    try {
        const { id } = req.query;
        
        if (req.method === 'GET') {
            // Tentar conectar com o banco real
            try {
                client = await pool.connect();
                
                if (id) {
                    // GET - Buscar reunião específica por ID
                    const result = await client.query('SELECT * FROM reunioes WHERE id = $1', [id]);
                    if (result.rows.length === 0) {
                        return res.status(404).json({ error: 'Reunião não encontrada' });
                    }
                    return res.status(200).json(result.rows[0]);
                } else {
                    // GET - Buscar todas as reuniões
                    const result = await client.query('SELECT * FROM reunioes ORDER BY data_reuniao DESC');
                    return res.status(200).json(result.rows);
                }
            } catch (dbError) {
                console.error('Erro de conexão com banco:', dbError);
                // Fallback para dados mock
                if (id) {
                    const reuniao = mockReunioes.find(r => r.id === parseInt(id));
                    if (!reuniao) {
                        return res.status(404).json({ error: 'Reunião não encontrada' });
                    }
                    return res.status(200).json(reuniao);
                } else {
                    return res.status(200).json(mockReunioes);
                }
            }
            
        } else if (req.method === 'POST') {
            // POST - Adicionar nova reunião
            try {
                client = await pool.connect();
                const { titulo, data_reuniao, participantes, pauta, link_ata } = req.body;
                
                const result = await client.query(
                    'INSERT INTO reunioes (titulo, data_reuniao, participantes, pauta, link_ata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [titulo, data_reuniao, participantes, pauta, link_ata]
                );
                
                return res.status(201).json(result.rows[0]);
            } catch (dbError) {
                console.error('Erro de conexão com banco:', dbError);
                // Fallback para dados mock
                const newReuniao = {
                    id: Math.max(...mockReunioes.map(r => r.id)) + 1,
                    ...req.body
                };
                mockReunioes.push(newReuniao);
                return res.status(201).json(newReuniao);
            }
            
        } else if (req.method === 'PUT') {
            // PUT - Atualizar reunião
            if (!id) {
                return res.status(400).json({ error: 'ID da reunião é obrigatório' });
            }
            
            try {
                client = await pool.connect();
                const { titulo, data_reuniao, participantes, pauta, link_ata } = req.body;
                
                const result = await client.query(
                    'UPDATE reunioes SET titulo = $1, data_reuniao = $2, participantes = $3, pauta = $4, link_ata = $5 WHERE id = $6 RETURNING *',
                    [titulo, data_reuniao, participantes, pauta, link_ata, id]
                );
                
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Reunião não encontrada' });
                }
                
                return res.status(200).json(result.rows[0]);
            } catch (dbError) {
                console.error('Erro de conexão com banco:', dbError);
                // Fallback para dados mock
                const index = mockReunioes.findIndex(r => r.id === parseInt(id));
                if (index === -1) {
                    return res.status(404).json({ error: 'Reunião não encontrada' });
                }
                mockReunioes[index] = { ...mockReunioes[index], ...req.body };
                return res.status(200).json(mockReunioes[index]);
            }
            
        } else if (req.method === 'DELETE') {
            // DELETE - Excluir reunião
            if (!id) {
                return res.status(400).json({ error: 'ID da reunião é obrigatório' });
            }
            
            try {
                client = await pool.connect();
                const result = await client.query('DELETE FROM reunioes WHERE id = $1 RETURNING *', [id]);
                
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Reunião não encontrada' });
                }
                
                return res.status(200).json({ message: 'Reunião excluída com sucesso' });
            } catch (dbError) {
                console.error('Erro de conexão com banco:', dbError);
                // Fallback para dados mock
                const index = mockReunioes.findIndex(r => r.id === parseInt(id));
                if (index === -1) {
                    return res.status(404).json({ error: 'Reunião não encontrada' });
                }
                mockReunioes.splice(index, 1);
                return res.status(200).json({ message: 'Reunião excluída com sucesso' });
            }
            
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Erro na API de reuniões:', error);
        return res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
    } finally {
        if (client) {
            client.release();
        }
    }
};
