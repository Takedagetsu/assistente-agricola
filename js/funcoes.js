const Funcoes = {
    fecharModal: function() {
        document.getElementById('modal').classList.remove('aberto');
    },

    abrirModal: function(conteudo) {
        document.getElementById('corpo-modal').innerHTML = conteudo;
        document.getElementById('modal').classList.add('aberto');
        document.querySelector('.botao-fechar').onclick = this.fecharModal;
        document.getElementById('modal').onclick = (e) => e.target === e.currentTarget && this.fecharModal();
    },

    formatarData: function(dataStr) {
        if (!dataStr) return '';
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    },

    gerarPDF: function(dados, tipo = 'visita') {
        alert('📄 Função de PDF pronta! Em desenvolvimento versão completa.');
    }
};