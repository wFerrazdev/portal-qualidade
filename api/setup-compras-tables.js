const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    try {
        const client = await pool.connect();
        
        // Criar tabela de pedidos se não existir
        await client.query(`
            CREATE TABLE IF NOT EXISTS compras_pedidos (
                numero SERIAL PRIMARY KEY,
                descricao VARCHAR(255) NOT NULL,
                fornecedor VARCHAR(255) NOT NULL,
                valor DECIMAL(10, 2) NOT NULL,
                observacoes TEXT,
                status VARCHAR(50) NOT NULL,
                data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Criar tabela de histórico se não existir
        await client.query(`
            CREATE TABLE IF NOT EXISTS compras_historico (
                id SERIAL PRIMARY KEY,
                numero_pedido INTEGER NOT NULL,
                data_mudanca TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                status_anterior VARCHAR(50),
                status_novo VARCHAR(50) NOT NULL,
                observacao TEXT,
                FOREIGN KEY (numero_pedido) REFERENCES compras_pedidos(numero) ON DELETE CASCADE
            );
        `);
        
        // Criar índices para otimização
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_compras_pedidos_status ON compras_pedidos (status);
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_compras_historico_numero ON compras_historico (numero_pedido);
        `);
        
        // Inserir dados de exemplo se a tabela estiver vazia
        const countResult = await client.query('SELECT COUNT(*) as total FROM compras_pedidos');
        const totalRecords = parseInt(countResult.rows[0].total);
        
        if (totalRecords === 0) {
            await client.query(`
                INSERT INTO compras_pedidos (numero, descricao, fornecedor, valor, observacoes, status, data_criacao) VALUES
                (1001, 'Equipamentos de laboratório', 'LabTech Solutions', 15000.00, 'Equipamentos para novo laboratório', 'AGUARDANDO_APROVACAO_SC', NOW() - INTERVAL '5 days'),
                (1002, 'Material de consumo', 'SupplyCorp', 2500.00, 'Material para testes de qualidade', 'SC_APROVADA', NOW() - INTERVAL '3 days'),
                (1003, 'Software de gestão', 'TechSoft', 5000.00, 'Licenças de software', 'EM_ANALISE', NOW() - INTERVAL '1 day');
            `);
            
            await client.query(`
                INSERT INTO compras_historico (numero_pedido, data_mudanca, status_anterior, status_novo, observacao) VALUES
                (1001, NOW() - INTERVAL '5 days', NULL, 'AGUARDANDO_APROVACAO_SC', 'Solicitação de compra criada pelo setor de Qualidade'),
                (1002, NOW() - INTERVAL '3 days', NULL, 'AGUARDANDO_APROVACAO_SC', 'Solicitação de compra criada pelo setor de Qualidade'),
                (1002, NOW() - INTERVAL '2 days', 'AGUARDANDO_APROVACAO_SC', 'SC_APROVADA', 'Aprovado pelo Supervisor de Compras'),
                (1003, NOW() - INTERVAL '1 day', NULL, 'EM_ANALISE', 'Solicitação de compra criada pelo setor de Qualidade');
            `);
        }
        
        client.release();
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: true,
                message: 'Tabelas criadas/verificadas com sucesso',
                totalRecords: totalRecords
            })
        };
        
    } catch (error) {
        console.error('Erro ao configurar banco:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: 'Erro ao configurar banco',
                details: error.message 
            })
        };
    }
};
