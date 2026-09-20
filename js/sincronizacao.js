const Sincronizacao = {
    status: { online: navigator.onLine, ultimaSync: DB.buscar('ultima_sync', 'Nunca') },

    init: function() {
        window.addEventListener('online', () => this.atualizarStatus(true));
        window.addEventListener('offline', () => this.atualizarStatus(false));
        this.exibirStatus();
    },

    atualizarStatus: function(online) {
        this.status.online = online;
        const el = document.getElementById('status-conexao');
        if (el) {
            el.textContent = online ? '✅ Online' : '⚠️ Offline';
            el.classList.toggle('offline', !online);
        }
    },

    exibirStatus: function() {
        this.atualizarStatus(navigator.onLine);
        const elSync = document.getElementById('cfg-ultima-sync');
        if (elSync) elSync.textContent = this.status.ultimaSync;
    },

    salvar: function() {
        DB.salvar('ultima_sync', new Date().toLocaleString('pt-BR'));
        this.status.ultimaSync = DB.buscar('ultima_sync');
        this.exibirStatus();
        Historico.registrar('sincronizacao', 'Sistema');
        alert('☁️ Dados sincronizados!');
    },

    backup: function() {
        const dados = {
            data: new Date().toISOString(),
            visitas: DB.buscar('visitas', []),
            clientes: DB.buscar('clientes', []),
            talhoes: DB.buscar('talhoes', []),
            logs: DB.buscar('logs', [])
        };
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_agromanejo_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Historico.registrar('backup', 'Sistema');
    }
};

Sincronizacao.init();