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

        if (!id || !table) {
            return res.status(400).json({ error: 'Missing required parameters: id and table' });
        }

        // Construir query dinamicamente baseada na tabela
        let query;
        
        if (table === 'projetos') {
            query = 'DELETE FROM projetos WHERE id = $1 RETURNING *';
        } else if (table === 'reunioes') {
            query = 'DELETE FROM reunioes WHERE id = $1 RETURNING *';
        } else if (table === 'auditorias') {
            query = 'DELETE FROM auditorias WHERE id = $1 RETURNING *';
        } else {
            return res.status(400).json({ error: 'Unsupported table' });
        }

        const client = await pool.connect();
        const result = await client.query(query, [id]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item', details: error.message });
    }
};
