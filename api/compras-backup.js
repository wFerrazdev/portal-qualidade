const { Pool } = require('pg');

// Configuração mais robusta do pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 1, // Limitar conexões
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

exports.handler = async (event, context) => {
    const { httpMethod, path, body, queryStringParameters } = event;
    
    try {
        console.log('🔗 Conectando ao banco...');
        console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');
        const client = await pool.connect();
        console.log('✅ Conexão estabelecida');
        
        // Verificar se as tabelas existem
        console.log('📋 Verificando tabelas...');
        const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'compras_pedidos'
        `);
        
        if (tableCheck.rows.length === 0) {
            console.log('📝 Criando tabela compras_pedidos...');
            await client.query(`
                CREATE TABLE compras_pedidos (
                    numero SERIAL PRIMARY KEY,
                    descricao VARCHAR(255) NOT NULL,
                    fornecedor VARCHAR(255) NOT NULL,
                    valor DECIMAL(10, 2) NOT NULL,
                    observacoes TEXT,
                    status VARCHAR(50) NOT NULL,
                    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            console.log('📝 Criando tabela compras_historico...');
            await client.query(`
                CREATE TABLE compras_historico (
                    id SERIAL PRIMARY KEY,
                    numero_pedido INTEGER NOT NULL,
                    data_mudanca TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    status_anterior VARCHAR(50),
                    status_novo VARCHAR(50) NOT NULL,
                    observacao TEXT
                );
            `);
            console.log('✅ Tabelas criadas');
        } else {
            console.log('✅ Tabelas já existem');
        }
        
        // Roteamento baseado no método HTTP e path
        if (httpMethod === 'GET' && path === '/api/compras') {
            console.log('📊 Verificando dados existentes...');
            // Verificar se há dados e inserir exemplos se necessário
            const countResult = await client.query('SELECT COUNT(*) as total FROM compras_pedidos');
            const totalRecords = parseInt(countResult.rows[0].total);
            console.log(`📈 Total de registros: ${totalRecords}`);
            
            if (totalRecords === 0) {
                console.log('📝 Inserindo dados de exemplo...');
                try {
                    // Inserir apenas um pedido de exemplo
                    await client.query(`
                        INSERT INTO compras_pedidos (descricao, fornecedor, valor, observacoes, status) VALUES
                        ('Equipamentos de laboratório', 'LabTech Solutions', 15000.00, 'Equipamentos para novo laboratório', 'AGUARDANDO_APROVACAO_SC')
                    `);
                    console.log('✅ Dados de exemplo inseridos');
                } catch (insertError) {
                    console.log('⚠️ Erro ao inserir dados de exemplo:', insertError.message);
                }
            }
            
            // Buscar todos os pedidos
            console.log('🔍 Buscando pedidos...');
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
            console.log(`✅ Encontrados ${result.rows.length} pedidos`);
            
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
        console.error('❌ Erro na API de compras:', error);
        console.error('❌ Stack trace:', error.stack);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: 'Erro interno do servidor',
                message: error.message,
                details: error.stack
            })
        };
    }
};
