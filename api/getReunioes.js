const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    try {
        console.log('=== API GETREUNIOES INICIADA ===');
        console.log('Método:', req.method);
        console.log('URL:', req.url);
        console.log('Headers:', req.headers);
        
        console.log('Conectando ao banco...');
        const client = await pool.connect();
        console.log('Conexão estabelecida');
        
        console.log('Executando query: SELECT * FROM reunioes ORDER BY data_reuniao DESC');
        const result = await client.query('SELECT * FROM reunioes ORDER BY data_reuniao DESC');
        console.log('Query executada com sucesso');
        console.log('Número de reuniões encontradas:', result.rows.length);
        console.log('Reuniões:', result.rows);
        
        client.release();
        console.log('Conexão liberada');

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Failed to fetch meetings', details: error.message });
    }
};
