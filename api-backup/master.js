// API Master - Gerencia todas as operações do sistema
exports.handler = async (event, context) => {
    const { httpMethod, path, body, queryStringParameters } = event;
    
    try {
        console.log('🔗 API Master - Iniciando...');
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
            }
        ];
        
        // Roteamento baseado no path
        if (path === '/api/compras') {
            if (httpMethod === 'GET') {
                console.log('✅ Retornando dados de compras');
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosCompras)
                };
            }
            
            else if (httpMethod === 'POST') {
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
            
            else if (httpMethod === 'PUT') {
                console.log('✅ Atualizando status do pedido');
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success: true })
                };
            }
        }
        
        // Roteamento para outras APIs (projetos, reuniões, etc.)
        else if (path === '/api/projetos') {
            console.log('✅ API de Projetos');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'API de Projetos funcionando' })
            };
        }
        
        else if (path === '/api/reunioes') {
            console.log('✅ API de Reuniões');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'API de Reuniões funcionando' })
            };
        }
        
        else if (path === '/api/auditorias') {
            console.log('✅ API de Auditorias');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'API de Auditorias funcionando' })
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
        console.error('❌ Erro na API Master:', error);
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
