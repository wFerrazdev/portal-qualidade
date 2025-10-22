// API de Compras - Versão Simples e Robusta
exports.handler = async (event, context) => {
    const { httpMethod, path, body, queryStringParameters } = event;
    
    try {
        console.log('🔗 API Compras - Iniciando...');
        console.log('📡 Método:', httpMethod, 'Path:', path);
        
        // Dados simulados (funcionando sem banco por enquanto)
        const pedidos = [
            {
                id: 1,
                numero: 'SC-001',
                descricao: 'Equipamentos de laboratório',
                fornecedor: 'LabTech Solutions',
                valor: 15000.00,
                status: 'AGUARDANDO_APROVACAO',
                solicitante: 'Qualidade',
                observacoes: 'Equipamentos para novo laboratório',
                dataCriacao: new Date().toISOString()
            },
            {
                id: 2,
                numero: 'SC-002',
                descricao: 'Material de consumo',
                fornecedor: 'SupplyCorp',
                valor: 2500.00,
                status: 'APROVADO',
                solicitante: 'Qualidade',
                observacoes: 'Material para testes de qualidade',
                dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                numero: 'SC-003',
                descricao: 'Software de gestão',
                fornecedor: 'TechSoft',
                valor: 5000.00,
                status: 'EM_ANALISE',
                solicitante: 'Qualidade',
                observacoes: 'Licenças de software',
                dataCriacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        // GET /api/compras - Listar pedidos
        if (httpMethod === 'GET' && path === '/api/compras') {
            console.log('✅ Retornando lista de pedidos');
            return {
                statusCode: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify(pedidos)
            };
        }
        
        // POST /api/compras - Criar pedido
        else if (httpMethod === 'POST' && path === '/api/compras') {
            console.log('✅ Criando novo pedido');
            const novoPedido = {
                id: pedidos.length + 1,
                numero: `SC-${String(pedidos.length + 1).padStart(3, '0')}`,
                descricao: 'Novo pedido criado',
                fornecedor: 'Fornecedor Teste',
                valor: 1000.00,
                status: 'AGUARDANDO_APROVACAO',
                solicitante: 'Qualidade',
                observacoes: 'Pedido criado via API',
                dataCriacao: new Date().toISOString()
            };
            
            return {
                statusCode: 201,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: true, 
                    pedido: novoPedido,
                    message: 'Pedido criado com sucesso'
                })
            };
        }
        
        // PUT /api/compras - Atualizar status
        else if (httpMethod === 'PUT' && path === '/api/compras') {
            console.log('✅ Atualizando status do pedido');
            return {
                statusCode: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: true,
                    message: 'Status atualizado com sucesso'
                })
            };
        }
        
        // GET /api/compras/history - Histórico do pedido
        else if (httpMethod === 'GET' && path === '/api/compras/history') {
            console.log('✅ Retornando histórico do pedido');
            const historico = [
                {
                    id: 1,
                    pedidoId: 1,
                    statusAnterior: null,
                    statusNovo: 'AGUARDANDO_APROVACAO',
                    observacao: 'Solicitação de compra criada pelo setor de Qualidade',
                    dataMudanca: new Date().toISOString(),
                    usuario: 'Sistema'
                }
            ];
            
            return {
                statusCode: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(historico)
            };
        }
        
        // OPTIONS - CORS preflight
        else if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: ''
            };
        }
        
        // Endpoint não encontrado
        else {
            console.log('❌ Endpoint não encontrado');
            return {
                statusCode: 404,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Endpoint não encontrado',
                    message: 'Verifique a URL e método HTTP'
                })
            };
        }
        
    } catch (error) {
        console.error('❌ Erro na API de Compras:', error);
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Erro interno do servidor',
                message: error.message,
                stack: error.stack
            })
        };
    }
};