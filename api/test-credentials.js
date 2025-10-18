// API para testar as credenciais do Google Sheets
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Verificar se as variáveis de ambiente estão disponíveis
        const hasEmail = !!process.env.GOOGLE_CLIENT_EMAIL;
        const hasKey = !!process.env.GOOGLE_PRIVATE_KEY;
        
        console.log('=== TESTE DE CREDENCIAIS ===');
        console.log('GOOGLE_CLIENT_EMAIL disponível:', hasEmail);
        console.log('GOOGLE_PRIVATE_KEY disponível:', hasKey);
        
        if (hasEmail) {
            console.log('Email:', process.env.GOOGLE_CLIENT_EMAIL);
        }
        
        if (hasKey) {
            console.log('Chave privada (primeiros 50 chars):', process.env.GOOGLE_PRIVATE_KEY.substring(0, 50) + '...');
        }
        
        // Testar conexão com Google Sheets
        if (hasEmail && hasKey) {
            try {
                const { GoogleSpreadsheet } = await import('google-spreadsheet');
                
                // Configurar credenciais
                const credentials = {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
                };
                
                console.log('Tentando conectar com Google Sheets...');
                
                // Testar com uma planilha específica
                const testSpreadsheetId = '1sFitRzLoY1Xpqezv7AeT1Gp7pQWoBs6D92xr_uATPv4';
                const doc = new GoogleSpreadsheet(testSpreadsheetId);
                
                await doc.useServiceAccountAuth(credentials);
                console.log('Autenticação bem-sucedida!');
                
                await doc.loadInfo();
                console.log('Planilha carregada:', doc.title);
                console.log('Abas disponíveis:', doc.sheetCount);
                
                // Listar todas as abas
                const sheets = [];
                for (let i = 0; i < doc.sheetCount; i++) {
                    const sheet = doc.sheetsByIndex[i];
                    sheets.push({
                        title: sheet.title,
                        index: i,
                        rowCount: sheet.rowCount,
                        columnCount: sheet.columnCount
                    });
                }
                
                return res.status(200).json({
                    success: true,
                    message: 'Conexão com Google Sheets bem-sucedida!',
                    credentials: {
                        hasEmail,
                        hasKey,
                        email: process.env.GOOGLE_CLIENT_EMAIL
                    },
                    spreadsheet: {
                        id: testSpreadsheetId,
                        title: doc.title,
                        sheetCount: doc.sheetCount,
                        sheets: sheets
                    }
                });
                
            } catch (error) {
                console.error('Erro ao conectar com Google Sheets:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao conectar com Google Sheets',
                    error: error.message,
                    credentials: {
                        hasEmail,
                        hasKey,
                        email: process.env.GOOGLE_CLIENT_EMAIL
                    }
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Credenciais não disponíveis',
                credentials: {
                    hasEmail,
                    hasKey
                }
            });
        }
        
    } catch (error) {
        console.error('Erro geral na API:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno',
            error: error.message
        });
    }
}
