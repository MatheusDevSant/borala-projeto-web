const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');


router.get('/:id', (req, res) => {
  const idUsuario = req.params.id;
  conexao.query('SELECT * FROM usuarios WHERE id_usuario = ?', [idUsuario], (erro, resultados) => {
    if (erro) {
      console.error('Erro ao buscar usuário:', erro);
      return res.status(500).json({ erro: 'Erro ao buscar usuário' });
    }
    if (resultados.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json(resultados[0]);
  });
});


router.post('/cadastrar', (req, res) => {
  const { nome, cpf, email_outros, email_google, telefone, endereco, id_cidade, id_estado, senha } = req.body;

  conexao.query('SELECT MAX(id_usuario) AS maxId FROM usuarios', (erro, resultado) => {
    if (erro) {
      console.error('Erro ao buscar maxId:', erro);
      return res.status(500).json({ erro: 'Erro ao buscar id' });
    }

    const novoId = (resultado[0].maxId || 0) + 1;

    const sql = `
      INSERT INTO usuarios 
      (id_usuario, nome, CPF, email_outros, email_google, telefone, endereco, id_cidade, id_estado, foto_usuario, senha)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    conexao.query(
      sql,
      [novoId, nome, cpf, email_outros, email_google || '', telefone, endereco, id_cidade, id_estado, null, senha],
      (erro, resultado) => {
        if (erro) {
          console.error('Erro ao cadastrar usuário:', erro);
          if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ erro: 'CPF ou email já cadastrado' });
          }
          return res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
        }

        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id_usuario: novoId });
      }
    );
  });
});


router.put('/:id', (req, res) => {
  const { nome, email_outros, email_google, telefone, endereco, senha, foto_usuario } = req.body;

  
  console.log('Atualizando usuário:', req.params.id, { nome, email_outros, email_google, telefone, endereco, senha, foto_usuario });

  conexao.query(
    'UPDATE usuarios SET nome=?, email_outros=?, email_google=?, telefone=?, endereco=?, senha=?, foto_usuario=? WHERE id_usuario=?',
    [nome, email_outros, email_google, telefone, endereco, senha, foto_usuario, req.params.id],
    (erro, resultado) => {
      if (erro) {
        console.error('Erro ao atualizar usuário:', erro);
        return res.status(500).json({ erro: 'Erro ao atualizar usuário' });
      }
      res.json({ mensagem: 'Usuário atualizado com sucesso!' });
    }
  );
});

module.exports = router;
module.exports = router;
