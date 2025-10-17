// API para obter dados do Google Sheets
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { id, sheets } = req.query;
        
        if (!id || !sheets) {
            return res.status(400).json({ error: 'Missing required parameters: id and sheets' });
        }
        
        console.log('Tentando conectar com Google Sheets:', id);
        console.log('Credenciais disponíveis:', !!process.env.GOOGLE_CLIENT_EMAIL, !!process.env.GOOGLE_PRIVATE_KEY);
        
        // Dados mock como fallback
        const mockData = {
            'opt_por_cliente': [
                ['Cliente', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
                ['Cliente A', '95%', '97%', '96%', '98%'],
                ['Cliente B', '92%', '94%', '95%', '97%'],
                ['Cliente C', '89%', '91%', '93%', '95%']
            ],
            'opt_por_projeto': [
                ['Projeto', 'Status', 'Progresso', 'Qualidade'],
                ['Projeto Alpha', 'Em Andamento', '75%', 'A'],
                ['Projeto Beta', 'Concluído', '100%', 'A+'],
                ['Projeto Gamma', 'Planejamento', '25%', 'B']
            ],
            'nci_por_setor': [
                ['Setor', 'NCI Q1', 'NCI Q2', 'NCI Q3', 'NCI Q4'],
                ['Produção', '2', '1', '0', '1'],
                ['Qualidade', '1', '0', '1', '0'],
                ['Logística', '3', '2', '1', '2']
            ],
            'status_por_fornecedor_ano': [
                ['Fornecedor', 'Status', 'Quantidade'],
                ['Fornecedor A', 'Aprovado', '15'],
                ['Fornecedor B', 'Pendente', '8'],
                ['Fornecedor C', 'Reprovado', '3']
            ],
            'nce_procedentes_anos': [
                ['Ano', 'Quantidade'],
                ['2022', '25'],
                ['2023', '18'],
                ['2024', '12']
            ]
        };
        
        // Tentar conectar com Google Sheets se as credenciais estiverem disponíveis
        if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            try {
                console.log('=== TENTANDO CONECTAR COM GOOGLE SHEETS ===');
                console.log('Planilha ID:', id);
                console.log('Abas solicitadas:', sheets);
                
                // Importar a biblioteca do Google Sheets
                const { GoogleSpreadsheet } = await import('google-spreadsheet');
                
                // Configurar credenciais
                const credentials = {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
                };
                
                console.log('Credenciais configuradas, tentando autenticar...');
                
                // Conectar com a planilha
                const doc = new GoogleSpreadsheet(id);
                await doc.useServiceAccountAuth(credentials);
                console.log('Autenticação bem-sucedida!');
                
                await doc.loadInfo();
                console.log('Planilha carregada:', doc.title);
                console.log('Total de abas:', doc.sheetCount);
                
                // Listar todas as abas disponíveis
                const availableSheets = [];
                for (let i = 0; i < doc.sheetCount; i++) {
                    const sheet = doc.sheetsByIndex[i];
                    availableSheets.push(sheet.title);
                }
                console.log('Abas disponíveis:', availableSheets);
                
                // Obter as abas solicitadas
                const sheetNames = sheets.split(',');
                const result = {};
                
                for (const sheetName of sheetNames) {
                    try {
                        console.log(`Tentando obter dados da aba: ${sheetName}`);
                        const sheet = doc.sheetsByTitle[sheetName];
                        if (sheet) {
                            console.log(`Aba encontrada: ${sheetName}, linhas: ${sheet.rowCount}`);
                            const rows = await sheet.getRows();
                            console.log(`Dados obtidos da aba ${sheetName}:`, rows.length, 'linhas');
                            
                            const data = rows.map(row => {
                                const values = [];
                                for (let i = 0; i < row._rawData.length; i++) {
                                    values.push(row._rawData[i] || '');
                                }
                                return values;
                            });
                            result[sheetName] = data;
                            console.log(`Dados processados da aba ${sheetName}:`, data.length, 'linhas');
                        } else {
                            console.log(`Aba não encontrada: ${sheetName}`);
                            // Usar dados mock se a aba não existir
                            result[sheetName] = mockData[sheetName] || [];
                        }
                    } catch (error) {
                        console.error(`Erro ao obter dados da aba ${sheetName}:`, error);
                        result[sheetName] = mockData[sheetName] || [];
                    }
                }
                
                console.log('Resultado final:', Object.keys(result));
                return res.status(200).json(result);
                
            } catch (error) {
                console.error('=== ERRO AO CONECTAR COM GOOGLE SHEETS ===');
                console.error('Erro:', error.message);
                console.error('Stack:', error.stack);
                // Fallback para dados mock
            }
        } else {
            console.log('Credenciais não disponíveis, usando dados mock');
        }
        
        // Retornar dados mock se não conseguir conectar com Google Sheets
        console.log('Usando dados mock para:', sheets);
        const sheetNames = sheets.split(',');
        const result = {};
        
        sheetNames.forEach(sheetName => {
            result[sheetName] = mockData[sheetName] || [];
        });
        
        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Erro na API getSheetData:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
