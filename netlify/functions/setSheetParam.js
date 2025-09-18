const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method not allowed' };
  }

  try {
    const { spreadsheetId, sheetName, cellA1, value } = JSON.parse(event.body || '{}');
    if (!spreadsheetId || !sheetName || !cellA1) {
      return { statusCode: 400, headers: corsHeaders, body: 'spreadsheetId, sheetName e cellA1 são obrigatórios.' };
    }

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) {
      return { statusCode: 404, headers: corsHeaders, body: `Aba não encontrada: ${sheetName}` };
    }

    // Usa o método "loadCells" para escrever em uma célula específica A1
    await sheet.loadCells(cellA1);
    const cell = sheet.getCellByA1(cellA1);
    cell.value = value;
    await sheet.saveUpdatedCells();

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    console.error('Erro ao atualizar célula do Sheets:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao atualizar célula.', details: error.message })
    };
  }
};



