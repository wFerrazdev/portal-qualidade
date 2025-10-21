const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    const { httpMethod, path, body, queryStringParameters } = event;
    
    try {
        const client = await pool.connect();
        
        // Verificar e criar tabelas se necessário (apenas na primeira execução)
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
        
        // Roteamento baseado no método HTTP e path
        if (httpMethod === 'GET' && path === '/api/compras') {
            // Verificar se há dados e inserir exemplos se necessário
            const countResult = await client.query('SELECT COUNT(*) as total FROM compras_pedidos');
            const totalRecords = parseInt(countResult.rows[0].total);
            
            if (totalRecords === 0) {
                // Inserir dados de exemplo
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
            
            // Buscar todos os pedidos
            const result = await client.query(`
                SELECT 
                    numero,
                    descricao,
                    fornecedor,
                    valor,
                    status,
                    data_criacao as "dataCriacao",
                    observacoes
                FROM compras_pedidos 
                ORDER BY data_criacao DESC
            `);
            
            client.release();
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.rows)
            };
        }
        
        else if (httpMethod === 'GET' && path === '/api/compras/history') {
            // GET /api/compras/history?numero=1001 - Buscar histórico
            const { numero } = queryStringParameters || {};
            
            if (!numero) {
                client.release();
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Número do pedido é obrigatório' })
                };
            }
            
            const result = await client.query(`
                SELECT 
                    status_anterior as "statusAnterior",
                    status_novo as "statusNovo",
                    data_mudanca as "dataMudanca",
                    observacao
                FROM compras_historico 
                WHERE numero_pedido = $1
                ORDER BY data_mudanca ASC
            `, [numero]);
            
            client.release();
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.rows)
            };
        }
        
        else if (httpMethod === 'POST' && path === '/api/compras') {
            // POST /api/compras - Adicionar pedido
            const order = JSON.parse(body);
            
            const pedidoResult = await client.query(`
                INSERT INTO compras_pedidos (numero, descricao, fornecedor, valor, status, data_criacao, observacoes)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [
                order.numero,
                order.descricao,
                order.fornecedor,
                order.valor,
                order.status,
                order.dataCriacao,
                order.observacoes
            ]);
            
            // Inserir histórico inicial
            if (order.historico && order.historico.length > 0) {
                const historico = order.historico[0];
                await client.query(`
                    INSERT INTO compras_historico (numero_pedido, status_anterior, status_novo, data_mudanca, observacao)
                    VALUES ($1, $2, $3, $4, $5)
                `, [
                    order.numero,
                    null,
                    historico.status,
                    historico.data,
                    historico.observacao
                ]);
            }
            
            client.release();
            return {
                statusCode: 201,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true, pedido: pedidoResult.rows[0] })
            };
        }
        
        else if (httpMethod === 'PUT' && path === '/api/compras') {
            // PUT /api/compras - Atualizar status
            const { numero, newStatus, observacao } = JSON.parse(body);
            
            // Buscar status atual
            const currentOrder = await client.query(`
                SELECT status FROM compras_pedidos WHERE numero = $1
            `, [numero]);
            
            if (currentOrder.rows.length === 0) {
                client.release();
                return {
                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Pedido não encontrado' })
                };
            }
            
            const currentStatus = currentOrder.rows[0].status;
            
            // Atualizar status do pedido
            await client.query(`
                UPDATE compras_pedidos 
                SET status = $1 
                WHERE numero = $2
            `, [newStatus, numero]);
            
            // Adicionar ao histórico
            await client.query(`
                INSERT INTO compras_historico (numero_pedido, status_anterior, status_novo, data_mudanca, observacao)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                numero,
                currentStatus,
                newStatus,
                new Date().toISOString(),
                observacao || `Status alterado de ${currentStatus} para ${newStatus}`
            ]);
            
            client.release();
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true })
            };
        }
        
        else {
            client.release();
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Endpoint não encontrado' })
            };
        }
        
    } catch (error) {
        console.error('Erro na API de compras:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
    }
};
