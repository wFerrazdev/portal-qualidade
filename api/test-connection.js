const { Pool } = require('pg');

exports.handler = async (event, context) => {
    try {
        console.log('🔗 Testando conexão com banco...');
        console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');
        
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            },
            max: 1,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        
        const client = await pool.connect();
        console.log('✅ Conexão estabelecida');
        
        // Teste simples
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Query executada:', result.rows[0]);
        
        client.release();
        await pool.end();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: true,
                message: 'Conexão com banco funcionando',
                currentTime: result.rows[0].current_time
            })
        };
        
    } catch (error) {
        console.error('❌ Erro na conexão:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: 'Erro na conexão',
                message: error.message,
                stack: error.stack
            })
        };
    }
};
