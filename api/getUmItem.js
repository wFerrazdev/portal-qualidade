// api/getUmItem.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

module.exports = async (req, res) => {
    try {
        const { type, id } = req.query;
        
        if (!type || !id) {
            return res.status(400).json({ error: 'Missing required parameters: type and id' });
        }
        
        if (type !== 'projetos') {
            return res.status(400).json({ error: 'Only "projetos" type is supported' });
        }
        
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM projetos WHERE id = $1', [id]);
        client.release();
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ error: 'Failed to fetch item', details: error.message });
    }
};
