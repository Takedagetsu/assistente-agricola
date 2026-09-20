const BancoDados = {
    tabelas: {
        clientes: 'clientes',
        talhoes: 'talhoes',
        visitas: 'visitas',
        historico: 'historico',
        notificacoes: 'notificacoes'
    },

    inicializar: function() {
        Object.values(this.tabelas).forEach(tabela => {
            if (!localStorage.getItem(tabela)) {
                DB.salvar(tabela, []);
            }
        });
        console.log('✅ Banco de Dados inicializado — AgroManejo v5');
    },

    limparTudo: function() {
        if (confirm('Tem certeza? Isso apagará TODOS os dados!')) {
            Object.values(this.tabelas).forEach(tabela => {
                DB.remover(tabela);
            });
            this.inicializar();
            alert('Dados limpos!');
            window.location.reload();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => BancoDados.inicializar());