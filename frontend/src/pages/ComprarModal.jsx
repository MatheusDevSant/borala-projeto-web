import React, { useState } from 'react';
import '../styles/ComprarModal.css'; 
function ComprarModal({ evento, isOpen, onClose, valorBase = 0 }) {
    const [formaPagamento, setFormaPagamento] = useState('cartao');
    const [mensagem, setMensagem] = useState('');
    const [tipoIngresso, setTipoIngresso] = useState('inteira');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    
    const precoBase = Number(evento?.preco) > 0
        ? Number(evento.preco)
        : Number(valorBase) > 0
            ? Number(valorBase)
            : 100.00;

    const calcularPrecoFinal = () => {
        switch (tipoIngresso) {
            case 'meia':
                return precoBase / 2;
            case 'vip':
                return precoBase * 2;
            default:
                return precoBase;
        }
    };

    const handleConfirmarCompra = async () => {
        if (!usuarioLogado || !usuarioLogado.id_usuario) {
            alert('Você precisa estar logado para realizar a compra!');
            return;
        }

        let idEventoFinal = evento.id_evento;

      
        if (!idEventoFinal && evento.nome && evento.data) {
            console.log('Evento sem ID no DB, tentando cadastrar automaticamente...');
            const eventoParaCadastro = {
                nome_evento: evento.nome,

                id_categoria: (evento.classifications && evento.classifications[0]?.segment?.name === 'Music') ? 2 : 1, // Exemplo: Música=2, Esporte=1
                id_local_evento: 1, 
                data_evento: evento.data,
                id_cidade: 39, 
                id_estado: 25, 
                preco: evento.preco || 100.00,
                latitude: evento.latitude || null,
                longitude: evento.longitude || null
            };
            try {
                const resp = await fetch('http://localhost:3001/api/eventos-externos/cadastrar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventoParaCadastro)
                });
                const dataCadastro = await resp.json();
                if (resp.ok && dataCadastro.id_evento) {
                    idEventoFinal = dataCadastro.id_evento;
                    console.log(`Evento externo cadastrado com ID: ${idEventoFinal}`);
                } else {
                    alert(dataCadastro.erro || 'Erro ao cadastrar evento automaticamente para compra.');
                    return;
                }
            } catch (error) {
                console.error('Erro na requisição de cadastro automático de evento:', error);
                alert('Erro de rede ao cadastrar evento automaticamente.');
                return;
            }
        } else if (!idEventoFinal) {
            alert('Não foi possível obter um ID de evento válido ou cadastrar o evento automaticamente.');
            return;
        }

        const dadosCompra = {
            id_usuario: Number(usuarioLogado.id_usuario),
            id_evento: Number(idEventoFinal),
            id_forma_pagamento: 
                formaPagamento === 'cartao' ? 1 :
                formaPagamento === 'boleto' ? 2 :
                formaPagamento === 'pix' ? 3 : null,
            tipo_ingresso: tipoIngresso,
            preco_pago: Number(calcularPrecoFinal())
        };

        if (
            !dadosCompra.id_usuario ||
            !dadosCompra.id_evento ||
            !dadosCompra.id_forma_pagamento ||
            !dadosCompra.tipo_ingresso ||
            isNaN(dadosCompra.preco_pago)
        ) {
            alert('Por favor, preencha todos os campos corretamente para a compra!');
            console.error('Dados inválidos para envio de compra:', dadosCompra);
            return;
        }

        console.log('Dados enviados para API de compra:', dadosCompra);

        try {
            const resposta = await fetch('http://localhost:3001/api/compras', { // CHAMA O ENDPOINT DE COMPRA (STATUS PAGO)
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCompra),
            });
            const dataRetorno = await resposta.json();
            if (resposta.ok) {
                setMensagem('Compra realizada com sucesso! ID da venda: ' + dataRetorno.id_venda);
                setTimeout(() => {
                    setMensagem('');
                    onClose && onClose();
                }, 1500);
            } else {
                alert(dataRetorno.erro || 'Erro ao finalizar compra no servidor.');
            }
        } catch (erro) {
            console.error('Erro na requisição de compra para o backend:', erro);
            alert('Erro de rede ao finalizar compra.');
        }
    };

    if (!isOpen) return null; 

    return (
        <div className="comprar-modal-overlay">
            <div className="comprar-modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>Finalizar Compra</h2>
                <p><strong>Evento:</strong> {evento.nome_evento || evento.nome}</p>
                <div>
                    <label><strong>Tipo de ingresso:</strong></label>
                    <select value={tipoIngresso} onChange={e => setTipoIngresso(e.target.value)}>
                        <option value="inteira">Inteira</option>
                        <option value="meia">Meia-entrada</option>
                        <option value="vip">VIP</option>
                    </select>
                </div>
                <p><strong>Valor:</strong> R$ {calcularPrecoFinal().toFixed(2)}</p>
                <h3>Forma de pagamento:</h3>
                <div className="pagamento-opcoes">
                    <button
                        className={formaPagamento === 'cartao' ? 'ativo' : ''}
                        onClick={() => setFormaPagamento('cartao')}
                        type="button"
                    >
                        💳 Cartão
                    </button>
                    <button
                        className={formaPagamento === 'boleto' ? 'ativo' : ''}
                        onClick={() => setFormaPagamento('boleto')}
                        type="button"
                    >
                        📄 Boleto
                    </button>
                    <button
                        className={formaPagamento === 'pix' ? 'ativo' : ''}
                        onClick={() => setFormaPagamento('pix')}
                        type="button"
                    >
                        🏦 Pix
                    </button>
                </div>
                <button className="comprar-btn" onClick={handleConfirmarCompra}>
                    Confirmar Compra
                </button>
                {mensagem && <p style={{ color: 'green', marginTop: 10 }}>{mensagem}</p>}
            </div>
        </div>
    );
}

export default ComprarModal;