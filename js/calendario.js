const calendarioDiv = document.getElementById('calendario-completo');
let mesAtual = new Date();

function renderizarCalendario() {
    if (!calendarioDiv) return;
    const visitas = JSON.parse(localStorage.getItem('visitas') || '[]');
    
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    
    const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diaSemanaInicio = primeiroDia.getDay();
    const totalDias = ultimoDia.getDate();

    // Filtrar visitas do mês
    const visitasMes = visitas.filter(v => {
        if (!v.data) return false;
        const d = new Date(v.data + 'T00:00:00');
        return d.getFullYear() === ano && d.getMonth() === mes;
    });

    calendarioDiv.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <button class="btn-secundario" onclick="mudarMes(-1)">◀ Mês Anterior</button>
            <h3 style="font-size:1.3rem; color:var(--primaria);">${nomesMeses[mes]} de ${ano}</h3>
            <button class="btn-secundario" onclick="mudarMes(1)">Próximo Mês ▶</button>
        </div>
        <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:0.5rem;">
            ${diasSemana.map(d => `<div style="text-align:center; font-weight:600; color:var(--texto-claro); padding:0.75rem 0; border-bottom:2px solid var(--borda);">${d}</div>`).join('')}
            ${Array(diaSemanaInicio).fill('').map(() => `<div></div>`).join('')}
            ${Array.from({length: totalDias}, (_, i) => {
                const dia = i + 1;
                const dataStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
                const eventos = visitasMes.filter(v => v.data === dataStr);
                const hoje = new Date();
                const ehHoje = hoje.getDate() === dia && hoje.getMonth() === mes && hoje.getFullYear() === ano;
                
                return `
                    <div style="
                        min-height:70px; padding:0.5rem; border:1px solid var(--borda); border-radius:8px;
                        background:${ehHoje ? 'rgba(99,91,255,0.1)' : 'var(--fundo-card)'};
                        ${ehHoje ? 'border-color:var(--primaria);' : ''}
                    ">
                        <div style="font-weight:600; margin-bottom:0.3rem;">${dia}</div>
                        ${eventos.length > 0 ? eventos.map(v => `
                            <div style="font-size:0.7rem; padding:0.15rem 0.25rem; margin:0.1rem 0;
                                background:${v.status === 'agendada' ? 'rgba(245,158,11,0.25)' : v.status === 'andamento' ? 'rgba(99,91,255,0.25)' : 'rgba(16,185,129,0.25)'};
                                border-radius:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
                                title="${v.cliente} — ${v.tipo}">
                                ${v.cliente.substring(0,10)}${v.cliente.length > 10 ? '...' : ''}
                            </div>
                        `).join('') : ''}
                    </div>
                `;
            }).join('')}
        </div>
        ${visitasMes.length === 0 ? '<p style="text-align:center; color:var(--texto-claro); margin-top:1.5rem;">Nenhuma visita agendada neste mês.</p>' : ''}
    `;
}

window.mudarMes = function(delta) {
    mesAtual.setMonth(mesAtual.getMonth() + delta);
    renderizarCalendario();
};

document.addEventListener('DOMContentLoaded', renderizarCalendario);