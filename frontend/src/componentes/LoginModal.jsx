import React, { useState } from 'react';
import '../styles/LoginModal.css';

function LoginModal({ isOpen, onClose }) {
    const [emailCadastro, setEmailCadastro] = useState('');
    const [senhaCadastro, setSenhaCadastro] = useState('');
    const [cpfCadastro, setCpfCadastro] = useState('');
    const [nomeCadastro, setNomeCadastro] = useState('');
    const [telefoneCadastro, setTelefoneCadastro] = useState('');
    const [enderecoCadastro, setEnderecoCadastro] = useState('');
    const [emailLogin, setEmailLogin] = useState('');
    const [senhaLogin, setSenhaLogin] = useState('');
    const [currentView, setCurrentView] = useState('main'); 
    const handleLogin = async (e) => {
        e.preventDefault(); 

        try {
            const response = await fetch('http://localhost:3001/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailLogin,
                    senha: senhaLogin,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Bem-vindo, ${data.nome}!`);
                localStorage.setItem('usuarioLogado', JSON.stringify(data));
                onClose();
                setEmailLogin('');
                setSenhaLogin('');
            } else {
                const data = await response.json();
                alert('Erro ao fazer login: ' + (data.erro || 'Verifique suas credenciais.'));
            }
        } catch (err) {
            console.error('Erro na requisição de login:', err);
            alert('Erro ao conectar com o servidor.');
        }
    };
    const handleCadastro = async (e) => {
        e.preventDefault(); 

        try {
            const response = await fetch('http://localhost:3001/api/usuarios/cadastrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nomeCadastro,
                    cpf: cpfCadastro,
                    email_outros: emailCadastro,
                    telefone: telefoneCadastro,
                    endereco: enderecoCadastro,
                    id_cidade: 1,
                    id_estado: 1,
                    senha: senhaCadastro
                })
            });

            if (response.ok) {
                alert('Usuário cadastrado com sucesso! Agora você pode fazer login.');
                setNomeCadastro('');
                setCpfCadastro('');
                setTelefoneCadastro('');
                setEnderecoCadastro('');
                setEmailCadastro('');
                setSenhaCadastro('');
                setCurrentView('main');
            } else {
                const data = await response.json();
                alert('Erro ao cadastrar: ' + (data.erro || 'Verifique os dados e tente novamente.'));
            }
        } catch (err) {
            console.error('Erro na requisição de cadastro:', err);
            alert('Erro ao conectar com o servidor.');
        }
    };
    const handleLoginGoogle = () => {
        alert('Funcionalidade de Login com Google a ser implementada!');
    };
    const handleCadastroGoogle = () => {
        alert('Funcionalidade de Cadastro com Google a ser implementada!');
    };
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose} title="Fechar">×</button>

              
                {(currentView === 'emailLogin' || currentView === 'emailRegister') && (
                    <button
                        className="modal-close"
                        style={{ left: 15, right: 'auto', fontSize: '1.2rem', color: '#555' }} 
                        onClick={() => setCurrentView('main')} 
                        title="Voltar"
                    >
                        <span style={{fontSize: 20}}>&larr;</span>
                    </button>
                )}

       
                <h2>{currentView === 'main' ? 'BEM-VINDO DE VOLTA!' : 'LOGIN'}</h2>

               
                {currentView === 'main' && (
                    <div className="form-section">
                        <button className="action-button" onClick={handleLoginGoogle}>
                            <span role="img" aria-label="Google">🔗</span>
                            Login com conta Google
                        </button>
                        <button className="action-button" onClick={() => setCurrentView('emailLogin')}>
                            <span role="img" aria-label="Email">✉️</span>
                            Login com email
                        </button>

                        <div className="separator"><span>OU</span></div>

                        <h3>Ainda não tem cadastro? Agora ficou muito mais rápido!</h3>
                        <button className="action-button" onClick={handleCadastroGoogle}>
                            <span role="img" aria-label="Google">🔗</span>
                            Cadastrar com Google
                        </button>
                        <button className="action-button" onClick={() => setCurrentView('emailRegister')}>
                            <span role="img" aria-label="Email">✉️</span>
                            Cadastro com email
                        </button>
                    </div>
                )}

                
                {currentView === 'emailLogin' && (
                    <div className="form-section">
                        <h3>Login com Email</h3>
                        <form onSubmit={handleLogin} style={{ width: '100%' }}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={emailLogin}
                                onChange={(e) => setEmailLogin(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Senha"
                                value={senhaLogin}
                                onChange={(e) => setSenhaLogin(e.target.value)}
                                required
                            />
                            <p className="form-links" onClick={() => alert('Funcionalidade de recuperação de senha a ser implementada!')}>
                                Esqueceu a senha?
                            </p>
                            <button type="submit" className="submit-btn">Acessar</button>
                        </form>
                    </div>
                )}

             
                {currentView === 'emailRegister' && (
                    <div className="form-section">
                        <h3>Cadastre-se com Email</h3>
                        <form onSubmit={handleCadastro} style={{ width: '100%' }}>
                            <input type="text" placeholder="Nome completo" value={nomeCadastro} onChange={(e) => setNomeCadastro(e.target.value)} required />
                            <input type="text" placeholder="CPF" value={cpfCadastro} onChange={(e) => setCpfCadastro(e.target.value)} required />
                            <input type="email" placeholder="Email" value={emailCadastro} onChange={(e) => setEmailCadastro(e.target.value)} required />
                            <input type="text" placeholder="Telefone" value={telefoneCadastro} onChange={(e) => setTelefoneCadastro(e.target.value)} />
                            <input type="text" placeholder="Endereço" value={enderecoCadastro} onChange={(e) => setEnderecoCadastro(e.target.value)} />
                            <input type="password" placeholder="Senha" value={senhaCadastro} onChange={(e) => setSenhaCadastro(e.target.value)} required />
                            <button type="submit" className="submit-btn">Cadastrar</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginModal;

