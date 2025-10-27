// API Consolidada para Auditorias - GET, POST, PUT, DELETE
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
const mockAuditorias = [
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
                    // GET - Buscar auditoria específica por ID
                    const result = await client.query('SELECT * FROM auditorias WHERE id = $1', [id]);
                    if (result.rows.length === 0) {
                        return res.status(404).json({ error: 'Auditoria não encontrada' });
                    }
                    return res.status(200).json(result.rows[0]);
                } else {
                    // GET - Buscar todas as auditorias
                    const result = await client.query('SELECT * FROM auditorias ORDER BY data DESC');
                    return res.status(200).json(result.rows);
                }
            } catch (dbError) {
                console.error('Erro de conexão com banco:', dbError);
                // Fallback para dados mock
                if (id) {
                    const auditoria = mockAuditorias.find(a => a.id === parseInt(id));
                    if (!auditoria) {
                        return res.status(404).json({ error: 'Auditoria não encontrada' });
                    }
                    return res.status(200).json(auditoria);
                } else {
                    return res.status(200).json(mockAuditorias);
                }
            }
            
        } else if (req.method === 'POST') {
            // POST - Adicionar nova auditoria
            try {
                client = await pool.connect();
                const { tipo, data, responsavel, status, area, descricao } = req.body;
                
                const result = await client.query(
                    'INSERT INTO auditorias (tipo, data, responsavel, status, area, descricao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [tipo, data, responsavel, status, area, descricao]
                );
                
                return res.status(201).json(result.rows[0]);
            } catch (dbError) {
                console.error('Erro de conexão com banco:', dbError);
                // Fallback para dados mock
                const newAuditoria = {
                    id: Math.max(...mockAuditorias.map(a => a.id)) + 1,
                    ...req.body
                };
                mockAuditorias.push(newAuditoria);
                return res.status(201).json(newAuditoria);
            }
            
        } else if (req.method === 'PUT') {
            // PUT - Atualizar auditoria
            if (!id) {
                return res.status(400).json({ error: 'ID da auditoria é obrigatório' });
            }
            
            try {
                client = await pool.connect();
                const { tipo, data, responsavel, status, area, descricao } = req.body;
                
                const result = await client.query(
                    'UPDATE auditorias SET tipo = $1, data = $2, responsavel = $3, status = $4, area = $5, descricao = $6 WHERE id = $7 RETURNING *',
                    [tipo, data, responsavel, status, area, descricao, id]
                );
                
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Auditoria não encontrada' });
                }
                
                return res.status(200).json(result.rows[0]);
            } catch (dbError) {
                console.error('Erro de conexão com banco:', dbError);
                // Fallback para dados mock
                const index = mockAuditorias.findIndex(a => a.id === parseInt(id));
                if (index === -1) {
                    return res.status(404).json({ error: 'Auditoria não encontrada' });
                }
                mockAuditorias[index] = { ...mockAuditorias[index], ...req.body };
                return res.status(200).json(mockAuditorias[index]);
            }
            
        } else if (req.method === 'DELETE') {
            // DELETE - Excluir auditoria
            if (!id) {
                return res.status(400).json({ error: 'ID da auditoria é obrigatório' });
            }
            
            try {
                client = await pool.connect();
                const result = await client.query('DELETE FROM auditorias WHERE id = $1 RETURNING *', [id]);
                
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Auditoria não encontrada' });
                }
                
                return res.status(200).json({ message: 'Auditoria excluída com sucesso' });
            } catch (dbError) {
                console.error('Erro de conexão com banco:', dbError);
                // Fallback para dados mock
                const index = mockAuditorias.findIndex(a => a.id === parseInt(id));
                if (index === -1) {
                    return res.status(404).json({ error: 'Auditoria não encontrada' });
                }
                mockAuditorias.splice(index, 1);
                return res.status(200).json({ message: 'Auditoria excluída com sucesso' });
            }
            
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Erro na API de auditorias:', error);
        return res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
    } finally {
        if (client) {
            client.release();
        }
    }
};
