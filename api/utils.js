// API Utilitária Consolidada - getUmItem, updateItem, checkReunioesTable
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const { action, table, id } = req.query;
        
        if (action === 'getItem' && req.method === 'GET') {
            // GET - Buscar um item específico
            if (!table || !id) {
                return res.status(400).json({ error: 'Table e ID são obrigatórios' });
            }
            
            const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Item não encontrado' });
            }
            
            return res.status(200).json(result.rows[0]);
            
        } else if (action === 'updateItem' && req.method === 'PUT') {
            // PUT - Atualizar item
            if (!table || !id) {
                return res.status(400).json({ error: 'Table e ID são obrigatórios' });
            }
            
            const updates = req.body;
            const fields = Object.keys(updates);
            const values = Object.values(updates);
            
            const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
            const query = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;
            
            const result = await pool.query(query, [id, ...values]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Item não encontrado' });
            }
            
            return res.status(200).json(result.rows[0]);
            
        } else if (action === 'checkTable' && req.method === 'GET') {
            // GET - Verificar se tabela existe
            if (!table) {
                return res.status(400).json({ error: 'Table é obrigatório' });
            }
            
            const result = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = $1
                );
            `, [table]);
            
            return res.status(200).json({ 
                table: table,
                exists: result.rows[0].exists 
            });
            
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Erro na API utilitária:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
