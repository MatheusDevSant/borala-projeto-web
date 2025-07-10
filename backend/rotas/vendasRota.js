
const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');

require('dotenv').config();



router.post('/reservar', async (req, res) => {

    const { id_usuario, id_evento, tipo_ingresso, preco_pago } = req.body;

  
    if (!id_usuario || !id_evento || tipo_ingresso === undefined || preco_pago === undefined || typeof preco_pago !== 'number') {
        console.error('Erro: Dados incompletos ou inválidos para a reserva.', req.body);
        return res.status(400).json({ erro: 'Dados incompletos ou inválidos para reserva.' });
    }

    try {
        
        let id_status_reservado;
        try {
            const [statusReservadoRows] = await conexao.promise().query(
                `SELECT id_status FROM ${'`'}status${'`'} WHERE status = 'Reservado' LIMIT 1`
            );
            id_status_reservado = statusReservadoRows.length > 0 ? statusReservadoRows[0].id_status : 1; 
        } catch (error) {
            console.error('Erro ao buscar ID do status "Reservado" no DB:', error);
            id_status_reservado = 1; 
        }

       
        const sql = `
            INSERT INTO vendas
            (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, preco_pago)
            VALUES (?, ?, ?, NOW(), NULL, NULL, ?);
        `;
        const params = [
            id_status_reservado, 
            id_usuario,
            id_evento,
            preco_pago 
        ];

        const [resultado] = await conexao.promise().execute(sql, params);

        console.log(`✅ RESERVA PURA registrada com sucesso! ID da reserva: ${resultado.insertId}`);
        res.status(201).json({
            mensagem: 'Reserva registrada com sucesso!',
            id_reserva: resultado.insertId
            
        });

    } catch (erro) {
        console.error('❌ Erro no processo de reserva no DB:', erro);
        res.status(500).json({ erro: 'Erro ao processar a reserva.' });
    }
});


router.get('/usuario/:id/reservas', (req, res) => {
    const idUsuario = req.params.id;

    const sql = `
        SELECT v.*, e.nome_evento, e.data_evento, le.local_evento, cat.categoria AS nome_categoria, st.status AS nome_status
        FROM vendas v
        JOIN eventos e ON v.id_evento = e.id_evento
        JOIN local_evento le ON e.id_local_evento = le.id_local_evento
        JOIN categorias cat ON e.id_categoria = cat.id_categoria
        JOIN ${'`'}status${'`'} st ON v.id_status = st.id_status -- Adicionado para pegar o nome do status
        WHERE v.id_usuario = ? AND v.id_status = (SELECT id_status FROM ${'`'}status${'`'} WHERE status = 'Reservado')
        ORDER BY v.data_reserva_bilhete DESC
    `;

    conexao.promise().query(sql, [idUsuario])
        .then(([resultados]) => {
            res.json(resultados);
        })
        .catch(erro => {
            console.error('Erro ao buscar reservas:', erro);
            res.status(500).json({ erro: 'Erro ao buscar reservas do usuário.' });
        });
});


router.delete('/cancelar/:id', (req, res) => {
    const idReserva = req.params.id;


    const sql = 'DELETE FROM vendas WHERE id_venda = ?';

    conexao.promise().execute(sql, [idReserva])
        .then(([resultado]) => {
            if (resultado.affectedRows > 0) {
                res.json({ mensagem: 'Reserva cancelada com sucesso.' });
            } else {
                res.status(404).json({ mensagem: 'Reserva não encontrada.' });
            }
        })
        .catch(erro => {
            console.error('Erro ao cancelar reserva:', erro);
            res.status(500).json({ erro: 'Erro ao cancelar a reserva.' });
        });
});

module.exports = router;