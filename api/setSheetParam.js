// API para atualizar parâmetros (células) no Google Sheets
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
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
        
        try {
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
            
            // Converter A1 notation para row/col (ex: A1 -> row=0, col=0; B2 -> row=1, col=1)
            // Função para converter A1 para coordenadas
            function a1ToRowCol(a1) {
                const match = a1.match(/^([A-Z]+)(\d+)$/i);
                if (!match) {
                    throw new Error(`Formato de célula inválido: ${a1}`);
                }
                
                const colStr = match[1].toUpperCase();
                const rowStr = match[2];
                
                // Converter coluna (A=0, B=1, Z=25, AA=26, etc)
                // A=1, B=2, ..., Z=26, AA=27, AB=28, etc
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
            
            // Salvar as alterações (saveUpdatedCells salva todas as células carregadas)
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
        
    } catch (error) {
        console.error('Erro na API setSheetParam:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
};

