// API Consolidada para Compras - GET, POST, PUT, DELETE
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    let client;
        // Validação de status válidos
        const validStatuses = [
            'AGUARDANDO_APROVACAO_SC', 'SC_APROVADA', 'AGUARDANDO_APROVACAO_OC', 'OC_APROVADA',
            'PEDIDO_EMITIDO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'AGUARDANDO_ENTREGA', 'ENTREGUE',
            'REJEITADO', 'CANCELADO', 'EM_ANALISE', 'AGUARDANDO_APROVACAO', 'APROVADO', 'CONCLUIDO'
        ];

        try {
        const { id, numero, action } = req.query;
        
        if (req.method === 'GET') {
            client = await pool.connect();
            
            if (action === 'history') {
                // GET - Buscar histórico de um pedido específico
                if (!numero) {
                    return res.status(400).json({ error: 'Número do pedido é obrigatório' });
                }
                
                const result = await client.query(
                    'SELECT * FROM historico_pedidos WHERE pedido_id = (SELECT id FROM pedidos_compras WHERE numero = $1) ORDER BY data_mudanca DESC',
                    [numero]
                );
                
                return res.status(200).json(result.rows);
            } else if (id) {
                // GET - Buscar pedido específico por ID
                const result = await client.query('SELECT * FROM pedidos_compras WHERE id = $1', [id]);
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Pedido não encontrado' });
                }
                return res.status(200).json(result.rows[0]);
            } else {
                // GET - Buscar todos os pedidos
                const result = await client.query('SELECT * FROM pedidos_compras ORDER BY data_criacao ASC');
                console.log('📊 Total de pedidos encontrados:', result.rows.length);
                console.log('📋 Primeiro pedido completo:', result.rows[0]);
                console.log('📋 Campos disponíveis:', result.rows[0] ? Object.keys(result.rows[0]) : 'Nenhum pedido');
                
                return res.status(200).json(result.rows);
            }
            
        } else if (req.method === 'POST') {
            // POST - Adicionar novo pedido
            client = await pool.connect();
            const { numero, descricao, fornecedor, valor, quantidade, status, solicitante, observacoes } = req.body;
            
            console.log('📝 Dados recebidos para criar pedido:', req.body);
            
            // Validar status
            const finalStatus = status || 'AGUARDANDO_APROVACAO_SC';
            if (!validStatuses.includes(finalStatus)) {
                return res.status(400).json({ error: `Status inválido: ${finalStatus}. Status válidos: ${validStatuses.join(', ')}` });
            }
            
            // Verificar se já existe um pedido com este número
            if (numero) {
                const duplicateCheck = await client.query(
                    'SELECT id FROM pedidos_compras WHERE numero = $1',
                    [numero]
                );
                if (duplicateCheck.rows.length > 0) {
                    return res.status(409).json({ error: 'Já existe uma solicitação com este número. Escolha outro número.' });
                }
            }
            
            try {
                const result = await client.query(
                    'INSERT INTO pedidos_compras (numero, descricao, fornecedor, valor, quantidade, status, solicitante, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                    [numero, descricao, fornecedor, valor, quantidade || 1, finalStatus, solicitante || 'Qualidade', observacoes]
                );
                
                console.log('✅ Pedido criado com sucesso:', result.rows[0]);
                return res.status(201).json(result.rows[0]);
            } catch (dbError) {
                // Capturar erro de constraint UNIQUE do PostgreSQL
                if (dbError.code === '23505' || dbError.message.includes('unique') || dbError.message.includes('duplicate')) {
                    return res.status(409).json({ error: 'Já existe uma solicitação com este número. Escolha outro número.' });
                }
                throw dbError; // Re-lançar se não for erro de duplicidade
            }
            
        } else if (req.method === 'PUT') {
            // PUT - Atualizar pedido
            if (!id) {
                return res.status(400).json({ error: 'ID do pedido é obrigatório' });
            }
            
            client = await pool.connect();
            console.log('🔄 Recebendo atualização de pedido. ID:', id);
            console.log('📝 Dados recebidos:', req.body);
            
            // Se está recebendo apenas status (do avançar/regredir etapa)
            if (req.body.newStatus) {
                const newStatus = req.body.newStatus;
                console.log('📌 Atualizando apenas status para:', newStatus);
                
                // Validar status
                if (!validStatuses.includes(newStatus)) {
                    return res.status(400).json({ error: `Status inválido: ${newStatus}. Status válidos: ${validStatuses.join(', ')}` });
                }
                
                const result = await client.query(
                    'UPDATE pedidos_compras SET status = $1 WHERE id = $2 RETURNING *',
                    [newStatus, id]
                );
                
                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Pedido não encontrado' });
                }
                
                console.log('✅ Pedido atualizado:', result.rows[0]);
                return res.status(200).json(result.rows[0]);
            }
            
            // Atualização completa do pedido
            const { numero, descricao, fornecedor, valor, quantidade, status, solicitante, observacoes } = req.body;
            
            console.log('📝 Atualizando pedido completo. Dados:', req.body);
            
            // Buscar o pedido atual para manter o status se não for enviado
            const currentOrder = await client.query('SELECT * FROM pedidos_compras WHERE id = $1', [id]);
            if (currentOrder.rows.length === 0) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }
            
            // Se status não foi enviado, manter o atual
            const finalStatus = status || currentOrder.rows[0].status;
            
            // Validar status apenas se foi enviado
            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({ error: `Status inválido: ${status}. Status válidos: ${validStatuses.join(', ')}` });
            }
            
            // Verificar se o número foi alterado e se já existe outro pedido com esse número
            if (numero && numero !== currentOrder.rows[0].numero) {
                const duplicateCheck = await client.query(
                    'SELECT id FROM pedidos_compras WHERE numero = $1 AND id != $2',
                    [numero, id]
                );
                if (duplicateCheck.rows.length > 0) {
                    return res.status(409).json({ error: 'Já existe uma solicitação com este número. Escolha outro.' });
                }
            }
            
            try {
                const result = await client.query(
                    'UPDATE pedidos_compras SET numero = $1, descricao = $2, fornecedor = $3, valor = $4, quantidade = $5, status = $6, solicitante = $7, observacoes = $8 WHERE id = $9 RETURNING *',
                    [numero, descricao, fornecedor, valor, quantidade || currentOrder.rows[0].quantidade || 1, finalStatus, solicitante, observacoes, id]
                );
                
                console.log('✅ Pedido atualizado:', result.rows[0]);
                return res.status(200).json(result.rows[0]);
            } catch (dbError) {
                // Capturar erro de constraint UNIQUE do PostgreSQL
                if (dbError.code === '23505' || dbError.message.includes('unique') || dbError.message.includes('duplicate')) {
                    return res.status(409).json({ error: 'Já existe uma solicitação com este número. Escolha outro.' });
                }
                throw dbError; // Re-lançar se não for erro de duplicidade
            }
            
        } else if (req.method === 'DELETE') {
            // DELETE - Excluir pedido
            if (!id) {
                return res.status(400).json({ error: 'ID do pedido é obrigatório' });
            }
            
            client = await pool.connect();
            const result = await client.query('DELETE FROM pedidos_compras WHERE id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }
            
            return res.status(200).json({ message: 'Pedido excluído com sucesso' });
            
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Erro na API de compras:', error);
        return res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
    } finally {
        if (client) {
            client.release();
        }
    }
};