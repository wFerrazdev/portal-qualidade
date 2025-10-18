const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    try {
        const { id } = req.query;
        const { titulo, data_reuniao, participantes, pauta, link_ata } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Missing required parameter: id' });
        }

        const client = await pool.connect();
        const result = await client.query(
            'UPDATE reunioes SET titulo = $1, data_reuniao = $2, participantes = $3, pauta = $4, link_ata = $5 WHERE id = $6 RETURNING *',
            [titulo, data_reuniao, participantes || [], pauta || '', link_ata || '', id]
        );
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({ error: 'Failed to update meeting', details: error.message });
    }
};
