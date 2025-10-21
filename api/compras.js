// API Consolidada para Compras - Gerencia todas as operações de compras
exports.handler = async (event, context) => {
    const { httpMethod, path, body, queryStringParameters } = event;
    
    try {
        console.log('🔗 API Compras - Iniciando...');
        console.log('📡 Método:', httpMethod, 'Path:', path);
        
        // Dados simulados para compras
        const dadosCompras = [
            {
                numero: 1001,
                descricao: 'Equipamentos de laboratório',
                fornecedor: 'LabTech Solutions',
                valor: 15000.00,
                status: 'AGUARDANDO_APROVACAO_SC',
                dataCriacao: new Date().toISOString(),
                observacoes: 'Equipamentos para novo laboratório'
            },
            {
                numero: 1002,
                descricao: 'Material de consumo',
                fornecedor: 'SupplyCorp',
                valor: 2500.00,
                status: 'SC_APROVADA',
                dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                observacoes: 'Material para testes de qualidade'
            },
            {
                numero: 1003,
                descricao: 'Software de gestão',
                fornecedor: 'TechSoft',
                valor: 5000.00,
                status: 'EM_ANALISE',
                dataCriacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                observacoes: 'Licenças de software'
            }
        ];
        
        if (httpMethod === 'GET' && path === '/api/compras') {
            console.log('✅ Retornando dados de compras');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCompras)
            };
        }
        
        else if (httpMethod === 'POST' && path === '/api/compras') {
            console.log('✅ Criando novo pedido');
            const novoPedido = {
                numero: 1000 + Math.floor(Math.random() * 9000),
                descricao: 'Novo pedido criado',
                fornecedor: 'Fornecedor Teste',
                valor: 1000.00,
                status: 'AGUARDANDO_APROVACAO_SC',
                dataCriacao: new Date().toISOString(),
                observacoes: 'Pedido criado via API'
            };
            
            return {
                statusCode: 201,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true, pedido: novoPedido })
            };
        }
        
        else if (httpMethod === 'PUT' && path === '/api/compras') {
            console.log('✅ Atualizando status do pedido');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true })
            };
        }
        
        else if (httpMethod === 'GET' && path === '/api/compras/history') {
            console.log('✅ Retornando histórico do pedido');
            const historico = [
                {
                    dataMudanca: new Date().toISOString(),
                    statusAnterior: null,
                    statusNovo: 'AGUARDANDO_APROVACAO_SC',
                    observacao: 'Solicitação de compra criada pelo setor de Qualidade'
                }
            ];
            
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(historico)
            };
        }
        
        else {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Endpoint não encontrado' })
            };
        }
        
    } catch (error) {
        console.error('❌ Erro na API de Compras:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: 'Erro interno do servidor',
                message: error.message
            })
        };
    }
};
