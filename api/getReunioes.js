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
        const result = await client.query('SELECT * FROM reunioes ORDER BY data_reuniao DESC');
        client.release();

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings', details: error.message });
    }
};
