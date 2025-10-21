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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { titulo, data_reuniao, participantes, pauta, link_ata } = req.body;

        if (!titulo || !data_reuniao) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO reunioes (titulo, data_reuniao, participantes, pauta, link_ata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [titulo, data_reuniao, participantes || [], pauta || '', link_ata || '']
        );
        client.release();

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding meeting:', error);
        res.status(500).json({ error: 'Failed to add meeting', details: error.message });
    }
};
