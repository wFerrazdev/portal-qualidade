exports.handler = async (event, context) => {
    const { httpMethod, path, body, queryStringParameters } = event;
    
    try {
        console.log('🔗 API de Compras - Iniciando...');
        console.log('📡 Método:', httpMethod, 'Path:', path);
        
        // Simular dados de exemplo
        const dadosExemplo = [
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
            console.log('✅ Retornando dados de exemplo');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosExemplo)
            };
        }
        
        else if (httpMethod === 'POST' && path === '/api/compras') {
            console.log('✅ Simulando criação de pedido');
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
            console.log('✅ Simulando atualização de status');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true })
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
        console.error('❌ Erro na API:', error);
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
