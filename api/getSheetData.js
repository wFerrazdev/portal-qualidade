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
        
        // Importar a biblioteca do Google Sheets
        const { GoogleSpreadsheet } = await import('google-spreadsheet');
        
        // Configurar credenciais
        const credentials = {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
        
        // Conectar com a planilha
        const doc = new GoogleSpreadsheet(id);
        await doc.useServiceAccountAuth(credentials);
        await doc.loadInfo();
        
        // Obter as abas solicitadas
        const sheetNames = sheets.split(',');
        const result = {};
        
        for (const sheetName of sheetNames) {
            try {
                const sheet = doc.sheetsByTitle[sheetName];
                if (sheet) {
                    const rows = await sheet.getRows();
                    const data = rows.map(row => {
                        const values = [];
                        for (let i = 0; i < row._rawData.length; i++) {
                            values.push(row._rawData[i] || '');
                        }
                        return values;
                    });
                    result[sheetName] = data;
                }
            } catch (error) {
                console.error(`Erro ao obter dados da aba ${sheetName}:`, error);
                result[sheetName] = [];
            }
        }
        
        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Erro na API getSheetData:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
