module.exports = async (req, res) => {
    console.log('=== API TESTPROJETOS INICIADA ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Retornar dados mock simples
    const mockData = [
        {
            id: 1,
            titulo: 'Projeto Teste 1',
            status: 'Em Andamento',
            progresso: 50,
            principais_feitos: ['Feito 1', 'Feito 2'],
            imagem_url: 'https://via.placeholder.com/300x200?text=Teste+1'
        },
        {
            id: 2,
            titulo: 'Projeto Teste 2',
            status: 'Concluído',
            progresso: 100,
            principais_feitos: ['Feito 3', 'Feito 4'],
            imagem_url: 'https://via.placeholder.com/300x200?text=Teste+2'
        }
    ];
    
    console.log('Retornando dados mock:', mockData);
    return res.status(200).json(mockData);
};
