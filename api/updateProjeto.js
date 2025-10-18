// api/updateProjeto.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

module.exports = async (req, res) => {
    try {
        const { id } = req.query;
        const { titulo, descricao, status, progresso, responsavel, data_inicio, data_fim, imagem_url } = req.body;
        
        if (!id) {
            return res.status(400).json({ error: 'Missing required parameter: id' });
        }
        
        const client = await pool.connect();
        const result = await client.query(
            'UPDATE projetos SET titulo = $1, descricao = $2, status = $3, progresso = $4, responsavel = $5, data_inicio = $6, data_fim = $7, imagem_url = $8 WHERE id = $9 RETURNING *',
            [titulo, descricao, status, progresso, responsavel, data_inicio, data_fim, imagem_url, id]
        );
        client.release();
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project', details: error.message });
    }
};
