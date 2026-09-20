const Dashboard = {
    atualizar: function() {
        const visitas = DB.buscar('visitas', []);
        const clientes = DB.buscar('clientes', []);
        
        const agendadas = visitas.filter(v => v.status === 'agendada').length;
        const andamento = visitas.filter(v => v.status === 'andamento').length;
        const concluidas = visitas.filter(v => v.status === 'concluida').length;

        const container = document.getElementById('cards-dashboard');
        if (!container) return;

        container.innerHTML = `
            <div class="cartao">
                <div style="font-size:32px;margin-bottom:8px;">📅</div>
                <div style="font-size:28px;font-weight:700;color:var(--primaria);">${agendadas}</div>
                <div style="color:var(--texto-claro);">Visitas Agendadas</div>
            </div>
            <div class="cartao">
                <div style="font-size:32px;margin-bottom:8px;">🚜</div>
                <div style="font-size:28px;font-weight:700;color:var(--aviso);">${andamento}</div>
                <div style="color:var(--texto-claro);">Em Andamento</div>
            </div>
            <div class="cartao">
                <div style="font-size:32px;margin-bottom:8px;">✅</div>
                <div style="font-size:28px;font-weight:700;color:var(--sucesso);">${concluidas}</div>
                <div style="color:var(--texto-claro);">Concluídas</div>
            </div>
            <div class="cartao">
                <div style="font-size:32px;margin-bottom:8px;">👥</div>
                <div style="font-size:28px;font-weight:700;color:var(--primaria-clara);">${clientes.length}</div>
                <div style="color:var(--texto-claro);">Clientes Cadastrados</div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cards-dashboard')) {
        Dashboard.atualizar();
        setInterval(() => Dashboard.atualizar(), 5000);
    }
});