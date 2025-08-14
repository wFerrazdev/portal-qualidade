const { Pool } = require('pg');
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'PUT') return { statusCode: 405, body: 'Method Not Allowed' };
    const { codigo } = event.queryStringParameters;
    const data = JSON.parse(event.body);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const query = `UPDATE equipamentos SET codigo=$1, equipamento=$2, fabricante_modelo=$3, data_calibracao=$4, anos_validade=$5, data_vencimento=$6, status=$7, situacao=$8, data_situacao=$9, setor=$10, responsavel=$11, observacao=$12
                       WHERE codigo = $13 RETURNING *;`;
        const values = [data.codigo, data.equipamento, data.fabricante_modelo, data.data_calibracao, data.anos_validade, data.data_vencimento, data.status, data.situacao, data.data_situacao, data.setor, data.responsavel, data.observacao, codigo];
        const { rows } = await pool.query(query, values);
        await pool.end();
        return { statusCode: 200, body: JSON.stringify(rows[0]) };
    } catch (error) {
        console.error('Erro ao atualizar equipamento:', error);
        await pool.end();
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};