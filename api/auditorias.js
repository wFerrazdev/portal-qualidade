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
        titulo: 'Auditoria Interna de Processos',
        tipo: 'Auditoria Interna',
        data_evento: '2025-12-15',
        responsavel: 'João Silva',
        status: 'Planejada',
        area: 'Qualidade',
        descricao: 'Auditoria interna do sistema de qualidade'
    },
    {
        id: 2,
        titulo: 'Visita Técnica - Área de Produção',
        tipo: 'Visita Técnica',
        data_evento: '2025-12-20',
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
                    const result = await client.query('SELECT * FROM auditorias ORDER BY data_evento DESC NULLS LAST');
                    console.log('📊 Total de auditorias encontradas:', result.rows.length);
                    console.log('📝 Dados:', JSON.stringify(result.rows, null, 2));
                    
                    return res.status(200).json(result.rows);
                }
            
        } else if (req.method === 'POST') {
            // POST - Adicionar nova auditoria
            client = await pool.connect();
            const { titulo, tipo, data_evento, responsavel, status, descricao } = req.body;
            
            const result = await client.query(
                'INSERT INTO auditorias (titulo, tipo, data_evento, responsavel, status, descricao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [titulo, tipo, data_evento, responsavel, status, descricao]
            );
            
            return res.status(201).json(result.rows[0]);
            
        } else if (req.method === 'PUT') {
            // PUT - Atualizar auditoria
            if (!id) {
                return res.status(400).json({ error: 'ID da auditoria é obrigatório' });
            }
            
            client = await pool.connect();
            const { titulo, tipo, data_evento, responsavel, status, descricao } = req.body;
            
            const result = await client.query(
                'UPDATE auditorias SET titulo = $1, tipo = $2, data_evento = $3, responsavel = $4, status = $5, descricao = $6 WHERE id = $7 RETURNING *',
                [titulo, tipo, data_evento, responsavel, status, descricao, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Auditoria não encontrada' });
            }
            
            return res.status(200).json(result.rows[0]);
            
        } else if (req.method === 'DELETE') {
            // DELETE - Excluir auditoria
            if (!id) {
                return res.status(400).json({ error: 'ID da auditoria é obrigatório' });
            }
            
            client = await pool.connect();
            const result = await client.query('DELETE FROM auditorias WHERE id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Auditoria não encontrada' });
            }
            
            return res.status(200).json({ message: 'Auditoria excluída com sucesso' });
            
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
