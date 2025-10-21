const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    try {
        const { titulo, tipo, data_evento, status, responsavel, descricao } = req.body;

        if (!titulo || !tipo || !data_evento) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO auditorias (titulo, tipo, data_evento, status, responsavel, descricao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [titulo, tipo, data_evento, status || 'Agendado', responsavel || '', descricao || '']
        );
        client.release();

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding audit:', error);
        res.status(500).json({ error: 'Failed to add audit', details: error.message });
    }
};
