const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async function (event) {
  console.log('setSheetParam called with method:', event.httpMethod);
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method not allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    console.log('Request body:', body);
    
    const { spreadsheetId, sheetName, cellA1, value } = body;
    
    if (!spreadsheetId || !sheetName || !cellA1) {
      console.log('Missing required parameters:', { spreadsheetId: !!spreadsheetId, sheetName: !!sheetName, cellA1: !!cellA1 });
      return { statusCode: 400, headers: corsHeaders, body: 'spreadsheetId, sheetName e cellA1 são obrigatórios.' };
    }

    console.log(`Updating ${spreadsheetId} - ${sheetName} - ${cellA1} with value: "${value}"`);

    // Verificar se as variáveis de ambiente estão definidas
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error('Missing Google credentials in environment variables');
      return { 
        statusCode: 500, 
        headers: corsHeaders, 
        body: JSON.stringify({ error: 'Credenciais do Google não configuradas.' }) 
      };
    }

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();
    console.log('Document loaded, available sheets:', Object.keys(doc.sheetsByTitle));
    
    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) {
      console.error(`Sheet not found: ${sheetName}. Available:`, Object.keys(doc.sheetsByTitle));
      return { statusCode: 404, headers: corsHeaders, body: `Aba não encontrada: ${sheetName}` };
    }

    console.log(`Sheet found: ${sheetName}, loading cells for range: ${cellA1}`);
    
    // Usa o método "loadCells" para escrever em uma célula específica A1
    await sheet.loadCells(cellA1);
    const cell = sheet.getCellByA1(cellA1);
    console.log(`Cell found at ${cellA1}, current value:`, cell.value);
    
    cell.value = value;
    console.log(`Setting cell value to: "${value}"`);
    
    await sheet.saveUpdatedCells();
    console.log('Cells saved successfully');

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, updated: { spreadsheetId, sheetName, cellA1, value } })
    };
  } catch (error) {
    console.error('Erro ao atualizar célula do Sheets:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao atualizar célula.', details: error.message, stack: error.stack })
    };
  }
};



