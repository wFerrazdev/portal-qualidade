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

        if (!id) {
            return res.status(400).json({ error: 'Missing required parameter: id' });
        }

        const client = await pool.connect();
        const result = await client.query('DELETE FROM reunioes WHERE id = $1 RETURNING *', [id]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.status(200).json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({ error: 'Failed to delete meeting', details: error.message });
    }
};
