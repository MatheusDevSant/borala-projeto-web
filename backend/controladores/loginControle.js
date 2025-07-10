const conexao = require('../configuracoes/banco');

const autenticarUsuario = (req, res) => {
    const { email, senha } = req.body;
    console.log('Recebi login:', email, senha);
    if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const query = `
        SELECT * FROM usuarios 
        WHERE (email_outros = ? OR email_google = ?) 
          AND senha = ?
    `;

    conexao.query(query, [email, email, senha], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar usuário:', erro);
            return res.status(500).json({ erro: 'Erro interno do servidor.' });
        }

        if (resultados.length === 0) {
            return res.status(401).json({ erro: 'Email ou senha inválidos.' });
        }

        const usuario = resultados[0];
        res.json({
            id_usuario: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email_outros || usuario.email_google,
        });
    });
};

module.exports = { autenticarUsuario };
