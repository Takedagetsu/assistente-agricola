// ============================================
// 🌿 SAFRATECH — JavaScript Completo + Atualizado
// ✅ Opção de localização manual adicionada!
// ============================================
// ============================================
// 🌿 SAFRATECH — Import do Firebase
// ============================================

import { db, auth } from './config/firebase-config.js';

// Disponibilizar globalmente (para manter compatibilidade com funções existentes)
window.db = db;
window.auth = auth;

console.log('✅ App.js carregado com Firebase disponível!');

// ===== VERIFICAÇÃO DE LOGIN =====
if (!window.location.pathname.includes('login.html')) {
    const logado = localStorage.getItem('safratech_logado');
    if (logado !== 'sim') {
        window.location.href = 'login.html';
    }
}

// ===== DADOS INICIAIS =====
function inicializarDados() {
    if (!localStorage.getItem('safratech_fazendas')) {
        localStorage.setItem('safratech_fazendas', JSON.stringify([]));
    }
    if (!localStorage.getItem('safratech_talhoes')) {
        localStorage.setItem('safratech_talhoes', JSON.stringify([]));
    }
    if (!localStorage.getItem('safratech_visitas')) {
        localStorage.setItem('safratech_visitas', JSON.stringify([]));
    }
    if (!localStorage.getItem('safratech_usuarios')) {
        const usuarios = [
            { id: 1, nome: 'Administrador', email: 'admin@safratech.com', senha: '123456', perfil: 'Administrador', telefone: '', status: 'ativo' }
        ];
        localStorage.setItem('safratech_usuarios', JSON.stringify(usuarios));
    }
    if (!localStorage.getItem('safratech_log')) {
        localStorage.setItem('safratech_log', JSON.stringify([]));
    }
}
inicializarDados();

// ===== NAVEGAÇÃO ENTRE ABAS =====
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.menu-item').forEach(botao => {
        botao.addEventListener('click', () => {
            const abaId = botao.getAttribute('data-aba');
            
            document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            
            document.querySelectorAll('.aba').forEach(aba => aba.classList.remove('ativo'));
            document.getElementById(abaId).classList.add('ativo');
            
            if (abaId === 'dashboard') carregarDashboard();
            if (abaId === 'fazendas') carregarFazendas();
            if (abaId === 'talhoes') carregarTalhoes();
            if (abaId === 'visitas') carregarVisitas();
            if (abaId === 'calendario') renderizarCalendario();
            if (abaId === 'usuarios') carregarUsuarios();
        });
    });

    // ===== SAIR DO SISTEMA =====
    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.removeItem('safratech_logado');
            localStorage.removeItem('safratech_nome');
            window.location.href = 'login.html';
        });
    }

    // ===== TALHÕES — Botão limpar GPS =====
    const btnLimparGpsTalhao = document.getElementById('btn-limpar-gps-talhao');
    if (btnLimparGpsTalhao) btnLimparGpsTalhao.addEventListener('click', () => {
        document.getElementById('tal-lat').value = '';
        document.getElementById('tal-lng').value = '';
        document.getElementById('tal-lat').focus();
        alert('✅ Campos limpos! Digite a latitude e longitude desejadas.');
    });

    // ===== VISITAS — Botões de Localização =====
    const btnGps = document.getElementById('btn-gps');
    if (btnGps) btnGps.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    document.getElementById('vis-lat').value = pos.coords.latitude.toFixed(6);
                    document.getElementById('vis-lng').value = pos.coords.longitude.toFixed(6);
                    alert('✅ Localização atual inserida com sucesso!');
                },
                () => alert('❌ Não foi possível obter a localização. Tente digitar manualmente.')
            );
        } else {
            alert('❌ Geolocalização não suportada pelo navegador. Digite manualmente.');
        }
    });

    const btnLimparGps = document.getElementById('btn-limpar-gps');
    if (btnLimparGps) btnLimparGps.addEventListener('click', () => {
        document.getElementById('vis-lat').value = '';
        document.getElementById('vis-lng').value = '';
        document.getElementById('vis-lat').focus();
        alert('✅ Campos limpos! Digite a latitude e longitude desejadas.');
    });

    // ===== Inicializar aba padrão =====
    carregarDashboard();
});

// ===== FUNÇÕES UTILITÁRIAS =====
function salvarLog(acao, detalhes) {
    const log = JSON.parse(localStorage.getItem('safratech_log') || '[]');
    log.unshift({
        data: new Date().toLocaleString('pt-BR'),
        usuario: localStorage.getItem('safratech_nome') || 'Administrador',
        acao,
        detalhes
    });
    localStorage.setItem('safratech_log', JSON.stringify(log));
}

function fecharTodosModais() {
    document.querySelectorAll('.form-modal').forEach(modal => modal.classList.add('oculto'));
}

document.querySelectorAll('.form-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('oculto');
    });
});

// ===== DASHBOARD =====
function carregarDashboard() {
    const fazendas = JSON.parse(localStorage.getItem('safratech_fazendas') || '[]');
    const talhoes = JSON.parse(localStorage.getItem('safratech_talhoes') || '[]');
    const visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    const usuarios = JSON.parse(localStorage.getItem('safratech_usuarios') || '[]');
    
    const elFazendas = document.getElementById('qtd-fazendas');
    const elTalhoes = document.getElementById('qtd-talhoes');
    const elUsuarios = document.getElementById('qtd-usuarios');
    const elAgendadas = document.getElementById('qtd-agendadas');
    const elAndamento = document.getElementById('qtd-andamento');
    const elConcluidas = document.getElementById('qtd-concluidas');
    
    if (elFazendas) elFazendas.textContent = fazendas.length;
    if (elTalhoes) elTalhoes.textContent = talhoes.length;
    if (elUsuarios) elUsuarios.textContent = usuarios.filter(u => u.status === 'ativo').length;
    if (elAgendadas) elAgendadas.textContent = visitas.filter(v => v.status === 'agendada').length;
    if (elAndamento) elAndamento.textContent = visitas.filter(v => v.status === 'andamento').length;
    if (elConcluidas) elConcluidas.textContent = visitas.filter(v => v.status === 'concluida').length;
    
    const listaProx = document.getElementById('lista-proximas');
    const proximas = visitas
        .filter(v => v.status !== 'concluida')
        .sort((a, b) => new Date(a.data) - new Date(b.data))
        .slice(0, 5);
    
    if (!listaProx) return;
    
    if (proximas.length === 0) {
        listaProx.innerHTML = '<p class="vazio">Nenhuma visita agendada</p>';
    } else {
        listaProx.innerHTML = proximas.map(v => `
            <div class="item-lista">
                <h4>${v.fazendaNome || 'Fazenda não informada'}</h4>
                <p>📅 ${v.data} às ${v.hora || '--:--'}</p>
                <p>👤 ${v.tecnico || 'Não informado'}</p>
                <span style="display:inline-block;padding:4px 8px;border-radius:4px;font-size:12px;background:${
                    v.status === 'agendada' ? 'rgba(249,115,22,0.1);color:#F97316' :
                    v.status === 'andamento' ? 'rgba(132,204,22,0.1);color:#84CC16' :
                    'rgba(148,163,184,0.1);color:#94A3B8'
                }">${v.status === 'agendada' ? '⏳ Agendada' : v.status === 'andamento' ? '🚗 Em Andamento' : '✅ Concluída'}</span>
            </div>
        `).join('');
    }
}

// ===== FAZENDAS =====
let editandoFazenda = null;

document.addEventListener('DOMContentLoaded', function() {
    const btnNovaFazenda = document.getElementById('btn-nova-fazenda');
    if (btnNovaFazenda) btnNovaFazenda.addEventListener('click', () => {
        editandoFazenda = null;
        document.getElementById('titulo-form-fazenda').textContent = 'Nova Fazenda';
        document.getElementById('form-fazenda').classList.remove('oculto');
        document.getElementById('faz-nome').value = '';
        document.getElementById('faz-proprietario').value = '';
        document.getElementById('faz-cidade').value = '';
        document.getElementById('faz-telefone').value = '';
        document.getElementById('faz-endereco').value = '';
        document.getElementById('faz-obs').value = '';
    });

    const btnFecharFazenda = document.getElementById('btn-fechar-fazenda');
    if (btnFecharFazenda) btnFecharFazenda.addEventListener('click', () => {
        document.getElementById('form-fazenda').classList.add('oculto');
    });

    const btnSalvarFazenda = document.getElementById('btn-salvar-fazenda');
    if (btnSalvarFazenda) btnSalvarFazenda.addEventListener('click', salvarFazenda);

    const pesqFazenda = document.getElementById('pesq-fazenda');
    if (pesqFazenda) pesqFazenda.addEventListener('input', carregarFazendas);
});

function salvarFazenda() {
    const nome = document.getElementById('faz-nome').value.trim();
    if (!nome) { alert('Informe o nome da fazenda!'); return; }
    
    const fazendas = JSON.parse(localStorage.getItem('safratech_fazendas') || '[]');
    
    if (editandoFazenda) {
        const idx = fazendas.findIndex(f => f.id === editandoFazenda);
        fazendas[idx] = {
            ...fazendas[idx],
            nome,
            proprietario: document.getElementById('faz-proprietario').value,
            cidade: document.getElementById('faz-cidade').value,
            telefone: document.getElementById('faz-telefone').value,
            endereco: document.getElementById('faz-endereco').value,
            obs: document.getElementById('faz-obs').value
        };
        salvarLog('Editar Fazenda', `Fazenda: ${nome}`);
    } else {
        fazendas.unshift({
            id: Date.now(),
            nome,
            proprietario: document.getElementById('faz-proprietario').value,
            cidade: document.getElementById('faz-cidade').value,
            telefone: document.getElementById('faz-telefone').value,
            endereco: document.getElementById('faz-endereco').value,
            obs: document.getElementById('faz-obs').value
        });
        salvarLog('Nova Fazenda', `Fazenda: ${nome}`);
    }
    
    localStorage.setItem('safratech_fazendas', JSON.stringify(fazendas));
    document.getElementById('form-fazenda').classList.add('oculto');
    carregarFazendas();
    atualizarSelectFazendas();
}

function carregarFazendas() {
    const fazendas = JSON.parse(localStorage.getItem('safratech_fazendas') || '[]');
    const lista = document.getElementById('lista-fazendas');
    if (!lista) return;
    
    const termo = document.getElementById('pesq-fazenda')?.value.toLowerCase() || '';
    
    const filtradas = fazendas.filter(f => 
        f.nome.toLowerCase().includes(termo) || 
        (f.proprietario && f.proprietario.toLowerCase().includes(termo))
    );
    
    if (filtradas.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhuma fazenda cadastrada ainda</p>';
    } else {
        lista.innerHTML = filtradas.map(f => `
            <div class="item-lista">
                <h4>🏠 ${f.nome}</h4>
                ${f.proprietario ? `<p>👤 Proprietário: ${f.proprietario}</p>` : ''}
                ${f.cidade ? `<p>📍 ${f.cidade}</p>` : ''}
                ${f.telefone ? `<p>📞 ${f.telefone}</p>` : ''}
                <div class="acoes">
                    <button onclick="editarFazenda(${f.id})">✏️ Editar</button>
                    <button onclick="excluirFazenda(${f.id})" style="background:rgba(234,88,12,0.1);color:#FCA58B;border:none;">🗑️ Excluir</button>
                </div>
            </div>
        `).join('');
    }
}

window.editarFazenda = function(id) {
    const fazendas = JSON.parse(localStorage.getItem('safratech_fazendas') || '[]');
    const f = fazendas.find(x => x.id === id);
    if (!f) return;
    
    editandoFazenda = id;
    document.getElementById('titulo-form-fazenda').textContent = 'Editar Fazenda';
    document.getElementById('faz-nome').value = f.nome;
    document.getElementById('faz-proprietario').value = f.proprietario || '';
    document.getElementById('faz-cidade').value = f.cidade || '';
    document.getElementById('faz-telefone').value = f.telefone || '';
    document.getElementById('faz-endereco').value = f.endereco || '';
    document.getElementById('faz-obs').value = f.obs || '';
    document.getElementById('form-fazenda').classList.remove('oculto');
};

window.excluirFazenda = function(id) {
    if (!confirm('Tem certeza que deseja excluir esta fazenda?')) return;
    let fazendas = JSON.parse(localStorage.getItem('safratech_fazendas') || '[]');
    const nome = fazendas.find(f => f.id === id)?.nome;
    fazendas = fazendas.filter(f => f.id !== id);
    localStorage.setItem('safratech_fazendas', JSON.stringify(fazendas));
    salvarLog('Excluir Fazenda', `Fazenda: ${nome}`);
    carregarFazendas();
    atualizarSelectFazendas();
};

function atualizarSelectFazendas() {
    const fazendas = JSON.parse(localStorage.getItem('safratech_fazendas') || '[]');
    const opcoes = '<option value="">Selecione uma fazenda...</option>' + 
        fazendas.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
    
    const visFazenda = document.getElementById('vis-fazenda');
    if (visFazenda) visFazenda.innerHTML = opcoes;
    
    const talFazenda = document.getElementById('tal-fazenda');
    if (talFazenda) talFazenda.innerHTML = opcoes;
    
    const relFazenda = document.getElementById('rel-fazenda');
    if (relFazenda) relFazenda.innerHTML = '<option value="">Todas as Fazendas</option>' + 
        fazendas.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
}

// ===== TALHÕES =====
let editandoTalhao = null;

document.addEventListener('DOMContentLoaded', function() {
    const btnNovoTalhao = document.getElementById('btn-novo-talhao');
    if (btnNovoTalhao) btnNovoTalhao.addEventListener('click', () => {
        editandoTalhao = null;
        document.getElementById('titulo-form-talhao').textContent = 'Novo Talhão';
        document.getElementById('form-talhao').classList.remove('oculto');
        document.getElementById('tal-fazenda').value = '';
        document.getElementById('tal-nome').value = '';
        document.getElementById('tal-area').value = '';
        document.getElementById('tal-cultura').value = '';
        document.getElementById('tal-variedade').value = '';
        document.getElementById('tal-lat').value = '';
        document.getElementById('tal-lng').value = '';
        document.getElementById('tal-obs').value = '';
        atualizarSelectFazendas();
    });

    const btnFecharTalhao = document.getElementById('btn-fechar-talhao');
    if (btnFecharTalhao) btnFecharTalhao.addEventListener('click', () => {
        document.getElementById('form-talhao').classList.add('oculto');
    });

    const btnSalvarTalhao = document.getElementById('btn-salvar-talhao');
    if (btnSalvarTalhao) btnSalvarTalhao.addEventListener('click', salvarTalhao);

    const pesqTalhao = document.getElementById('pesq-talhao');
    if (pesqTalhao) pesqTalhao.addEventListener('input', carregarTalhoes);
});

function salvarTalhao() {
    const fazendaId = document.getElementById('tal-fazenda').value;
    const nome = document.getElementById('tal-nome').value.trim();
    if (!fazendaId || !nome) { alert('Selecione a fazenda e informe o nome do talhão!'); return; }
    
    const fazendas = JSON.parse(localStorage.getItem('safratech_fazendas') || '[]');
    const fazenda = fazendas.find(f => f.id == fazendaId);
    const talhoes = JSON.parse(localStorage.getItem('safratech_talhoes') || '[]');
    
    if (editandoTalhao) {
        const idx = talhoes.findIndex(t => t.id === editandoTalhao);
        talhoes[idx] = {
            ...talhoes[idx],
            fazendaId,
            fazendaNome: fazenda?.nome || 'Desconhecida',
            nome,
            area: document.getElementById('tal-area').value,
            cultura: document.getElementById('tal-cultura').value,
            variedade: document.getElementById('tal-variedade').value,
            lat: document.getElementById('tal-lat').value,
            lng: document.getElementById('tal-lng').value,
            obs: document.getElementById('tal-obs').value
        };
        salvarLog('Editar Talhão', `Talhão: ${nome}`);
    } else {
        talhoes.unshift({
            id: Date.now(),
            fazendaId,
            fazendaNome: fazenda?.nome || 'Desconhecida',
            nome,
            area: document.getElementById('tal-area').value,
            cultura: document.getElementById('tal-cultura').value,
            variedade: document.getElementById('tal-variedade').value,
            lat: document.getElementById('tal-lat').value,
            lng: document.getElementById('tal-lng').value,
            obs: document.getElementById('tal-obs').value
        });
        salvarLog('Novo Talhão', `Talhão: ${nome} - ${fazenda?.nome}`);
    }
    
    localStorage.setItem('safratech_talhoes', JSON.stringify(talhoes));
    document.getElementById('form-talhao').classList.add('oculto');
    carregarTalhoes();
    atualizarSelectTalhoes();
}

function carregarTalhoes() {
    const talhoes = JSON.parse(localStorage.getItem('safratech_talhoes') || '[]');
    const lista = document.getElementById('lista-talhoes');
    if (!lista) return;
    
    const termo = document.getElementById('pesq-talhao')?.value.toLowerCase() || '';
    
    const filtrados = talhoes.filter(t => 
        t.nome.toLowerCase().includes(termo) || 
        t.fazendaNome.toLowerCase().includes(termo)
    );
    
    if (filtrados.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhum talhão cadastrado ainda</p>';
    } else {
        lista.innerHTML = filtrados.map(t => `
            <div class="item-lista">
                <h4>🌱 ${t.nome} — ${t.fazendaNome}</h4>
                ${t.area ? `<p>📐 Área: ${t.area} ha</p>` : ''}
                ${t.cultura ? `<p>🌾 Cultura: ${t.cultura}${t.variedade ? ` (${t.variedade})` : ''}</p>` : ''}
                ${t.lat && t.lng ? `<p>📍 ${t.lat}, ${t.lng}</p>` : ''}
                <div class="acoes">
                    <button onclick="editarTalhao(${t.id})">✏️ Editar</button>
                    <button onclick="excluirTalhao(${t.id})" style="background:rgba(234,88,12,0.1);color:#FCA58B;border:none;">🗑️ Excluir</button>
                </div>
            </div>
        `).join('');
    }
}

window.editarTalhao = function(id) {
    const talhoes = JSON.parse(localStorage.getItem('safratech_talhoes') || '[]');
    const t = talhoes.find(x => x.id === id);
    if (!t) return;
    
    editandoTalhao = id;
    atualizarSelectFazendas();
    document.getElementById('titulo-form-talhao').textContent = 'Editar Talhão';
    document.getElementById('tal-fazenda').value = t.fazendaId;
    document.getElementById('tal-nome').value = t.nome;
    document.getElementById('tal-area').value = t.area || '';
    document.getElementById('tal-cultura').value = t.cultura || '';
    document.getElementById('tal-variedade').value = t.variedade || '';
    document.getElementById('tal-lat').value = t.lat || '';
    document.getElementById('tal-lng').value = t.lng || '';
    document.getElementById('tal-obs').value = t.obs || '';
    document.getElementById('form-talhao').classList.remove('oculto');
};

window.excluirTalhao = function(id) {
    if (!confirm('Tem certeza que deseja excluir este talhão?')) return;
    let talhoes = JSON.parse(localStorage.getItem('safratech_talhoes') || '[]');
    const nome = talhoes.find(t => t.id === id)?.nome;
    talhoes = talhoes.filter(t => t.id !== id);
    localStorage.setItem('safratech_talhoes', JSON.stringify(talhoes));
    salvarLog('Excluir Talhão', `Talhão: ${nome}`);
    carregarTalhoes();
    atualizarSelectTalhoes();
};

function atualizarSelectTalhoes() {
    const talhoes = JSON.parse(localStorage.getItem('safratech_talhoes') || '[]');
    const opcoes = '<option value="">Selecione o talhão...</option>' + 
        talhoes.map(t => `<option value="${t.id}">${t.nome} — ${t.fazendaNome}</option>`).join('');
    
    const visTalhao = document.getElementById('vis-talhao');
    if (visTalhao) visTalhao.innerHTML = opcoes;
    
    const relTalhao = document.getElementById('rel-talhao');
    if (relTalhao) relTalhao.innerHTML = '<option value="">Todos os Talhões</option>' + 
        talhoes.map(t => `<option value="${t.id}">${t.nome} — ${t.fazendaNome}</option>`).join('');
}

// ===== VISITAS =====
let editandoVisita = null;
let filtroAtivo = 'todas';

document.addEventListener('DOMContentLoaded', function() {
    const btnNovaVisita = document.getElementById('btn-nova-visita');
    if (btnNovaVisita) btnNovaVisita.addEventListener('click', () => {
        editandoVisita = null;
        document.getElementById('titulo-form-visita').textContent = 'Agendar Nova Visita';
        document.getElementById('form-visita').classList.remove('oculto');
        document.getElementById('vis-fazenda').value = '';
        document.getElementById('vis-talhao').innerHTML = '<option value="">Selecione o talhão...</option>';
        document.getElementById('vis-data').value = '';
        document.getElementById('vis-hora').value = '';
        document.getElementById('vis-tecnico').value = '';
        document.getElementById('vis-lat').value = '';
        document.getElementById('vis-lng').value = '';
        document.getElementById('vis-obs').value = '';
        atualizarSelectFazendas();
        atualizarSelectTalhoes();
    });

    const btnFecharVisita = document.getElementById('btn-fechar-visita');
    if (btnFecharVisita) btnFecharVisita.addEventListener('click', () => {
        document.getElementById('form-visita').classList.add('oculto');
    });

    const visFazenda = document.getElementById('vis-fazenda');
    if (visFazenda) visFazenda.addEventListener('change', () => {
        const fazendaId = visFazenda.value;
        const talhoes = JSON.parse(localStorage.getItem('safratech_talhoes') || '[]');
        const filtrados = fazendaId ? talhoes.filter(t => t.fazendaId == fazendaId) : talhoes;
        const visTalhao = document.getElementById('vis-talhao');
        if (visTalhao) {
            visTalhao.innerHTML = '<option value="">Selecione o talhão...</option>' + 
                filtrados.map(t => `<option value="${t.id}">${t.nome}</option>`).join('');
        }
    });

    const btnSalvarVisita = document.getElementById('btn-salvar-visita');
    if (btnSalvarVisita) btnSalvarVisita.addEventListener('click', salvarVisita);

    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            filtroAtivo = btn.getAttribute('data-filtro');
            carregarVisitas();
        });
    });
});

function salvarVisita() {
    const fazendaId = document.getElementById('vis-fazenda').value;
    const data = document.getElementById('vis-data').value;
    if (!fazendaId || !data) { alert('Selecione a fazenda e a data da visita!'); return; }
    
    const fazendas = JSON.parse(localStorage.getItem('safratech_fazendas') || '[]');
    const fazenda = fazendas.find(f => f.id == fazendaId);
    const talhoes = JSON.parse(localStorage.getItem('safratech_talhoes') || '[]');
    const talhaoId = document.getElementById('vis-talhao').value;
    const talhao = talhaoId ? talhoes.find(t => t.id == talhaoId) : null;
    const visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    
    const dadosVisita = {
        id: editandoVisita || Date.now(),
        fazendaId,
        fazendaNome: fazenda?.nome || 'Desconhecida',
        talhaoId: talhaoId || null,
        talhaoNome: talhao?.nome || null,
        data,
        hora: document.getElementById('vis-hora').value,
        tecnico: document.getElementById('vis-tecnico').value,
        lat: document.getElementById('vis-lat').value,
        lng: document.getElementById('vis-lng').value,
        obs: document.getElementById('vis-obs').value,
        fotos: [],
        status: editandoVisita ? (visitas.find(v => v.id === editandoVisita)?.status || 'agendada') : 'agendada',
        criadoEm: editandoVisita ? visitas.find(v => v.id === editandoVisita)?.criadoEm : new Date().toLocaleString('pt-BR')
    };
    
    if (editandoVisita) {
        const idx = visitas.findIndex(v => v.id === editandoVisita);
        visitas[idx] = dadosVisita;
        salvarLog('Editar Visita', `Visita: ${dadosVisita.fazendaNome} - ${dadosVisita.data}`);
    } else {
        visitas.unshift(dadosVisita);
        salvarLog('Nova Visita', `Visita: ${dadosVisita.fazendaNome} - ${dadosVisita.data}`);
    }
    
    localStorage.setItem('safratech_visitas', JSON.stringify(visitas));
    document.getElementById('form-visita').classList.add('oculto');
    carregarVisitas();
    carregarDashboard();
}

function carregarVisitas() {
    const visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    const lista = document.getElementById('lista-visitas');
    if (!lista) return;
    
    let filtradas = visitas;
    if (filtroAtivo !== 'todas') {
        filtradas = visitas.filter(v => v.status === filtroAtivo);
    }
    
    if (filtradas.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhuma visita cadastrada ainda</p>';
    } else {
        lista.innerHTML = filtradas.map(v => `
            <div class="item-lista">
                <h4>📅 ${v.fazendaNome}</h4>
                ${v.talhaoNome ? `<p>🌱 Talhão: ${v.talhaoNome}</p>` : ''}
                <p>📅 ${v.data} às ${v.hora || '--:--'}</p>
                <p>👤 Técnico: ${v.tecnico || 'Não informado'}</p>
                ${v.lat && v.lng ? `<p>📍 ${v.lat}, ${v.lng}</p>` : ''}
                <span style="display:inline-block;padding:4px 8px;border-radius:4px;font-size:12px;background:${
                    v.status === 'agendada' ? 'rgba(249,115,22,0.1);color:#F97316' :
                    v.status === 'andamento' ? 'rgba(132,204,22,0.1);color:#84CC16' :
                    'rgba(16,185,129,0.1);color:#10B981'
                }">${v.status === 'agendada' ? '⏳ Agendada' : v.status === 'andamento' ? '🚗 Em Andamento' : '✅ Concluída'}</span>
                <div class="acoes">
                    ${v.status === 'agendada' ? `<button onclick="iniciarVisita(${v.id})" style="background:rgba(132,204,22,0.1);color:#84CC16;border:none;">🚗 Iniciar</button>` : ''}
                    ${v.status === 'andamento' ? `<button onclick="concluirVisita(${v.id})" style="background:rgba(16,185,129,0.1);color:#10B981;border:none;">✅ Concluir</button>` : ''}
                    <button onclick="editarVisita(${v.id})">✏️ Editar</button>
                    <button onclick="excluirVisita(${v.id})" style="background:rgba(234,88,12,0.1);color:#FCA58B;border:none;">🗑️ Excluir</button>
                    <button onclick="gerarLaudoVisita(${v.id})" style="background:rgba(251,191,36,0.1);color:#FBBF24;border:none;">📄 Laudo</button>
                </div>
            </div>
        `).join('');
    }
}

window.iniciarVisita = function(id) {
    const visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    const idx = visitas.findIndex(v => v.id === id);
    visitas[idx].status = 'andamento';
    localStorage.setItem('safratech_visitas', JSON.stringify(visitas));
    salvarLog('Iniciar Visita', `Visita: ${visitas[idx].fazendaNome}`);
    carregarVisitas();
    carregarDashboard();
};

window.concluirVisita = function(id) {
    const visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    const idx = visitas.findIndex(v => v.id === id);
    visitas[idx].status = 'concluida';
    localStorage.setItem('safratech_visitas', JSON.stringify(visitas));
    salvarLog('Concluir Visita', `Visita: ${visitas[idx].fazendaNome}`);
    carregarVisitas();
    carregarDashboard();
};

window.editarVisita = function(id) {
    const visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    const v = visitas.find(x => x.id === id);
    if (!v) return;
    
    editandoVisita = id;
    atualizarSelectFazendas();
    atualizarSelectTalhoes();
    document.getElementById('titulo-form-visita').textContent = 'Editar Visita';
    document.getElementById('vis-fazenda').value = v.fazendaId;
    document.getElementById('vis-data').value = v.data;
    document.getElementById('vis-hora').value = v.hora || '';
    document.getElementById('vis-tecnico').value = v.tecnico || '';
    document.getElementById('vis-lat').value = v.lat || '';
    document.getElementById('vis-lng').value = v.lng || '';
    document.getElementById('vis-obs').value = v.obs || '';
    document.getElementById('form-visita').classList.remove('oculto');
    
    const talhoes = JSON.parse(localStorage.getItem('safratech_talhoes') || '[]');
    const filtrados = talhoes.filter(t => t.fazendaId == v.fazendaId);
    const visTalhao = document.getElementById('vis-talhao');
    if (visTalhao) {
        visTalhao.innerHTML = '<option value="">Selecione o talhão...</option>' + 
            filtrados.map(t => `<option value="${t.id}" ${t.id == v.talhaoId ? 'selected' : ''}>${t.nome}</option>`).join('');
    }
};

window.excluirVisita = function(id) {
    if (!confirm('Tem certeza que deseja excluir esta visita?')) return;
    let visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    const nome = visitas.find(v => v.id === id)?.fazendaNome;
    visitas = visitas.filter(v => v.id !== id);
    localStorage.setItem('safratech_visitas', JSON.stringify(visitas));
    salvarLog('Excluir Visita', `Visita: ${nome}`);
    carregarVisitas();
    carregarDashboard();
};

window.gerarLaudoVisita = function(id) {
    const visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    const v = visitas.find(x => x.id === id);
    if (!v) return;
    
    const conteudo = `
        <div style="padding:30px;max-width:800px;margin:0 auto;background:#1C1917;color:#E7E5E4;font-family:Arial;">
            <div style="text-align:center;margin-bottom:30px;border-bottom:2px solid #FBBF24;padding-bottom:20px;">
                <h1 style="color:#FBBF24;margin:0;font-size:28px;">🌾 SAFRATECH — LAUDO DE VISITA TÉCNICA</h1>
                <p style="color:#A8A29E;margin-top:8px;">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr><td style="padding:10px;font-weight:bold;color:#FBBF24;width:40%;border-bottom:1px solid #3F3F46;">Fazenda</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${v.fazendaNome}</td></tr>
                ${v.talhaoNome ? `<tr><td style="padding:10px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Talhão</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${v.talhaoNome}</td></tr>` : ''}
                <tr><td style="padding:10px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Data</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${v.data} às ${v.hora || '--:--'}</td></tr>
                <tr><td style="padding:10px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Técnico Responsável</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${v.tecnico || 'Não informado'}</td></tr>
                ${v.lat && v.lng ? `<tr><td style="padding:10px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Coordenadas</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${v.lat}, ${v.lng}</td></tr>` : ''}
                <tr><td style="padding:10px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Status</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${v.status === 'agendada' ? '⏳ Agendada' : v.status === 'andamento' ? '🚗 Em Andamento' : '✅ Concluída'}</td></tr>
            </table>
            <h3 style="color:#FBBF24;margin-top:30px;">📝 Observações / Laudo Técnico</h3>
            <div style="background:#292524;padding:20px;border-radius:8px;white-space:pre-wrap;min-height:100px;">${v.obs || 'Nenhuma observação registrada.'}</div>
            <div style="margin-top:60px;text-align:center;">
                <p>___________________________________</p>
                <p>Assinatura do Técnico Responsável</p>
            </div>
        </div>
    `;
    
    const janela = window.open('', '_blank');
    janela.document.write(conteudo);
    janela.document.close();
    salvarLog('Gerar Laudo', `Fazenda: ${v.fazendaNome}`);
};

// ===== CALENDÁRIO =====
let dataAtual = new Date();
let dataSelecionada = null;

document.addEventListener('DOMContentLoaded', function() {
    const btnMesAnterior = document.getElementById('btn-mes-anterior');
    if (btnMesAnterior) btnMesAnterior.addEventListener('click', mesAnterior);

    const btnProximoMes = document.getElementById('btn-proximo-mes');
    if (btnProximoMes) btnProximoMes.addEventListener('click', proximoMes);
});

function mesAnterior() {
    dataAtual.setMonth(dataAtual.getMonth() - 1);
    renderizarCalendario();
}

function proximoMes() {
    dataAtual.setMonth(dataAtual.getMonth() + 1);
    renderizarCalendario();
}

function renderizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const nomeMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    
    const elementoMes = document.getElementById('mes-atual');
    if (elementoMes) elementoMes.textContent = `${nomeMeses[mes]} ${ano}`;
    
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    
    const visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    const corpo = document.getElementById('corpo-calendario');
    if (!corpo) return;
    corpo.innerHTML = '';
    
    for (let i = primeiroDia - 1; i >= 0; i--) {
        const dia = ultimoDiaMesAnterior - 1 + i + 1;
        const el = document.createElement('div');
        el.className = 'dia-calendario outro-mes';
        el.textContent = dia;
        corpo.appendChild(el);
    }
    
    const hoje = new Date();
    for (let dia = 1; dia <= ultimoDia; dia++) {
        const dataStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
        const temEvento = visitas.some(v => v.data === dataStr);
        const ehHoje = hoje.getDate() === dia && hoje.getMonth() === mes && hoje.getFullYear() === ano;
        
        const el = document.createElement('div');
        el.className = 'dia-calendario';
        if (ehHoje) el.classList.add('hoje');
        if (temEvento) el.classList.add('com-evento');
        el.textContent = dia;
        el.addEventListener('click', selecionarData.bind(null, dataStr, dia));
        corpo.appendChild(el);
    }
    
    const totalCelulas = primeiroDia + ultimoDia;
    const diasFaltantes = totalCelulas % 7 === 0 ? 0 : 7 - (totalCelulas % 7);
    for (let dia = 1; dia <= diasFaltantes; dia++) {
        const el = document.createElement('div');
        el.className = 'dia-calendario outro-mes';
        el.textContent = dia;
        corpo.appendChild(el);
    }
}

function selecionarData(dataStr, dia) {
    dataSelecionada = dataStr;
    const visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    const doDia = visitas.filter(v => v.data === dataStr);
    const container = document.getElementById('eventos-do-dia');
    const titulo = document.getElementById('eventos-data');
    
    if (titulo) titulo.textContent = `Visitas — ${dia}/${dataAtual.getMonth()+1}/${dataAtual.getFullYear()}`;
    
    if (!container) return;
    
    if (doDia.length === 0) {
        container.innerHTML = '<p class="vazio">Nenhuma visita agendada para esta data</p>';
    } else {
        container.innerHTML = doDia.map(v => `
            <div class="item-lista" style="margin-bottom:8px;">
                <h4>${v.fazendaNome} — ${v.hora || '--:--'}</h4>
                <p>👤 ${v.tecnico || 'Não informado'}</p>
                <span style="font-size:12px;">${v.status === 'agendada' ? '⏳ Agendada' : v.status === 'andamento' ? '🚗 Em Andamento' : '✅ Concluída'}</span>
            </div>
        `).join('');
    }
}

// ===== USUÁRIOS =====
let editandoUsuario = null;

document.addEventListener('DOMContentLoaded', function() {
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    if (btnNovoUsuario) btnNovoUsuario.addEventListener('click', () => {
        editandoUsuario = null;
        document.getElementById('titulo-form-usuario').textContent = 'Novo Usuário';
        document.getElementById('form-usuario').classList.remove('oculto');
        document.getElementById('u-nome').value = '';
        document.getElementById('u-email').value = '';
        document.getElementById('u-senha').value = '';
        document.getElementById('u-perfil').value = 'Técnico';
        document.getElementById('u-telefone').value = '';
        document.getElementById('u-status').value = 'ativo';
    });

    const btnFecharUsuario = document.getElementById('btn-fechar-usuario');
    if (btnFecharUsuario) btnFecharUsuario.addEventListener('click', () => {
        document.getElementById('form-usuario').classList.add('oculto');
    });

    const btnSalvarUsuario = document.getElementById('btn-salvar-usuario');
    if (btnSalvarUsuario) btnSalvarUsuario.addEventListener('click', salvarUsuario);

    const pesqUsuario = document.getElementById('pesq-usuario');
    if (pesqUsuario) pesqUsuario.addEventListener('input', carregarUsuarios);
});

function salvarUsuario() {
    const nome = document.getElementById('u-nome').value.trim();
    const email = document.getElementById('u-email').value.trim();
    const senha = document.getElementById('u-senha').value;
    
    if (!nome || !email) { alert('Informe o nome e o e-mail!'); return; }
    if (!editandoUsuario && senha.length < 6) { alert('A senha deve ter pelo menos 6 caracteres!'); return; }
    
    const usuarios = JSON.parse(localStorage.getItem('safratech_usuarios') || '[]');
    
    if (editandoUsuario) {
        const idx = usuarios.findIndex(u => u.id === editandoUsuario);
        usuarios[idx] = {
            ...usuarios[idx],
            nome,
            email,
            perfil: document.getElementById('u-perfil').value,
            telefone: document.getElementById('u-telefone').value,
            status: document.getElementById('u-status').value
        };
        if (senha) usuarios[idx].senha = senha;
        salvarLog('Editar Usuário', `Usuário: ${nome}`);
    } else {
        usuarios.push({
            id: Date.now(),
            nome,
            email,
            senha,
            perfil: document.getElementById('u-perfil').value,
            telefone: document.getElementById('u-telefone').value,
            status: document.getElementById('u-status').value
        });
        salvarLog('Novo Usuário', `Usuário: ${nome}`);
    }
    
    localStorage.setItem('safratech_usuarios', JSON.stringify(usuarios));
    document.getElementById('form-usuario').classList.add('oculto');
    carregarUsuarios();
}

function carregarUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem('safratech_usuarios') || '[]');
    const lista = document.getElementById('lista-usuarios');
    const listaLog = document.getElementById('lista-log');
    if (!lista) return;
    
    const termo = document.getElementById('pesq-usuario')?.value.toLowerCase() || '';
    
    const filtrados = usuarios.filter(u => 
        u.nome.toLowerCase().includes(termo) || 
        u.email.toLowerCase().includes(termo)
    );
    
    if (filtrados.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhum usuário cadastrado</p>';
    } else {
        lista.innerHTML = filtrados.map(u => `
            <div class="item-lista">
                <h4>👤 ${u.nome}</h4>
                <p>📧 ${u.email}</p>
                <p>🎓 Perfil: ${u.perfil} | Status: <span style="color:${u.status === 'ativo' ? '#84CC16' : '#F97316'}">${u.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></p>
                <div class="acoes">
                    <button onclick="editarUsuario(${u.id})">✏️ Editar</button>
                    ${u.email !== 'admin@safratech.com' ? `<button onclick="excluirUsuario(${u.id})" style="background:rgba(234,88,12,0.1);color:#FCA58B;border:none;">🗑️ Excluir</button>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    if (listaLog) {
        const logs = JSON.parse(localStorage.getItem('safratech_log') || '[]');
        if (logs.length === 0) {
            listaLog.innerHTML = '<p class="vazio">Nenhuma atividade registrada</p>';        } else {
            listaLog.innerHTML = logs.map(l => `
                <div class="item-lista" style="font-size:13px;">
                    <p><strong>${l.data}</strong></p>
                    <p>👤 ${l.usuario} → ${l.acao}</p>
                    ${l.detalhes ? `<p style="color:#94A3B8">${l.detalhes}</p>` : ''}
                </div>
            `).join('');
        }
    }
}

window.editarUsuario = function(id) {
    const usuarios = JSON.parse(localStorage.getItem('safratech_usuarios') || '[]');
    const u = usuarios.find(x => x.id === id);
    if (!u) return;
    
    editandoUsuario = id;
    document.getElementById('titulo-form-usuario').textContent = 'Editar Usuário';
    document.getElementById('u-nome').value = u.nome;
    document.getElementById('u-email').value = u.email;
    document.getElementById('u-senha').value = '';
    document.getElementById('u-perfil').value = u.perfil;
    document.getElementById('u-telefone').value = u.telefone || '';
    document.getElementById('u-status').value = u.status;
    document.getElementById('form-usuario').classList.remove('oculto');
};

window.excluirUsuario = function(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    let usuarios = JSON.parse(localStorage.getItem('safratech_usuarios') || '[]');
    const nome = usuarios.find(u => u.id === id)?.nome;
    usuarios = usuarios.filter(u => u.id !== id);
    localStorage.setItem('safratech_usuarios', JSON.stringify(usuarios));
    salvarLog('Excluir Usuário', `Usuário: ${nome}`);
    carregarUsuarios();
};

// ===== RELATÓRIOS =====
document.addEventListener('DOMContentLoaded', function() {
    const btnRelCompleto = document.getElementById('btn-relatorio-completo');
    if (btnRelCompleto) btnRelCompleto.addEventListener('click', gerarRelatorioCompleto);

    const btnRelFiltrado = document.getElementById('btn-relatorio-filtrado');
    if (btnRelFiltrado) btnRelFiltrado.addEventListener('click', gerarRelatorioFiltrado);
});

function gerarRelatorioCompleto() {
    const fazendas = JSON.parse(localStorage.getItem('safratech_fazendas') || '[]');
    const talhoes = JSON.parse(localStorage.getItem('safratech_talhoes') || '[]');
    const visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');
    const dataRel = new Date().toLocaleString('pt-BR');

    const conteudo = `
        <div style="padding:30px;max-width:800px;margin:0 auto;background:#1C1917;color:#E7E5E4;font-family:Arial;">
            <div style="text-align:center;margin-bottom:30px;border-bottom:2px solid #FBBF24;padding-bottom:20px;">
                <h1 style="color:#FBBF24;margin:0;font-size:28px;">🌾 SAFRATECH — RELATÓRIO COMPLETO</h1>
                <p style="color:#A8A29E;margin-top:8px;">Gerado em: ${dataRel}</p>
            </div>

            <h2 style="color:#FBBF24;font-size:20px;margin-top:30px;">📊 Resumo Geral</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:30px;">
                <tr><td style="padding:10px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Fazendas Cadastradas</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${fazendas.length}</td></tr>
                <tr><td style="padding:10px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Talhões Cadastrados</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${talhoes.length}</td></tr>
                <tr><td style="padding:10px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Visitas Agendadas</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${visitas.filter(v => v.status === 'agendada').length}</td></tr>
                <tr><td style="padding:10px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Visitas em Andamento</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${visitas.filter(v => v.status === 'andamento').length}</td></tr>
                <tr><td style="padding:10px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Visitas Concluídas</td><td style="padding:10px;border-bottom:1px solid #3F3F46;">${visitas.filter(v => v.status === 'concluida').length}</td></tr>
            </table>

            <h2 style="color:#FBBF24;font-size:20px;margin-top:30px;">📋 Lista de Visitas</h2>
            ${visitas.length === 0 ? '<p>Nenhuma visita registrada.</p>' : `
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <thead>
                    <tr style="background:#292524;">
                        <th style="padding:8px;text-align:left;color:#FBBF24;border-bottom:1px solid #3F3F46;">Fazenda</th>
                        <th style="padding:8px;text-align:left;color:#FBBF24;border-bottom:1px solid #3F3F46;">Data</th>
                        <th style="padding:8px;text-align:left;color:#FBBF24;border-bottom:1px solid #3F3F46;">Técnico</th>
                        <th style="padding:8px;text-align:left;color:#FBBF24;border-bottom:1px solid #3F3F46;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${visitas.map(v => `
                    <tr>
                        <td style="padding:8px;border-bottom:1px solid #3F3F46;">${v.fazendaNome}</td>
                        <td style="padding:8px;border-bottom:1px solid #3F3F46;">${v.data} ${v.hora || ''}</td>
                        <td style="padding:8px;border-bottom:1px solid #3F3F46;">${v.tecnico || '-'}</td>
                        <td style="padding:8px;border-bottom:1px solid #3F3F46;">${
                            v.status === 'agendada' ? '⏳ Agendada' :
                            v.status === 'andamento' ? '🚗 Em Andamento' : '✅ Concluída'
                        }</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            `}

            <div style="margin-top:60px;text-align:center;color:#A8A29E;font-size:12px;">
                <p>🌾 SafraTech — Sistema de Gestão de Visitas Técnicas</p>
            </div>
        </div>
    `;

    const janela = window.open('', '_blank');
    janela.document.write(conteudo);
    janela.document.close();
    salvarLog('Gerar Relatório', 'Relatório completo exportado');
}

function gerarRelatorioFiltrado() {
    const fazendaId = document.getElementById('rel-fazenda')?.value;
    const talhaoId = document.getElementById('rel-talhao')?.value;
    const dataInicio = document.getElementById('rel-data-inicio')?.value;
    const dataFim = document.getElementById('rel-data-fim')?.value;

    let visitas = JSON.parse(localStorage.getItem('safratech_visitas') || '[]');

    if (fazendaId) visitas = visitas.filter(v => v.fazendaId == fazendaId);
    if (talhaoId) visitas = visitas.filter(v => v.talhaoId == talhaoId);
    if (dataInicio) visitas = visitas.filter(v => v.data >= dataInicio);
    if (dataFim) visitas = visitas.filter(v => v.data <= dataFim);

    const dataRel = new Date().toLocaleString('pt-BR');

    const conteudo = `
        <div style="padding:30px;max-width:800px;margin:0 auto;background:#1C1917;color:#E7E5E4;font-family:Arial;">
            <div style="text-align:center;margin-bottom:30px;border-bottom:2px solid #FBBF24;padding-bottom:20px;">
                <h1 style="color:#FBBF24;margin:0;font-size:28px;">🌾 SAFRATECH — RELATÓRIO FILTRADO</h1>
                <p style="color:#A8A29E;margin-top:8px;">Gerado em: ${dataRel}</p>
            </div>

            <h2 style="color:#FBBF24;font-size:18px;margin-bottom:15px;">📋 Filtros Aplicados</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:25px;">
                <tr><td style="padding:8px;font-weight:bold;color:#FBBF24;width:40%;border-bottom:1px solid #3F3F46;">Fazenda</td><td style="padding:8px;border-bottom:1px solid #3F3F46;">${fazendaId ? document.querySelector('#rel-fazenda option:checked')?.textContent || 'Selecionada' : 'Todas'}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Talhão</td><td style="padding:8px;border-bottom:1px solid #3F3F46;">${talhaoId ? document.querySelector('#rel-talhao option:checked')?.textContent || 'Selecionado' : 'Todos'}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;color:#FBBF24;border-bottom:1px solid #3F3F46;">Período</td><td style="padding:8px;border-bottom:1px solid #3F3F46;">${dataInicio || 'Início'} até ${dataFim || 'Atual'}</td></tr>
            </table>

            <h2 style="color:#FBBF24;font-size:18px;margin-bottom:15px;">📊 ${visitas.length} Visita(s) Encontrada(s)</h2>
            ${visitas.length === 0 ? '<p>Nenhuma visita corresponde aos filtros selecionados.</p>' : `
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <thead>
                    <tr style="background:#292524;">
                        <th style="padding:8px;text-align:left;color:#FBBF24;border-bottom:1px solid #3F3F46;">Fazenda</th>
                        <th style="padding:8px;text-align:left;color:#FBBF24;border-bottom:1px solid #3F3F46;">Talhão</th>
                        <th style="padding:8px;text-align:left;color:#FBBF24;border-bottom:1px solid #3F3F46;">Data</th>
                        <th style="padding:8px;text-align:left;color:#FBBF24;border-bottom:1px solid #3F3F46;">Técnico</th>
                        <th style="padding:8px;text-align:left;color:#FBBF24;border-bottom:1px solid #3F3F46;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${visitas.map(v => `
                    <tr>
                        <td style="padding:8px;border-bottom:1px solid #3F3F46;">${v.fazendaNome}</td>
                        <td style="padding:8px;border-bottom:1px solid #3F3F46;">${v.talhaoNome || '-'}</td>
                        <td style="padding:8px;border-bottom:1px solid #3F3F46;">${v.data} ${v.hora || ''}</td>
                        <td style="padding:8px;border-bottom:1px solid #3F3F46;">${v.tecnico || '-'}</td>
                        <td style="padding:8px;border-bottom:1px solid #3F3F46;">${
                            v.status === 'agendada' ? '⏳ Agendada' :
                            v.status === 'andamento' ? '🚗 Em Andamento' : '✅ Concluída'
                        }</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            `}

            <div style="margin-top:60px;text-align:center;color:#A8A29E;font-size:12px;">
                <p>🌾 SafraTech — Sistema de Gestão de Visitas Técnicas</p>
            </div>
        </div>
    `;

    const janela = window.open('', '_blank');
    janela.document.write(conteudo);
    janela.document.close();
    salvarLog('Gerar Relatório', 'Relatório filtrado exportado');
}

console.log('✅ SafraTech carregado com sucesso!');