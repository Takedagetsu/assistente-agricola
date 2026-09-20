let talhoes = JSON.parse(localStorage.getItem('talhoes') || '[]');
const formTalhao = document.getElementById('form-talhao');
const listaTalhoes = document.getElementById('lista-talhoes');
let editandoIndice = null;

function renderizarTalhoes() {
    if (!listaTalhoes) return;
    listaTalhoes.innerHTML = '';

    if (talhoes.length === 0) {
        listaTalhoes.innerHTML = '<p style="text-align:center; color:var(--texto-claro); padding:2rem;">Nenhum talhão cadastrado.</p>';
        editandoIndice = null;
        return;
    }

    talhoes.forEach((tal, index) => {
        const card = document.createElement('div');
        card.className = 'card-visita';
        card.innerHTML = `
            <div>
                <h4 style="margin:0 0 0.4rem 0; font-size:1.1rem;">🌿 ${tal.nome || 'Sem nome'}</h4>
                <p style="margin:0.3rem 0;"><strong>Área:</strong> ${tal.area ? tal.area + ' ha' : '-'}</p>
                <p style="margin:0.3rem 0;"><strong>Cultura:</strong> ${tal.cultura || '-'}</p>
                <p style="margin:0.3rem 0;"><strong>Proprietário:</strong> ${tal.cliente || '-'}</p>
                ${tal.lat && tal.lng ? `<p style="margin:0.3rem 0; font-size:0.85rem; color:var(--texto-claro);">📍 ${tal.lat}, ${tal.lng}</p>` : ''}
            </div>
            <div style="margin-top:1rem; display:flex; gap:0.5rem;">
                <button class="btn-secundario btn-sm" onclick="editarTalhao(${index})">✏️ Editar</button>
                <button class="btn-perigo btn-sm" onclick="excluirTalhao(${index})">🗑️ Excluir</button>
            </div>
        `;
        listaTalhoes.appendChild(card);
    });
}

if (formTalhao) {
    formTalhao.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome-talhao').value.trim();
        if (!nome) {
            alert('⚠️ Preencha o nome/identificação do talhão!');
            return;
        }
        
        const dados = {
            id: Date.now(),
            nome: nome,
            area: parseFloat(document.getElementById('area-talhao').value) || null,
            cultura: document.getElementById('cultura-talhao').value.trim(),
            cliente: document.getElementById('cliente-talhao').value.trim(),
            lat: document.getElementById('lat-talhao').value.trim() || null,
            lng: document.getElementById('lng-talhao').value.trim() || null,
            criadoEm: new Date().toLocaleString('pt-BR')
        };
        
        if (editandoIndice !== null) {
            // Modo edição — atualiza existente
            dados.id = talhoes[editandoIndice].id;
            dados.criadoEm = talhoes[editandoIndice].criadoEm;
            talhoes[editandoIndice] = dados;
            editandoIndice = null;
            alert('✅ Talhão atualizado com sucesso!');
        } else {
            // Novo cadastro
            talhoes.unshift(dados);
            alert('✅ Talhão cadastrado com sucesso!');
        }
        
        localStorage.setItem('talhoes', JSON.stringify(talhoes));
        formTalhao.reset();
        renderizarTalhoes();
        
        // Atualizar lista no formulário de visitas
        if (window.atualizarTalhoesSelect) window.atualizarTalhoesSelect();
    });
}

window.excluirTalhao = function(indice) {
    if (confirm('Tem certeza que deseja excluir este talhão?')) {
        talhoes.splice(indice, 1);
        localStorage.setItem('talhoes', JSON.stringify(talhoes));
        renderizarTalhoes();
        if (window.atualizarTalhoesSelect) window.atualizarTalhoesSelect();
    }
};

window.editarTalhao = function(indice) {
    const tal = talhoes[indice];
    if (!tal) return;
    
    document.getElementById('nome-talhao').value = tal.nome || '';
    document.getElementById('area-talhao').value = tal.area || '';
    document.getElementById('cultura-talhao').value = tal.cultura || '';
    document.getElementById('cliente-talhao').value = tal.cliente || '';
    document.getElementById('lat-talhao').value = tal.lat || '';
    document.getElementById('lng-talhao').value = tal.lng || '';
    
    editandoIndice = indice;
    alert('✏️ Atualize os dados e clique em Salvar para confirmar!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.addEventListener('DOMContentLoaded', renderizarTalhoes);