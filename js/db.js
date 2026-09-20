const DB = {
    salvar: function(chave, dados) {
        localStorage.setItem(chave, JSON.stringify(dados));
    },
    buscar: function(chave, padrao = null) {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : padrao;
    },
    remover: function(chave) {
        localStorage.removeItem(chave);
    },
    limparTudo: function() {
        localStorage.clear();
    }
};