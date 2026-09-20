const formUsuario = document.getElementById('form-usuario');
const listaUsuarios = document.getElementById('lista-usuarios');

// Verificar permissão de administrador
function verificarPermissaoAdmin() {
    const usuario = window.usuarioLogado;
    if (!usuario || usuario.nivel !== 'administrador') {
        if (formUsuario) formUsuario.style.display = 'none';
        if (listaUsuarios) listaUsuarios.innerHTML = `
            <p style="text-align:center; color:var(--texto-claro); padding:2rem;">
                🔒 Acesso restrito. Apenas administradores podem gerenciar usuários.
            </p>
        `;
        return false;
    }
    return true;
}

// Carregar usuários salvos (Firestore + localStorage)
async function carregarUsuarios() {
    if (!listaUsuarios) return;
    if (!verificarPermissaoAdmin()) return;

    listaUsuarios.innerHTML = '<p style="text-align:center; color:var(--texto-claro);">Carregando usuários...</p>';

    try {
        // Carregar do localStorage como base
        let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        
        // Se tiver Firestore, buscar lá também
        if (window.db && window.SINCRONIZACAO?.estaConectado()) {
            const snapshot = await db.collection('usuarios').get();
            usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }

        renderizarUsuarios(usuarios);
    } catch (erro) {
        console.warn('Carregando do cache:', erro);
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        renderizarUsuarios(usuarios);
    }
}

function renderizarUsuarios(usuarios) {
    if (!listaUsuarios) return;
    
    if (usuarios.length === 0) {
        listaUsuarios.innerHTML = '<p style="text-align:center; color:var(--texto-claro); padding:2rem;">Nenhum usuário cadastrado ainda.</p>';
        return;
    }

    const nivelBadge = {
        administrador: '🔑 Administrador',
        gerente: '📊 Gerente',
        tecnico: '🌿 Técnico'
    };

    listaUsuarios.innerHTML = '';
    usuarios.forEach((user, index) => {
        const card = document.createElement('div');
        card.className = 'card-visita';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
                <div>
                    <h4 style="margin:0 0 0.3rem 0; font-size:1.05rem;">${user.nome || 'Sem nome'}</h4>
                    <p style="margin:0.25rem 0; font-size:0.9rem;">📧 ${user.email}</p>
                    <span style="display:inline-block; margin-top:0.4rem; padding:0.2rem 0.6rem; background:rgba(99,91,255,0.15); border-radius:12px; font-size:0.8rem;">
                        ${nivelBadge[user.nivel] || user.nivel}
                    </span>
                    ${user.criadoEm ? `<p style="margin:0.4rem 0 0 0; font-size:0.8rem; color:var(--texto-claro);">Cadastrado em: ${user.criadoEm}</p>` : ''}
                </div>
                <div style="display:flex; flex-direction:column; gap:0.4rem;">
                    <select id="nivel-${index}" onchange="alterarNivel('${user.id || index}', this.value)" class="campo" style="max-width:160px; font-size:0.85rem; padding:0.3rem;">
                        <option value="administrador" ${user.nivel === 'administrador' ? 'selected' : ''}>🔑 Admin</option>
                        <option value="gerente" ${user.nivel === 'gerente' ? 'selected' : ''}>📊 Gerente</option>
                        <option value="tecnico" ${user.nivel === 'tecnico' ? 'selected' : ''}>🌿 Técnico</option>
                    </select>
                    <button onclick="excluirUsuario('${user.id || index}', '${user.email}')" class="btn-perigo btn-sm" style="font-size:0.85rem;">🗑️ Excluir</button>
                </div>
            </div>
        `;
        listaUsuarios.appendChild(card);
    });
}

// ===== CADASTRAR NOVO USUÁRIO =====
if (formUsuario) {
    formUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!verificarPermissaoAdmin()) {
            alert('❌ Sem permissão para esta ação!');
            return;
        }

        const nome = document.getElementById('nome-usuario').value.trim();
        const email = document.getElementById('email-usuario').value.trim();
        const senha = document.getElementById('senha-usuario').value;
        const nivel = document.getElementById('nivel-usuario').value;

        if (senha.length < 6) {
            alert('⚠️ A senha deve ter pelo menos 6 caracteres!');
            return;
        }

        const botao = formUsuario.querySelector('button[type="submit"]');
        botao.disabled = true;
        botao.textContent = '⏳ Criando usuário...';

        try {
            let uid = null;
            let sucesso = false;

            // 1. Criar no Firebase Auth (se disponível)
            if (window.auth && window.SINCRONIZACAO?.estaConectado()) {
                try {
                    const userCred = await auth.createUserWithEmailAndPassword(email, senha);
                    uid = userCred.user.uid;
                    console.log('✅ Usuário criado no Firebase Auth:', uid);
                    sucesso = true;
                } catch (fbErro) {
                    console.warn('Firebase indisponível, salvando localmente:', fbErro.message);
                }
            }

            // Fallback: usar ID local se não tiver Firebase
            if (!uid) {
                uid = 'local_' + Date.now();
            }

            // 2. Salvar dados no Firestore + localStorage
            const novoUsuario = {
                id: uid,
                uid: uid,
                nome: nome,
                email: email,
                nivel: nivel,
                criadoEm: new Date().toLocaleString('pt-BR'),
                criadoPor: window.usuarioLogado?.email || 'sistema'
            };

            // Salvar no Firestore
            if (window.db && window.SINCRONIZACAO?.estaConectado()) {
                await db.collection('usuarios').doc(uid).set(novoUsuario);
            }

            // Salvar no localStorage
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || []);
            usuarios.push(novoUsuario);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));

            alert(`✅ Usuário criado com sucesso!\n\nE-mail: ${email}\nSenha: ${senha}\nNível: ${nivel}`);
            formUsuario.reset();
            carregarUsuarios();

        } catch (erro) {
            console.error('Erro ao criar usuário:', erro);
            alert(`❌ Erro: ${erro.message}`);
        } finally {
            botao.disabled = false;
            botao.textContent = '✅ Criar Usuário';
        }
    });
}

// ===== ALTERAR NÍVEL =====
window.alterarNivel = async function(idUsuario, novoNivel) {
    if (!confirm('Alterar nível de acesso deste usuário?')) return;

    try {
        // Atualizar Firestore
        if (window.db && window.SINCRONIZACAO?.estaConectado() && !String(idUsuario).startsWith('local_')) {
            await db.collection('usuarios').doc(idUsuario).update({ nivel: novoNivel });
        }
        
        // Atualizar localStorage
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || []);
        const indice = usuarios.findIndex(u => String(u.id) === String(idUsuario));
        if (indice !== -1) {
            usuarios[indice].nivel = novoNivel;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }

        alert('✅ Nível de acesso atualizado!');
    } catch (erro) {
        console.error(erro);
        alert('❌ Erro ao atualizar: ' + erro.message);
    }
};

// ===== EXCLUIR USUÁRIO =====
window.excluirUsuario = async function(idUsuario, email) {
    if (!confirm(`⚠️ Tem certeza que deseja excluir o usuário:\n${email}\n\nEsta ação não pode ser desfeita!`)) return;
    
    // Não permitir excluir o próprio usuário logado
    if (email === window.usuarioLogado?.email) {
        alert('❌ Você não pode excluir seu próprio usuário!');
        return;
    }

    try {
        // Remover do Firestore
        if (window.db && window.SINCRONIZACAO?.estaConectado() && !String(idUsuario).startsWith('local_')) {
            await db.collection('usuarios').doc(idUsuario).delete();
        }
        
        // Remover do localStorage
        let usuarios = JSON.parse(localStorage.getItem('usuarios') || []);
        usuarios = usuarios.filter(u => String(u.id) !== String(idUsuario));
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        alert('✅ Usuário excluído com sucesso!');
        carregarUsuarios();
    } catch (erro) {
        console.error(erro);
        alert('❌ Erro ao excluir: ' + erro.message);
    }
};

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', carregarUsuarios);