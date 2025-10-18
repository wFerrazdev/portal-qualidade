// API para debug dos dados dos gráficos
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const { spreadsheet } = req.query;
        
        // IDs das planilhas
        const spreadsheetIds = {
            'externo': '1sFitRzLoY1Xpqezv7AeT1Gp7pQWoBs6D92xr_uATPv4',
            'interno': '1_XfCgxqMlxLjXUfw7MSgZ386E16d5sQFSbV8Q6Q0mmk',
            'rifs': '17F0DVUFu-cscmMnJsezkuCc_3SzuUehD_dSiPGOOz2A',
            'nc_externa': '1kJcw-QMboXMSt2Ueej3kA0qwjZ1abyj4XgyWxf2KtKQ'
        };
        
        if (!spreadsheet || !spreadsheetIds[spreadsheet]) {
            return res.status(400).json({ error: 'Spreadsheet não especificado ou inválido' });
        }
        
        const id = spreadsheetIds[spreadsheet];
        const sheets = {
            'externo': 'opt_por_cliente,opt_por_projeto,opt_detalhado,opt_inteiro',
            'interno': 'nci_por_setor,pareto_mes,pareto_ano,nci_anual',
            'rifs': 'status_por_fornecedor_ano,status_por_fornecedor_mes,pareto_rifs',
            'nc_externa': 'nce_procedentes_anos,nce_naoprocedentes_anos,total_nce_anos,nce_pareto_defeitos,kpi_revertidos'
        };
        
        // Fazer chamada para a API getSheetData
        const response = await fetch(`${req.headers.host ? 'https://' + req.headers.host : 'http://localhost:3000'}/api/getSheetData?id=${id}&sheets=${sheets[spreadsheet]}`);
        const data = await response.json();
        
        return res.status(200).json({
            spreadsheet: spreadsheet,
            spreadsheetId: id,
            sheets: sheets[spreadsheet].split(','),
            data: data,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Erro na API debug-data:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
