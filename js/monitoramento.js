const Monitoramento = {
    registrarSincronizacao: function() {
        localStorage.setItem('ultima_sincronizacao', new Date().toISOString());
    },

    verificarSincronizacao: function() {
        const ultima = localStorage.getItem('ultima_sincronizacao');
        return ultima ? new Date(ultima) : null;
    },

    estatisticasUso: function() {
        const visitas = DB.buscar('visitas', []);
        const hoje = new Date();
        const estaSemana = visitas.filter(v => {
            const dataVisita = new Date(v.dataAgendamento);
            const diffDias = (hoje - dataVisita) / (1000 * 60 * 60 * 24);
            return diffDias <= 7;
        });
        return {
            total: visitas.length,
            ultimaSemana: estaSemana.length
        };
    }
};