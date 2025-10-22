// API de Compras - Versão Ultra Simples
exports.handler = async (event, context) => {
    try {
        console.log('🔗 API Compras - Iniciando...');
        
        const { httpMethod, path } = event;
        
        // Dados estáticos para teste
        const pedidos = [
            {
                id: 1,
                numero: 'SC-001',
                descricao: 'Equipamentos de laboratório',
                fornecedor: 'LabTech Solutions',
                valor: 15000.00,
                status: 'AGUARDANDO_APROVACAO',
                dataCriacao: new Date().toISOString()
            },
            {
                id: 2,
                numero: 'SC-002',
                descricao: 'Material de consumo',
                fornecedor: 'SupplyCorp',
                valor: 2500.00,
                status: 'APROVADO',
                dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        // Resposta simples
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                data: pedidos,
                message: 'API funcionando!'
            })
        };
        
    } catch (error) {
        console.error('❌ Erro:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Erro interno',
                message: error.message
            })
        };
    }
};