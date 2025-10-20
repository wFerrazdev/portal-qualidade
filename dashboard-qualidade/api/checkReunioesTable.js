// API para verificar se a tabela reunioes existe
module.exports = async (req, res) => {
    try {
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        console.log('=== VERIFICANDO TABELA REUNIOES ===');
        
        // Verificar se a tabela existe
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'reunioes'
            );
        `);
        
        console.log('Tabela reunioes existe:', tableCheck.rows[0].exists);
        
        if (tableCheck.rows[0].exists) {
            // Se existe, verificar estrutura
            const structure = await pool.query(`
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'reunioes' 
                ORDER BY ordinal_position;
            `);
            
            console.log('Estrutura da tabela reunioes:', structure.rows);
            
            // Tentar buscar dados
            const data = await pool.query('SELECT * FROM reunioes LIMIT 5');
            console.log('Dados da tabela (primeiros 5):', data.rows);
            
            res.status(200).json({
                tableExists: true,
                structure: structure.rows,
                sampleData: data.rows
            });
        } else {
            console.log('Tabela reunioes NÃO existe');
            res.status(200).json({
                tableExists: false,
                message: 'Tabela reunioes não existe no banco de dados'
            });
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('Erro ao verificar tabela reunioes:', error);
        res.status(500).json({ 
            error: 'Erro ao verificar tabela', 
            details: error.message 
        });
    }
};
