// ==============================================
// AGROMANEJO — Versão Atualizada ✅
// Correções: Perfis corretos + Exclusão com aviso
// ==============================================

console.log('✅ Sistema carregado!');

// ========== FIREBASE CONFIG ==========
const firebaseConfig = {
    apiKey: "AIzaSyAOZSFIQquhdQi1Lk8Gq1dUjzd6pxn0wSE",
    authDomain: "agromanejo-22dff.firebaseapp.com",
    projectId: "agromanejo-22dff",
    storageBucket: "agromanejo-22dff.firebasestorage.app",
    messagingSenderId: "31965036380",
    appId: "1:31965036380:web:16582b60640fad20ad8b99",
    measurementId: "G-VM9FENPQN3"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

let usuarioAtual = null;
let mapa = null;
let marcadores = [];
let mesReferencia = new Date();
let dataSelecionada = null;
let filtroVisitas = 'todas';
let editarId = null;

// ========== UTILITÁRIOS ==========
function mostrarToast(mensagem, tipo='sucesso') {
    const t = document.createElement('div');
    t.className = `toast ${tipo === 'erro' ? 'erro' : ''}`;
    t.textContent = mensagem;
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:linear-gradient(135deg,#00e5ff,#7b2ffd);color:white;padding:1rem 1.5rem;border-radius:10px;box-shadow:0 5px 20px rgba(0,229,255,.25);z-index:9999;';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
function formatoData(d) { return new Date(d).toLocaleDateString('pt-BR'); }

// ========== LOGIN ==========
async function fazerLogin() {
    const email = document.getElementById('login-email')?.value;
    const senha = document.getElementById('login-senha')?.value;
    const erro = document.getElementById('erro-login');
    
    if (!email || !senha) {
        erro.textContent = 'Preencha todos os campos!';
        erro.style.display = 'block';
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, senha);
        window.location.href = 'principal.html';
    } catch (e) {
        erro.textContent = e.message;
        erro.style.display = 'block';
        console.error('Erro de login:', e);
    }
}

function sairDoSistema() {
    auth.signOut().then(() => window.location.href = 'login.html');
}

// ========== INICIALIZAÇÃO PRINCIPAL ==========
function inicializarInterface() {
    console.log('📌 Inicializando interface...');
    
    document.querySelectorAll('.aba-btn').forEach(btn => btn.classList.remove('ativa'));
    document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('visivel'));
    
    const abaPainel = document.querySelector('.aba-btn[data-aba="painel"]');
    const conteudoPainel = document.getElementById('aba-painel');
    if (abaPainel) abaPainel.classList.add('ativa');
    if (conteudoPainel) conteudoPainel.classList.add('visivel');
    
    console.log('✅ Interface pronta!');
}

// ========== VERIFICAR AUTENTICAÇÃO ==========
auth.onAuthStateChanged(async (user) => {
    console.log('🔍 Usuário:', user ? user.email : 'Nenhum');
    
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'principal.html';
        return;
    }
    
    if (!user && !window.location.pathname.includes('login.html')) {
        if (document.getElementById('login-email')) return;
        window.location.href = 'login.html';
        return;
    }
    
    if (user && document.getElementById('nome-usuario')) {
        usuarioAtual = user;
        document.getElementById('nome-usuario').textContent = 'Administrador';
        document.getElementById('email-usuario').textContent = user.email;
        
        inicializarInterface();
        
        try {
            await carregarTudo();
        } catch (e) {
            console.warn('⚠️ Erro ao carregar dados:', e);
            mostrarToast('Atenção: alguns dados não puderam ser carregados', 'erro');
        }
    }
});

// ========== NAVEGAÇÃO DE ABAS ==========
document.addEventListener('click', e => {
    if (e.target.classList.contains('aba-btn')) {
        document.querySelectorAll('.aba-btn').forEach(b => b.classList.remove('ativa'));
        document.querySelectorAll('.aba-conteudo').forEach(c => c.classList.remove('visivel'));
        e.target.classList.add('ativa');
        const abaId = 'aba-' + e.target.dataset.aba;
        const alvo = document.getElementById(abaId);
        if (alvo) alvo.classList.add('visivel');
        else console.warn('⚠️ Aba não encontrada:', abaId);
        
        if (e.target.dataset.aba === 'calendario') setTimeout(renderizarCalendario, 50);
        if (e.target.dataset.aba === 'mapa') setTimeout(inicializarMapa, 100);
        if (e.target.dataset.aba === 'visitas') carregarSelectsVisitas();
        if (e.target.dataset.aba === 'relatorios') carregarSelectRelatorios();
    }
    if (e.target.classList.contains('filtro-btn')) {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativa'));
        e.target.classList.add('ativa');
        filtroVisitas = e.target.dataset.filtro;
        carregarVisitas();
    }
});

// ========== 👤 USUÁRIOS — CORRIGIDO ✅ ==========
async function salvarUsuario() {
    const nome = document.getElementById('u-nome')?.value;
    const email = document.getElementById('u-email')?.value;
    const senha = document.getElementById('u-senha')?.value;
    const perfil = document.getElementById('u-perfil')?.value;
    
    console.log('📝 Salvando usuário — Perfil selecionado:', perfil);
    
    if (!nome || !email || !senha) { 
        mostrarToast('Preencha TODOS os campos!', 'erro'); 
        return; 
    }
    
    if (!perfil) {
        mostrarToast('Selecione o perfil!', 'erro');
        return;
    }
    
    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, senha);
        
        await db.collection('usuarios').add({ 
            nome, 
            email, 
            perfil,
            uid: userCred.user.uid,
            criadoPor: usuarioAtual?.email, 
            criadoEm: new Date() 
        });
        
        const perfilNome = perfil === 'tecnico' ? 'Técnico' : perfil === 'gerente' ? 'Gerente' : 'Administrador';
        mostrarToast(`✅ Usuário "${nome}" criado como ${perfilNome}! Já pode fazer login!`);
        fecharForm('usuario');
        carregarUsuarios();
        
    } catch(e) {
        console.error('❌ Erro:', e.code, e.message);
        if (e.code === 'auth/email-already-in-use') {
            mostrarToast('❌ Este e-mail JÁ está cadastrado! Use outro.', 'erro');
        } else if (e.code === 'auth/weak-password') {
            mostrarToast('❌ A senha precisa ter pelo MENOS 6 caracteres!', 'erro');
        } else {
            mostrarToast('❌ Erro: ' + e.message, 'erro');
        }
    }
}

async function carregarUsuarios() {
    const lista = document.getElementById('lista-usuarios');
    if (!lista) return;
    try {
        const snap = await db.collection('usuarios').get();
        if (snap.empty) { 
            lista.innerHTML = '<p class="texto-vazio">Nenhum usuário cadastrado.</p>'; 
            return; 
        }
        lista.innerHTML = snap.docs.map(d => {
            const u = d.data();
            const perfilTexto = u.perfil === 'tecnico' ? '👨‍🌾 Técnico' : 
                               u.perfil === 'gerente' ? '📊 Gerente' : '🔑 Administrador';
            const corPerfil = u.perfil === 'tecnico' ? '#10b981' : 
                            u.perfil === 'gerente' ? '#f59e0b' : '#635bff';
            return `<div class="item-registro">
                <div>
                    <strong>${u.nome || '-'}</strong><br>
                    <span style="font-size:.8rem;color:var(--texto-suave)">${u.email}</span>
                    <span class="status-etiqueta" style="margin-left:0.5rem;background:${corPerfil};color:white;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.75rem;">
                        ${perfilTexto}
                    </span>
                </div>
                <div>
                    <button class="btn-perigo btn-sm" onclick="excluirUsuarioCompleto('${d.id}', '${u.uid || ''}', '${u.email}')">🗑️ Excluir</button>
                </div>
            </div>`;
        }).join('');
    } catch(e) { 
        lista.innerHTML = '<p class="texto-vazio">Erro ao carregar.</p>'; 
    }
}

// ========== 🗑️ EXCLUIR USUÁRIO COMPLETO ✅ ==========
async function excluirUsuarioCompleto(docId, uid, email) {
    if (!confirm(`Tem certeza que deseja excluir este usuário?\n${email}`)) return;
    
    try {
        await db.collection('usuarios').doc(docId).delete();
        
        const excluido = confirm(
            '✅ Excluído da lista do sistema!\n\n' +
            'Para apagar o login também:\n' +
            '→ Clique em "OK" para abrir o painel do Firebase\n' +
            '→ Ou "Cancelar" se quiser manter o acesso por enquanto'
        );
        
        if (excluido) {
            window.open('https://console.firebase.google.com/project/agromanejo-22dff/authentication/users', '_blank');
            mostrarToast('✅ Abra o Firebase e exclua manualmente o usuário!');
        } else {
            mostrarToast('✅ Removido da lista. Login mantido.');
        }
        
        carregarUsuarios();
        
    } catch(e) {
        mostrarToast('❌ Erro: ' + e.message, 'erro');
    }
}

function formUsuario() { 
    const form = document.getElementById('form-usuario');
    const titulo = document.getElementById('titulo-form-usuario');
    if (form) form.classList.remove('oculto');
    if (titulo) titulo.textContent = 'Cadastrar Usuário';
    editarId = null; 
}

// ========== 🏠 CLIENTES / FAZENDAS ==========
async function salvarCliente() {
    const dados = {
        nome: document.getElementById('c-nome')?.value,
        proprietario: document.getElementById('c-proprietario')?.value,
        cidade: document.getElementById('c-cidade')?.value,
        telefone: document.getElementById('c-telefone')?.value,
        obs: document.getElementById('c-obs')?.value,
        criadoPor: usuarioAtual?.email,
        criadoEm: new Date()
    };
    if (!dados.nome) { mostrarToast('Informe o nome da fazenda!', 'erro'); return; }
    try {
        await db.collection('clientes').add(dados);
        mostrarToast('✅ Fazenda salva!');
        fecharForm('cliente');
        carregarClientes();
    } catch(e) { mostrarToast('❌ Erro: ' + e.message, 'erro'); }
}

async function carregarClientes() {
    const lista = document.getElementById('lista-clientes');
    if (!lista) return;
    try {
        const snap = await db.collection('clientes').orderBy('nome', 'asc').get();
        window._todosClientes = snap.docs.map(d => ({id:d.id, ...d.data()}));
        filtrarClientes();
    } catch(e) { lista.innerHTML = '<p class="texto-vazio">Erro ao carregar.</p>'; }
}

function filtrarClientes() {
    const busca = document.getElementById('pesq-cliente')?.value?.toLowerCase() || '';
    const lista = document.getElementById('lista-clientes');
    if (!lista || !window._todosClientes) return;
    const filtrados = window._todosClientes.filter(c => 
        (c.nome && c.nome.toLowerCase().includes(busca)) || 
        (c.proprietario && c.proprietario.toLowerCase().includes(busca))
    );
    if (!filtrados.length) { lista.innerHTML = '<p class="texto-vazio">Nenhuma fazenda encontrada.</p>'; return; }
    lista.innerHTML = filtrados.map(c => `
        <div class="item-registro">
            <div><strong>${c.nome}</strong><br><span style="font-size:.8rem;color:var(--texto-suave)">${c.proprietario || ''} • ${c.cidade || ''}</span></div>
            <div><button class="btn-perigo btn-sm" onclick="excluirItem('clientes','${c.id}')">🗑️</button></div>
        </div>
    `).join('');
}

function formCliente() { 
    const form = document.getElementById('form-cliente');
    if (form) form.classList.remove('oculto');
    editarId = null; 
}

// ========== 🌿 TALHÕES ==========
async function salvarTalhao() {
    const dados = {
        clienteId: document.getElementById('t-cliente')?.value,
        clienteNome: document.getElementById('t-cliente')?.selectedOptions?.[0]?.text || '',
        nome: document.getElementById('t-nome')?.value,
        area: document.getElementById('t-area')?.value,
        cultura: document.getElementById('t-cultura')?.value,
        variedade: document.getElementById('t-variedade')?.value,
        criadoPor: usuarioAtual?.email,
        criadoEm: new Date()
    };
    if (!dados.nome || !dados.clienteId) { mostrarToast('Selecione a fazenda e informe o nome!', 'erro'); return; }
    try {
        await db.collection('talhoes').add(dados);
        mostrarToast('✅ Talhão salvo!');
        fecharForm('talhao');
        carregarTalhoes();
    } catch(e) { mostrarToast('❌ Erro: ' + e.message, 'erro'); }
}

async function carregarTalhoes() {
    const lista = document.getElementById('lista-talhoes');
    const select = document.getElementById('t-cliente');
    if (!lista) return;
    try {
        const snap = await db.collection('talhoes').get();
        const snapClientes = await db.collection('clientes').orderBy('nome').get();
        if (select) {
            select.innerHTML = '<option value="">Selecione...</option>' + 
                snapClientes.docs.map(d => `<option value="${d.id}">${d.data().nome}</option>`).join('');
        }
        if (snap.empty) { lista.innerHTML = '<p class="texto-vazio">Nenhum talhão cadastrado.</p>'; return; }
        lista.innerHTML = snap.docs.map(d => {
            const t = d.data();
            return `<div class="item-registro">
                <div><strong>${t.nome}</strong><br><span style="font-size:.8rem;color:var(--texto-suave)">${t.clienteNome} • ${t.area}ha • ${t.cultura || ''}</span></div>
                <div><button class="btn-perigo btn-sm" onclick="excluirItem('talhoes','${d.id}')">🗑️</button></div>
            </div>`;
        }).join('');
    } catch(e) { lista.innerHTML = '<p class="texto-vazio">Erro ao carregar.</p>'; }
}

function formTalhao() { 
    const form = document.getElementById('form-talhao');
    if (form) form.classList.remove('oculto');
    editarId = null; 
}

// ========== 📅 VISITAS ==========
async function carregarSelectsVisitas() {
    const cSelect = document.getElementById('v-cliente');
    const tSelect = document.getElementById('v-tecnico');
    if (!cSelect || !tSelect) return;
    try {
        const snapClientes = await db.collection('clientes').orderBy('nome').get();
        const snapUsuarios = await db.collection('usuarios').get();
        cSelect.innerHTML = '<option value="">Selecione...</option>' + 
            snapClientes.docs.map(d => `<option value="${d.id}">${d.data().nome}</option>`).join('');
        tSelect.innerHTML = '<option value="">Selecione...</option>' + 
            snapUsuarios.docs.map(d => `<option value="${d.id}">${d.data().nome || d.data().email}</option>`).join('');
    } catch(e) {}
}

async function atualizarTalhoesSelect() {
    const cliId = document.getElementById('v-cliente')?.value;
    const tSelect = document.getElementById('v-talhao');
    if (!tSelect) return;
    if (!cliId) { tSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>'; return; }
    try {
        const snap = await db.collection('talhoes').where('clienteId', '==', cliId).get();
        tSelect.innerHTML = '<option value="">Selecione o talhão...</option>' + 
            snap.docs.map(d => `<option value="${d.id}">${d.data().nome}</option>`).join('');
    } catch(e) {}
}

function pegarLocalizacaoAtual() {
    if (!navigator.geolocation) { mostrarToast('Geolocalização não suportada', 'erro'); return; }
    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = document.getElementById('v-lat');
            const lng = document.getElementById('v-lng');
            if (lat) lat.value = pos.coords.latitude.toFixed(6);
            if (lng) lng.value = pos.coords.longitude.toFixed(6);
            mostrarToast('📍 Localização capturada!');
        },
        err => mostrarToast('❌ Erro ao obter localização', 'erro')
    );
}

async function salvarVisita() {
    const dados = {
        clienteId: document.getElementById('v-cliente')?.value,
        clienteNome: document.getElementById('v-cliente')?.selectedOptions?.[0]?.text || '',
        talhaoId: document.getElementById('v-talhao')?.value,
        talhaoNome: document.getElementById('v-talhao')?.selectedOptions?.[0]?.text || '',
        data: document.getElementById('v-data')?.value,
        horario: document.getElementById('v-hora')?.value,
        tecnicoId: document.getElementById('v-tecnico')?.value,
        tecnicoNome: document.getElementById('v-tecnico')?.selectedOptions?.[0]?.text || '',
        lat: document.getElementById('v-lat')?.value,
        lng: document.getElementById('v-lng')?.value,
        observacao: document.getElementById('v-obs')?.value,
        status: 'agendada',
        criadoPor: usuarioAtual?.email,
        criadoEm: new Date()
    };
    if (!dados.clienteNome || !dados.data) { mostrarToast('Preencha os campos obrigatórios!', 'erro'); return; }
    try {
        await db.collection('visitas').add(dados);
        mostrarToast('✅ Visita agendada!');
        fecharForm('visita');
        carregarVisitas();
        atualizarPainel();
        atualizarMapa();
    } catch(e) { mostrarToast('❌ Erro: ' + e.message, 'erro'); }
}

async function carregarVisitas() {
    const lista = document.getElementById('lista-visitas');
    if (!lista) return;
    try {
        const snap = await db.collection('visitas').orderBy('data', 'asc').get();
        let visitas = snap.docs.map(d => ({id:d.id, ...d.data()}));
        if (filtroVisitas !== 'todas') {
            visitas = visitas.filter(v => v.status === filtroVisitas);
        }
        if (!visitas.length) { lista.innerHTML = '<p class="texto-vazio">Nenhuma visita encontrada.</p>'; return; }
        lista.innerHTML = visitas.map(v => {
            const statusClass = v.status === 'agendada' ? 'status-agendada' : 
                               v.status === 'andamento' ? 'status-andamento' : 'status-concluida';
            const statusTexto = v.status === 'agendada' ? '⏳ Agendada' : 
                                v.status === 'andamento' ? '🚗 Em Andamento' : '✅ Concluída';
            return `<div class="item-registro">
                <div>
                    <strong>${v.clienteNome}</strong> — ${v.talhaoNome || 'Sem talhão'}<br>
                    <span style="font-size:.8rem;color:var(--texto-suave)">📅 ${formatoData(v.data)} às ${v.horario || '--:--'} • 👨‍🌾 ${v.tecnicoNome || 'Não atribuído'}</span>
                    <span class="status-etiqueta ${statusClass}" style="margin-left:0.5rem;">${statusTexto}</span>
                </div>
                <div style="display:flex;gap:0.3rem;">
                    ${v.status === 'agendada' ? `<button class="btn-secundario btn-sm" onclick="iniciarVisita('${v.id}')">🚗 Iniciar</button>` : ''}
                    ${v.status === 'andamento' ? `<button class="btn-primario btn-sm" onclick="concluirVisita('${v.id}')">✅ Concluir</button>` : ''}
                    <button class="btn-perigo btn-sm" onclick="excluirItem('visitas','${v.id}')">🗑️</button>
                </div>
            </div>`;
        }).join('');
    } catch(e) { lista.innerHTML = '<p class="texto-vazio">Erro ao carregar.</p>'; }
}

async function iniciarVisita(id) {
    try {
        await db.collection('visitas').doc(id).update({ status: 'andamento', inicio: new Date() });
        mostrarToast('🚗 Visita em andamento!');
        carregarVisitas();
        atualizarPainel();
    } catch(e) { mostrarToast('❌ Erro: ' + e.message, 'erro'); }
}

async function concluirVisita(id) {
    try {
        await db.collection('visitas').doc(id).update({ status: 'concluida', fim: new Date() });
        mostrarToast('✅ Visita concluída!');
        carregarVisitas();
        atualizarPainel();
        atualizarMapa();
    } catch(e) { mostrarToast('❌ Erro: ' + e.message, 'erro'); }
}

function formVisita() { 
    const form = document.getElementById('form-visita');
    if (form) form.classList.remove('oculto');
    carregarSelectsVisitas();
    editarId = null; 
}

// ========== 📊 PAINEL ==========
async function atualizarPainel() {
    const elTotal = document.getElementById('total-visitas');
    const elAgendadas = document.getElementById('visitas-agendadas');
    const elAndamento = document.getElementById('visitas-andamento');
    const elConcluidas = document.getElementById('visitas-concluidas');
    const elProximas = document.getElementById('proximas-visitas');
    
    if (!elTotal) return;
    try {
        const snap = await db.collection('visitas').get();
        const visitas = snap.docs.map(d => d.data());
        elTotal.textContent = visitas.length;
        if (elAgendadas) elAgendadas.textContent = visitas.filter(v => v.status === 'agendada').length;
        if (elAndamento) elAndamento.textContent = visitas.filter(v => v.status === 'andamento').length;
        if (elConcluidas) elConcluidas.textContent = visitas.filter(v => v.status === 'concluida').length;
        
        if (elProximas) {
            const proximas = visitas.filter(v => v.status !== 'concluida').sort((a,b) => new Date(a.data) - new Date(b.data)).slice(0,5);
            if (!proximas.length) { elProximas.innerHTML = '<p class="texto-vazio">Nenhuma visita agendada.</p>'; return; }
            elProximas.innerHTML = proximas.map(v => `
                <div style="padding:0.5rem 0;border-bottom:1px solid var(--borda);">
                    <strong>${v.clienteNome}</strong> — ${formatoData(v.data)} às ${v.horario || '--:--'}
                </div>
            `).join('');
        }
    } catch(e) {}
}

// ========== 🗓️ CALENDÁRIO ==========
async function renderizarCalendario() {
    const elMes = document.getElementById('mes-atual');
    const elCorpo = document.getElementById('corpo-calendario');
    if (!elMes || !elCorpo) return;
    
    const ano = mesReferencia.getFullYear();
    const mes = mesReferencia.getMonth();
    elMes.textContent = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][mes] + ' ' + ano;
    
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const hoje = new Date();
    
    let visitas = [];
    try {
        const snap = await db.collection('visitas').get();
        visitas = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } catch(e) {}
    
    elCorpo.innerHTML = '';
    for (let i = 0; i < primeiroDia; i++) elCorpo.innerHTML += '<div class="dia-vazio"></div>';
    for (let dia = 1; dia <= ultimoDia; dia++) {
        const dataStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
        const temEvento = visitas.some(v => v.data === dataStr);
        const ehHoje = hoje.getDate() === dia && hoje.getMonth() === mes && hoje.getFullYear() === ano;
        const ehSelecionado = dataSelecionada === dataStr;
        
        elCorpo.innerHTML += `
            <div class="dia-mes ${ehHoje ? 'hoje' : ''} ${ehSelecionado ? 'selecionado' : ''}" 
                 onclick="selecionarData('${dataStr}')">
                ${dia}
                ${temEvento ? `<span class="ponto-evento"></span>` : ''}
            </div>
        `;
    }
}

function mesAnterior() { mesReferencia.setMonth(mesReferencia.getMonth() - 1); renderizarCalendario(); }
function proximoMes() { mesReferencia.setMonth(mesReferencia.getMonth() + 1); renderizarCalendario(); }

async function selecionarData(dataStr) {
    dataSelecionada = dataStr;
    renderizarCalendario();
    
    const elLista = document.getElementById('eventos-lista');
    const elData = document.getElementById('eventos-data');
    if (!elLista) return;
    
    if (elData) elData.textContent = 'Visitas — ' + formatoData(dataStr);
    
    try {
        const snap = await db.collection('visitas').where('data', '==', dataStr).get();
        if (snap.empty) { elLista.innerHTML = '<p class="texto-vazio">Nenhuma visita nesta data.</p>'; return; }
        elLista.innerHTML = snap.docs.map(d => {
            const v = d.data();
            return `<div class="item-registro">
                <div><strong>${v.clienteNome}</strong> — ${v.talhaoNome || 'Sem talhão'}<br>
                <span style="font-size:.8rem;color:var(--texto-suave)">⏰ ${v.horario || '--:--'} • 👨‍🌾 ${v.tecnicoNome || 'Não informado'}</span></div>
            </div>`;
        }).join('');
    } catch(e) { elLista.innerHTML = '<p class="texto-vazio">Erro ao carregar.</p>'; }
}

// ========== 🗺️ MAPA ==========
function inicializarMapa() {
    const elMapa = document.getElementById('mapa');
    if (!elMapa || mapa) return;
    try {
        mapa = L.map('mapa').setView([-15.77972, -47.92972], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapa);
        atualizarMapa();
    } catch(e) { console.warn('❌ Erro ao carregar mapa:', e); }
}

async function atualizarMapa() {
    if (!mapa) return;
    marcadores.forEach(m => mapa.removeLayer(m));
    marcadores = [];
    
    try {
        const snap = await db.collection('visitas').get();
        const visitas = snap.docs.map(d => ({id:d.id, ...d.data()})).filter(v => v.lat && v.lng);
        const lista = document.getElementById('lista-pontos-mapa');
        
        if (lista && !visitas.length) {
            lista.innerHTML = '<p class="texto-vazio">Nenhuma visita com localização cadastrada.</p>';
            return;
        }
        
        visitas.forEach(v => {
            const marker = L.marker([parseFloat(v.lat), parseFloat(v.lng)])
                .addTo(mapa)
                .bindPopup(`
                    <strong>${v.clienteNome}</strong><br>
                    ${v.talhaoNome || ''}<br>
                    📅 ${formatoData(v.data)}<br>
                    <em>${v.status === 'agendada' ? '⏳ Agendada' : v.status === 'andamento' ? '🚗 Em Andamento' : '✅ Concluída'}</em>
                `);
            marcadores.push(marker);
        });
        
        if (lista) {
            lista.innerHTML = visitas.map(v => `
                <div class="ponto-mapa-item">
                    <strong>${v.clienteNome}</strong> — ${v.talhaoNome || 'Sem talhão'}<br>
                    📅 ${formatoData(v.data)} • 📍 ${v.lat}, ${v.lng}
                </div>
            `).join('');
        }
    } catch(e) {}
}

function localizacaoAtual() {
    if (!navigator.geolocation) { mostrarToast('Geolocalização não suportada', 'erro'); return; }
    navigator.geolocation.getCurrentPosition(
        pos => {
            if (mapa) mapa.setView([pos.coords.latitude, pos.coords.longitude], 14);
            mostrarToast('📍 Localização encontrada!');
        },
        err => mostrarToast('❌ Erro ao obter localização', 'erro')
    );
}

function centralizarMapa() {
    if (!mapa || marcadores.length === 0) return;
    mapa.fitBounds(L.featureGroup(marcadores).getBounds(), { padding: [30, 30] });
}

// ========== 📄 RELATÓRIOS ==========
async function carregarSelectRelatorios() {
    const select = document.getElementById('r-cliente');
    if (!select) return;
    try {
        const snap = await db.collection('clientes').orderBy('nome').get();
        select.innerHTML = '<option value="">Selecione...</option>' + 
            snap.docs.map(d => `<option value="${d.id}">${d.data().nome}</option>`).join('');
    } catch(e) {}
}

function mostrarFiltroPeriodo() {
    document.getElementById('filtro-periodo')?.classList.remove('oculto');
    document.getElementById('filtro-cliente')?.classList.add('oculto');
    document.getElementById('area-relatorio')?.classList.add('oculto');
}

function mostrarFiltroCliente() {
    carregarSelectRelatorios();
    document.getElementById('filtro-cliente")?.classList.remove("oculto');
    document.getElementById('filtro-periodo')?.classList.add('oculto');
    document.getElementById('area-relatorio')?.classList.add('oculto');
}

function fecharFiltro(tipo) {
    document.getElementById(`filtro-${tipo}`)?.classList.add('oculto');
}

async function gerarRelatorioCompleto() {
    try {
        const snap = await db.collection('visitas').orderBy('data', 'desc').get();
        exibirRelatorio('Relatório Completo de Visitas', snap.docs.map(d => ({id:d.id, ...d.data()})));
    } catch(e) { mostrarToast('❌ Erro ao gerar relatório', 'erro'); }
}

async function gerarRelatorioPeriodo() {
    const inicio = document.getElementById('r-inicio')?.value;
    const fim = document.getElementById('r-fim')?.value;
    if (!inicio || !fim) { mostrarToast('Informe o período!', 'erro'); return; }
    try {
        const snap = await db.collection('visitas').where('data', '>=', inicio).where('data', '<=', fim).orderBy('data', 'asc').get();
        exibirRelatorio(`Relatório: ${formatoData(inicio)} a ${formatoData(fim)}`, snap.docs.map(d => ({id:d.id, ...d.data()})));
    } catch(e) { mostrarToast('❌ Erro ao gerar relatório', 'erro'); }
}

async function gerarRelatorioCliente() {
    const cliId = document.getElementById('r-cliente')?.value;
    if (!cliId) { mostrarToast('Selecione um cliente!', 'erro'); return; }
    const nomeCli = document.getElementById('r-cliente')?.selectedOptions?.[0]?.text;
    try {
        const snap = await db.collection('visitas').where('clienteId', '==', cliId).orderBy('data', 'desc').get();
        exibirRelatorio(`Relatório: ${nomeCli}`, snap.docs.map(d => ({id:d.id, ...d.data()})));
    } catch(e) { mostrarToast('❌ Erro ao gerar relatório', 'erro'); }
}

function exibirRelatorio(titulo, dados) {
    document.getElementById('area-relatorio')?.classList.remove('oculto');
    document.getElementById('filtro-periodo')?.classList.add('oculto');
    document.getElementById('filtro-cliente')?.classList.add('oculto');
    
    const conteudo = document.getElementById('conteudo-relatorio');
    if (!conteudo) return;
    
    if (!dados.length) {
        conteudo.innerHTML = '<p class="texto-vazio">Nenhum registro encontrado para este filtro.</p>';
        return;
    }
    
    conteudo.innerHTML = `
        <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:.9rem;">
                <thead>
                    <tr style="background:rgba(0,229,255,.08);">
                        <th style="padding:.7rem;text-align:left;border-bottom:1px solid var(--borda);">Data</th>
                        <th style="padding:.7rem;text-align:left;border-bottom:1px solid var(--borda);">Fazenda</th>
                        <th style="padding:.7rem;text-align:left;border-bottom:1px solid var(--borda);">Talhão</th>
                        <th style="padding:.7rem;text-align:left;border-bottom:1px solid var(--borda);">Técnico</th>
                        <th style="padding:.7rem;text-align:left;border-bottom:1px solid var(--borda);">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.map(v => `
                        <tr>
                            <td style="padding:.6rem;border-bottom:1px solid var(--borda);">${formatoData(v.data)}</td>
                            <td style="padding:.6rem;border-bottom:1px solid var(--borda);">${v.clienteNome}</td>
                            <td style="padding:.6rem;border-bottom:1px solid var(--borda);">${v.talhaoNome || '-'}</td>
                            <td style="padding:.6rem;border-bottom:1px solid var(--borda);">${v.tecnicoNome || '-'}</td>
                            <td style="padding:.6rem;border-bottom:1px solid var(--borda);">
                                ${v.status === 'agendada' ? '⏳ Agendada' : v.status === 'andamento' ? '🚗 Em Andamento' : '✅ Concluída'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <p style="margin-top:1rem;text-align:right;color:var(--texto-suave);font-size:.8rem;">
            Total: ${dados.length} registros • Gerado em: ${new Date().toLocaleString('pt-BR')}
        </p>
    `;
}

function fecharRelatorio() {
    document.getElementById('area-relatorio')?.classList.add('oculto');
}

function imprimirRelatorio() {
    const conteudo = document.getElementById('conteudo-relatorio')?.innerHTML || '';
    const janela = window.open('', '_blank');
    janela.document.write(`
        <html>
        <head>
            <title>Relatório AgroManejo</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #333; background: #fff; }
                h1 { text-align: center; color: #00e5ff; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f5f5f5; font-weight: bold; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <h1>🌾 AgroManejo — Relatório de Visitas Técnicas</h1>
            ${conteudo}
            <script>window.onload = function() { window.print(); };<\/script>
        </body>
        </html>
    `);
    janela.document.close();
}

// ========== 🗑️ EXCLUIR ITENS ==========
async function excluirItem(colecao, id) {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
        await db.collection(colecao).doc(id).delete();
        mostrarToast('✅ Excluído com sucesso!');
        if (colecao === 'usuarios') carregarUsuarios();
        if (colecao === 'clientes') carregarClientes();
        if (colecao === 'talhoes') carregarTalhoes();
        if (colecao === 'visitas') { carregarVisitas(); atualizarPainel(); atualizarMapa(); }
    } catch(e) { mostrarToast('❌ Erro ao excluir: ' + e.message, 'erro'); }
}

function fecharForm(tipo) {
    const form = document.getElementById(`form-${tipo}`);
    if (form) form.classList.add('oculto');
    editarId = null;
    
    if (tipo === 'usuario') {
        document.getElementById('u-nome') && (document.getElementById('u-nome').value = '');
        document.getElementById('u-email') && (document.getElementById('u-email').value = '');
        document.getElementById('u-senha') && (document.getElementById('u-senha').value = '');
    } else if (tipo === 'cliente') {
        document.getElementById('c-nome') && (document.getElementById('c-nome').value = '');
        document.getElementById('c-proprietario') && (document.getElementById('c-proprietario').value = '');
        document.getElementById('c-cidade') && (document.getElementById('c-cidade').value = '');
        document.getElementById('c-telefone') && (document.getElementById('c-telefone').value = '');
        document.getElementById('c-obs') && (document.getElementById('c-obs').value = '');
    } else if (tipo === 'talhao') {
        document.getElementById('t-cliente') && (document.getElementById('t-cliente').value = '');
        document.getElementById('t-nome') && (document.getElementById('t-nome').value = '');
        document.getElementById('t-area') && (document.getElementById('t-area').value = '');
        document.getElementById('t-cultura') && (document.getElementById('t-cultura').value = '');
        document.getElementById('t-variedade') && (document.getElementById('t-variedade').value = '');
    } else if (tipo === 'visita') {
        document.getElementById('v-cliente') && (document.getElementById('v-cliente').value = '');
        document.getElementById('v-talhao') && (document.getElementById('v-talhao').value = '');
        document.getElementById('v-data') && (document.getElementById('v-data').value = '');
        document.getElementById('v-hora') && (document.getElementById('v-hora').value = '');
        document.getElementById('v-tecnico') && (document.getElementById('v-tecnico').value = '');
        document.getElementById('v-lat') && (document.getElementById('v-lat').value = '');
        document.getElementById('v-lng') && (document.getElementById('v-lng').value = '');
        document.getElementById('v-obs') && (document.getElementById('v-obs').value = '');
    }
}

async function carregarTudo() {
    console.log('📦 Carregando dados...');
    await Promise.all([
        carregarUsuarios(),
        carregarClientes(),
        carregarTalhoes(),
        carregarVisitas(),
        atualizarPainel()
    ]);
    console.log('✅ Dados carregados!');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Página totalmente carregada!');
});