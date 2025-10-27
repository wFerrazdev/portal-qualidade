// API de Compras - Versão Ultra Simples
module.exports = async (req, res) => {
    try {
        // Configurar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        console.log('🔗 API Compras - Iniciando...');
        
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
        return res.status(200).json({
            success: true,
            data: pedidos,
            message: 'API funcionando!'
        });
        
    } catch (error) {
        console.error('❌ Erro:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: error.message
        });
    }
};