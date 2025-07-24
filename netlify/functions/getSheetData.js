const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async function (event, context) {
  // --- BLOCO DE SEGURANÇA DE LEITURA ---
    const { user } = context.clientContext;
    // Apenas verifica se existe um usuário. Não precisa ser admin para ver.
    if (!user) {
        return {
            statusCode: 401, // Unauthorized (Não Autorizado)
            body: JSON.stringify({ error: 'Voce precisa estar logado para ver estes dados.' })
        };
    }
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders };
  }

  try {
    const { id: spreadsheetId, sheet: singleSheetName, sheets: multipleSheetNames } = event.queryStringParameters;
    if (!spreadsheetId) {
      return { statusCode: 400, headers: corsHeaders, body: 'ID da planilha é obrigatório.' };
    }

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    const sheetNamesToLoad = multipleSheetNames ? multipleSheetNames.split(',') : [singleSheetName];
    if (!sheetNamesToLoad[0]) {
        return { statusCode: 400, headers: corsHeaders, body: 'Nome da(s) aba(s) é obrigatório.' };
    }

    const allData = {};

    for (const sheetName of sheetNamesToLoad) {
        const sheet = doc.sheetsByTitle[sheetName];
        if (sheet) {
            const rows = await sheet.getRows();
            allData[sheetName] = rows.map(row => row.toObject());
        }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(allData)
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