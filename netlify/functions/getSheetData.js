const { GoogleSpreadsheet } = require('google-spreadsheet');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders };
  }

  try {
    // Pega o ID da planilha e o nome da aba da URL da requisição
    const { id: spreadsheetId, sheet: sheetName } = event.queryStringParameters;
    if (!spreadsheetId || !sheetName) {
      return { statusCode: 400, headers: corsHeaders, body: 'ID da planilha e nome da aba sao obrigatorios.' };
    }

    // Carrega as credenciais que salvamos no Netlify
    const creds = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };

    // Inicializa o documento da planilha
    const doc = new GoogleSpreadsheet(spreadsheetId);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo(); // Carrega as propriedades do documento

    const sheet = doc.sheetsByTitle[sheetName]; // Acessa a aba pelo nome
    const rows = await sheet.getRows(); // Pega todas as linhas com dados

    // Formata os dados para um JSON limpo
    const data = rows.map(row => {
        const rowData = {};
        sheet.headerValues.forEach(header => {
            rowData[header] = row[header];
        });
        return rowData;
    });

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
      body: JSON.stringify({ error: 'Falha ao buscar dados da planilha.' })
    };
  }
};