const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM auditorias ORDER BY data_evento DESC');
        client.release();

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching audits:', error);
        res.status(500).json({ error: 'Failed to fetch audits', details: error.message });
    }
};
