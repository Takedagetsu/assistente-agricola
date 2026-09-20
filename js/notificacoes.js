const Notificacoes = {
    lista: [],
    
    adicionar: function(mensagem, tipo = 'info') {
        this.lista.unshift({
            id: Date.now(),
            mensagem,
            tipo,
            data: new Date().toLocaleString('pt-BR')
        });
    },

    limpar: function() {
        this.lista = [];
    }
};