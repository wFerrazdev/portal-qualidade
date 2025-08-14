const { Pool } = require('pg');
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const data = JSON.parse(event.body);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const query = `INSERT INTO equipamentos(codigo, equipamento, fabricante_modelo, data_calibracao, anos_validade, data_vencimento, status, situacao, data_situacao, setor, responsavel, observacao) 
                       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;`;
        const values = [data.codigo, data.equipamento, data.fabricante_modelo, data.data_calibracao, data.anos_validade, data.data_vencimento, data.status, data.situacao, data.data_situacao, data.setor, data.responsavel, data.observacao];
        const { rows } = await pool.query(query, values);
        await pool.end();
        return { statusCode: 201, body: JSON.stringify(rows[0]) };
    } catch (error) {
        console.error('Erro ao adicionar equipamento:', error);
        await pool.end();
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};