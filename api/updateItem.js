const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    try {
        const { id, table } = req.query;
        const data = req.body;

        if (!id || !table) {
            return res.status(400).json({ error: 'Missing required parameters: id and table' });
        }

        // Construir query dinamicamente baseada na tabela
        let query, values;
        
        if (table === 'projetos') {
            const { titulo, status, progresso, principais_feitos, imagem_url } = data;
            query = 'UPDATE projetos SET titulo = $1, status = $2, progresso = $3, principais_feitos = $4, imagem_url = $5 WHERE id = $6 RETURNING *';
            values = [titulo, status, progresso, principais_feitos, imagem_url, id];
        } else if (table === 'reunioes') {
            const { titulo, data_reuniao, participantes, pauta, link_ata } = data;
            query = 'UPDATE reunioes SET titulo = $1, data_reuniao = $2, participantes = $3, pauta = $4, link_ata = $5 WHERE id = $6 RETURNING *';
            values = [titulo, data_reuniao, participantes, pauta, link_ata, id];
        } else if (table === 'auditorias') {
            const { titulo, tipo, data_evento, status, responsavel, descricao } = data;
            query = 'UPDATE auditorias SET titulo = $1, tipo = $2, data_evento = $3, status = $4, responsavel = $5, descricao = $6 WHERE id = $7 RETURNING *';
            values = [titulo, tipo, data_evento, status, responsavel, descricao, id];
        } else {
            return res.status(400).json({ error: 'Unsupported table' });
        }

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item', details: error.message });
    }
};
