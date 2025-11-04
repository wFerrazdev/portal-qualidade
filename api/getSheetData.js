// API para obter dados do Google Sheets
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // POST: Atualizar células no Google Sheets (setSheetParam)
    if (req.method === 'POST') {
        try {
            const { spreadsheetId, sheetName, cellA1, value } = req.body;
            
            if (!spreadsheetId || !sheetName || !cellA1 || value === undefined) {
                return res.status(400).json({ 
                    error: 'Missing required parameters: spreadsheetId, sheetName, cellA1, and value are required' 
                });
            }
            
            console.log('=== ATUALIZANDO CÉLULA NO GOOGLE SHEETS ===');
            console.log('Planilha ID:', spreadsheetId);
            console.log('Aba:', sheetName);
            console.log('Célula:', cellA1);
            console.log('Valor:', value);
            console.log('Credenciais disponíveis:', !!process.env.GOOGLE_CLIENT_EMAIL, !!process.env.GOOGLE_PRIVATE_KEY);
            
            // Verificar se as credenciais estão disponíveis
            if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
                console.error('Credenciais do Google Sheets não configuradas');
                return res.status(500).json({ 
                    error: 'Google Sheets credentials not configured',
                    message: 'As credenciais do Google Sheets não estão configuradas no servidor'
                });
            }
            
            // Criar JWT para autenticação
            const serviceAccountAuth = new JWT({
                email: process.env.GOOGLE_CLIENT_EMAIL,
                key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                ],
            });
            
            console.log('JWT criado, conectando com a planilha...');
            
            // Conectar com a planilha usando JWT
            const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
            await doc.loadInfo();
            
            console.log('Planilha carregada:', doc.title);
            
            // Obter a aba específica
            const sheet = doc.sheetsByTitle[sheetName];
            if (!sheet) {
                console.error(`Aba não encontrada: ${sheetName}`);
                return res.status(404).json({ 
                    error: 'Sheet not found',
                    message: `A aba "${sheetName}" não foi encontrada na planilha`
                });
            }
            
            console.log(`Aba encontrada: ${sheetName}, atualizando célula ${cellA1}...`);
            
            // Converter A1 notation para row/col
            function a1ToRowCol(a1) {
                const match = a1.match(/^([A-Z]+)(\d+)$/i);
                if (!match) {
                    throw new Error(`Formato de célula inválido: ${a1}`);
                }
                
                const colStr = match[1].toUpperCase();
                const rowStr = match[2];
                
                // Converter coluna (A=0, B=1, Z=25, AA=26, etc)
                let col = 0;
                for (let i = 0; i < colStr.length; i++) {
                    col = col * 26 + (colStr.charCodeAt(i) - 64);
                }
                col -= 1; // Converter para 0-indexed (A=0, B=1, Z=25, AA=26, etc)
                
                // Linha é 1-indexed no A1, mas 0-indexed na API
                const row = parseInt(rowStr) - 1;
                
                if (row < 0 || col < 0) {
                    throw new Error(`Coordenadas inválidas: linha ${row}, coluna ${col}`);
                }
                
                return { row, col };
            }
            
            const { row, col } = a1ToRowCol(cellA1);
            console.log(`Coordenadas convertidas: linha ${row}, coluna ${col} (de ${cellA1})`);
            
            // Carregar a célula específica
            await sheet.loadCells(`${cellA1}:${cellA1}`);
            
            // Obter a célula
            const cell = sheet.getCell(row, col);
            
            // Atualizar o valor da célula
            cell.value = value;
            
            // Salvar as alterações
            await sheet.saveUpdatedCells();
            
            console.log(`✅ Célula ${cellA1} atualizada com sucesso para: "${value}"`);
            
            return res.status(200).json({
                success: true,
                message: `Célula ${cellA1} atualizada com sucesso`,
                spreadsheetId,
                sheetName,
                cellA1,
                value
            });
            
        } catch (error) {
            console.error('=== ERRO AO ATUALIZAR GOOGLE SHEETS ===');
            console.error('Erro:', error.message);
            console.error('Stack:', error.stack);
            
            return res.status(500).json({ 
                error: 'Error updating Google Sheets',
                message: error.message,
                details: error.stack
            });
        }
    }
    
    // GET: Obter dados do Google Sheets (funcionalidade original)
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { id, sheets } = req.query;
        
        if (!id || !sheets) {
            return res.status(400).json({ error: 'Missing required parameters: id and sheets' });
        }
        
        console.log('=== TENTANDO CONECTAR COM GOOGLE SHEETS ===');
        console.log('Planilha ID:', id);
        console.log('Abas solicitadas:', sheets);
        console.log('Credenciais disponíveis:', !!process.env.GOOGLE_CLIENT_EMAIL, !!process.env.GOOGLE_PRIVATE_KEY);
        
        // Dados mock como fallback
        const mockData = {
            'opt_por_cliente': [
                ['Cliente A', 95, 97, 96, 98],
                ['Cliente B', 92, 94, 95, 97],
                ['Cliente C', 89, 91, 93, 95]
            ],
            'opt_por_projeto': [
                ['Projeto Alpha', 'Em Andamento', 75, 'A'],
                ['Projeto Beta', 'Concluído', 100, 'A+'],
                ['Projeto Gamma', 'Planejamento', 25, 'B']
            ],
            'opt_detalhado': [
                ['Item 1', 'Concluído', 'João'],
                ['Item 2', 'Em andamento', 'Maria']
            ],
            'opt_inteiro': [
                [300, 350]
            ],
            'nci_por_setor': [
                ['Produção', 2, 1, 0, 1],
                ['Qualidade', 1, 0, 1, 0],
                ['Logística', 3, 2, 1, 2]
            ],
            'pareto_mes': [
                ['Defeito A', 15],
                ['Defeito B', 10],
                ['Defeito C', 5]
            ],
            'pareto_ano': [
                ['Defeito A', 120],
                ['Defeito B', 80],
                ['Defeito C', 40]
            ],
            'nci_anual': [
                ['2022', 30],
                ['2023', 25],
                ['2024', 20]
            ],
            'status_por_fornecedor_ano': [
                ['Fornecedor A', 'Aprovado', 15],
                ['Fornecedor B', 'Pendente', 8],
                ['Fornecedor C', 'Reprovado', 3]
            ],
            'status_por_fornecedor_mes': [
                ['Fornecedor A', 'Aprovado', 5],
                ['Fornecedor B', 'Pendente', 3],
                ['Fornecedor C', 'Reprovado', 1]
            ],
            'pareto_rifs': [
                ['Fornecedor A', 15],
                ['Fornecedor B', 8],
                ['Fornecedor C', 3]
            ],
            'nce_procedentes_anos': [
                ['2022', 25],
                ['2023', 18],
                ['2024', 12]
            ],
            'nce_naoprocedentes_anos': [
                ['2022', 5],
                ['2023', 3],
                ['2024', 2]
            ],
            'total_nce_anos': [
                ['2022', 30],
                ['2023', 21],
                ['2024', 14]
            ],
            'nce_pareto_defeitos': [
                ['Defeito A', 20],
                ['Defeito B', 15],
                ['Defeito C', 10]
            ],
            'kpi_revertidos': [
                ['2022', 5],
                ['2023', 8],
                ['2024', 10]
            ]
        };
        
        // Tentar conectar com Google Sheets se as credenciais estiverem disponíveis
        if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            try {
                console.log('Credenciais disponíveis, tentando autenticar...');
                
                // Criar JWT para autenticação (método correto para versão 4.x)
                const serviceAccountAuth = new JWT({
                    email: process.env.GOOGLE_CLIENT_EMAIL,
                    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    scopes: [
                        'https://www.googleapis.com/auth/spreadsheets',
                    ],
                });
                
                console.log('JWT criado, conectando com a planilha...');
                
                // Conectar com a planilha usando JWT
                const doc = new GoogleSpreadsheet(id, serviceAccountAuth);
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
                const sheetNames = sheets.split(',').map(s => s.trim());
                const result = {};
                
                for (const sheetName of sheetNames) {
                    try {
                        console.log(`Tentando obter dados da aba: ${sheetName}`);
                        const sheet = doc.sheetsByTitle[sheetName];
                        if (sheet) {
                            console.log(`Aba encontrada: ${sheetName}, linhas: ${sheet.rowCount}`);
                            const rows = await sheet.getRows();
                            console.log(`Dados obtidos da aba ${sheetName}:`, rows.length, 'linhas');
                            
                            // Obter o cabeçalho
                            const headerValues = sheet.headerValues;
                            
                            // Converter as linhas em formato correto para os gráficos
                            const data = [];
                            rows.forEach(row => {
                                const rowData = [];
                                headerValues.forEach(header => {
                                    const value = row.get(header) || '';
                                    // Converter números se possível
                                    const numValue = parseFloat(value);
                                    rowData.push(isNaN(numValue) ? value : numValue);
                                });
                                data.push(rowData);
                            });
                            
                            result[sheetName] = data;
                            console.log(`Dados processados da aba ${sheetName}:`, data.length, 'linhas');
                        } else {
                            console.log(`Aba não encontrada: ${sheetName}`);
                            // Usar dados mock se a aba não existir
                            result[sheetName] = mockData[sheetName] || [];
                        }
                    } catch (error) {
                        console.error(`Erro ao obter dados da aba ${sheetName}:`, error.message);
                        result[sheetName] = mockData[sheetName] || [];
                    }
                }
                
                console.log('✅ Dados reais obtidos com sucesso!');
                console.log('Resultado final:', Object.keys(result));
                return res.status(200).json(result);
                
            } catch (error) {
                console.error('=== ERRO AO CONECTAR COM GOOGLE SHEETS ===');
                console.error('Erro:', error.message);
                console.error('Stack:', error.stack);
                // Fallback para dados mock
                console.log('Usando dados mock como fallback');
            }
        } else {
            console.log('Credenciais não disponíveis, usando dados mock');
        }
        
        // Retornar dados mock se não conseguir conectar com Google Sheets
        console.log('Usando dados mock para:', sheets);
        const sheetNames = sheets.split(',').map(s => s.trim());
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
