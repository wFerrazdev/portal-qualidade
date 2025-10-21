const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    const { httpMethod, path, body, queryStringParameters } = event;
    
    try {
        const client = await pool.connect();
        
        // Roteamento baseado no método HTTP e path
        if (httpMethod === 'GET' && path === '/api/compras') {
            // GET /api/compras - Buscar todos os pedidos
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
