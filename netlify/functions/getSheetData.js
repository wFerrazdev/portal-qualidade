// Arquivo: netlify/functions/getSheetData.js (VERSÃO ATUALIZADA)

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'Preflight OK' };
  }

  try {
    const { id: spreadsheetId, sheet: sheetName } = event.queryStringParameters;
    if (!spreadsheetId || !sheetName) {
      return { statusCode: 400, headers: corsHeaders, body: 'ID da planilha e nome da aba sao obrigatorios.' };
    }

    // A nova forma de autenticação (padrão da v4 da biblioteca)
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);

    await doc.loadInfo(); // Carrega as propriedades do documento

    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) {
      return { statusCode: 404, headers: corsHeaders, body: `Aba com o nome "${sheetName}" nao foi encontrada.` };
    }
    
    const rows = await sheet.getRows();

    // Formata os dados para um JSON limpo
    const data = rows.map(row => row.toObject());

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Erro ao buscar dados da planilha:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Falha ao buscar dados da planilha.', details: error.message })
    };
  }
};