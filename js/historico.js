if (document.getElementById('pag-historico')) {
    const listaHistorico = document.getElementById('lista-historico');

    // Disponibilizar função global para outros arquivos
    window.registrarAlteracao = function(entidade, acao, detalhe) {
        const historico = JSON.parse(localStorage.getItem('historico') || '[]');
        historico.unshift({
            id: Date.now(),
            data: new Date().toLocaleString('pt-BR'),
            usuario: window.usuarioLogado?.nome || 'Desconhecido',
            nivel: window.usuarioLogado?.nivel || '-',
            entidade,
            acao,
            detalhe
        });
        localStorage.setItem('historico', JSON.stringify(historico));
        renderizarHistorico();
    };

    window.podeExcluir = function() {
        return window.usuarioLogado?.nivel === 'administrador';
    };

    function renderizarHistorico() {
        const historico = JSON.parse(localStorage.getItem('historico') || '[]');
        
        listaHistorico.innerHTML = historico.length === 0
            ? '<p style="text-align:center; color:var(--texto-claro); padding:2rem;">Nenhuma alteração registrada ainda</p>'
            : historico.map(h => `
                <div class="item-lista item-historico">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <strong>${h.acao} — ${h.entidade}</strong>
                            <p style="margin:4px 0;">${h.detalhe}</p>
                        </div>
                        <span class="data-historico">${h.data}</span>
                    </div>
                    <span style="font-size:0.8rem; color:var(--texto-claro);">
                        👤 ${h.usuario} · ${h.nivel}
                    </span>
                </div>
            `).join('');
    }

    renderizarHistorico();
}