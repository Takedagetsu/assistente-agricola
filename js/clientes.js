let clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
const formCliente = document.getElementById('form-cliente');
const listaClientes = document.getElementById('lista-clientes');

function renderizarClientes() {
    if (!listaClientes) return;
    listaClientes.innerHTML = '';

    if (clientes.length === 0) {
        listaClientes.innerHTML = '<p style="text-align:center; color:var(--texto-claro); padding:2rem;">Nenhum cliente cadastrado.</p>';
        return;
    }

    clientes.forEach((cli, index) => {
        const card = document.createElement('div');
        card.className = 'card-visita';
        card.innerHTML = `
            <div>
                <h4 style="margin:0 0 0.4rem 0; font-size:1.1rem;">👤 ${cli.nome || 'Sem nome'}</h4>
                <p style="margin:0.3rem 0;"><strong>Propriedade:</strong> ${cli.propriedade || '-'}</p>
                <p style="margin:0.3rem 0;"><strong>Contato:</strong> ${cli.contato || '-'}</p>
                <p style="margin:0.3rem 0;"><strong>Endereço:</strong> ${cli.endereco || '-'}</p>
            </div>
            <div style="margin-top:1rem; display:flex; gap:0.5rem;">
                <button class="btn-secundario btn-sm" onclick="editarCliente(${index})">✏️ Editar</button>
                <button class="btn-perigo btn-sm" onclick="excluirCliente(${index})">🗑️ Excluir</button>
            </div>
        `;
        listaClientes.appendChild(card);
    });
}

if (formCliente) {
    formCliente.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome-cliente').value.trim();
        if (!nome) {
            alert('⚠️ Preencha o nome do cliente!');
            return;
        }
        
        const novo = {
            id: Date.now(),
            nome: nome,
            contato: document.getElementById('contato-cliente').value.trim(),
            endereco: document.getElementById('endereco-cliente').value.trim(),
            propriedade: document.getElementById('propriedade-cliente').value.trim(),
            criadoEm: new Date().toLocaleString('pt-BR')
        };
        
        clientes.unshift(novo);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        formCliente.reset();
        renderizarClientes();
        if (window.atualizarResumo) atualizarResumo();
        alert('✅ Cliente cadastrado com sucesso!');
    });
}

window.excluirCliente = function(indice) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        clientes.splice(indice, 1);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        renderizarClientes();
        if (window.atualizarResumo) atualizarResumo();
    }
};

window.editarCliente = function(indice) {
    const cli = clientes[indice];
    if (!cli) return;
    
    document.getElementById('nome-cliente').value = cli.nome || '';
    document.getElementById('contato-cliente').value = cli.contato || '';
    document.getElementById('endereco-cliente').value = cli.endereco || '';
    document.getElementById('propriedade-cliente').value = cli.propriedade || '';
    
    // Remove o antigo para substituir ao salvar
    clientes.splice(indice, 1);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    
    alert('✏️ Atualize os dados e clique em Salvar para confirmar!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.addEventListener('DOMContentLoaded', renderizarClientes);