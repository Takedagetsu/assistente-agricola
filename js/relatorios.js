const btnGerarPdf = document.getElementById('btn-gerar-pdf');
const areaRelatorio = document.getElementById('area-relatorio');

function formatarDataBr(dataStr) {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

if (btnGerarPdf) {
    btnGerarPdf.addEventListener('click', () => {
        const dataInicioEl = document.getElementById('relatorio-inicio');
        const dataFimEl = document.getElementById('relatorio-fim');
        
        const dataInicio = dataInicioEl ? dataInicioEl.value : '';
        const dataFim = dataFimEl ? dataFimEl.value : '';
        
        const visitas = JSON.parse(localStorage.getItem('visitas') || '[]');
        const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
        const talhoes = JSON.parse(localStorage.getItem('talhoes') || '[]');

        let filtradas = visitas;
        if (dataInicio && dataFim) {
            filtradas = visitas.filter(v => v.data >= dataInicio && v.data <= dataFim);
        }

        const statusTexto = { 
            agendada: 'Agendada', 
            andamento: 'Em Andamento', 
            concluida: 'Concluída' 
        };
        const tipoTexto = { 
            acompanhamento: 'Acompanhamento', 
            amostragem: 'Amostragem', 
            diagnostico: 'Diagnóstico', 
            recomendacao: 'Recomendação', 
            outro: 'Outro' 
        };

        if (filtradas.length === 0 && clientes.length === 0) {
            areaRelatorio.innerHTML = `
                <div style="background:var(--fundo-card); padding:2rem; border-radius:var(--raio); border:1px solid var(--borda); text-align:center;">
                    <h3 style="color:var(--aviso);">⚠️ Sem dados para gerar relatório</h3>
                    <p style="color:var(--texto-claro); margin-top:0.5rem;">Cadastre visitas e clientes primeiro!</p>
                </div>
            `;
            return;
        }

        areaRelatorio.innerHTML = `
            <div style="background:var(--fundo-card); padding:2rem; border-radius:var(--raio); border:1px solid var(--borda);">
                <h2 style="text-align:center; color:var(--primaria); margin-bottom:1.5rem;">📄 RELATÓRIO DE ATIVIDADES DE CAMPO</h2>
                <p style="text-align:center; color:var(--texto-claro); margin-bottom:2rem;">
                    Gerado em: ${new Date().toLocaleString('pt-BR')}<br>
                    Período: ${dataInicio ? formatarDataBr(dataInicio) : 'Todo o período'} até ${dataFim ? formatarDataBr(dataFim) : 'Atual'}
                </p>
                
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:1rem; margin-bottom:2rem;">
                    <div style="text-align:center; padding:1rem; background:rgba(99,91,255,0.1); border-radius:8px;">
                        <div style="font-size:1.8rem; font-weight:700; color:var(--primaria);">${filtradas.length}</div>
                        <div style="font-size:0.9rem; color:var(--texto-claro);">Total de Visitas</div>
                    </div>
                    <div style="text-align:center; padding:1rem; background:rgba(16,185,129,0.1); border-radius:8px;">
                        <div style="font-size:1.8rem; font-weight:700; color:var(--sucesso);">${filtradas.filter(v => v.status === 'concluida').length}</div>
                        <div style="font-size:0.9rem; color:var(--texto-claro);">Concluídas</div>
                    </div>
                    <div style="text-align:center; padding:1rem; background:rgba(245,158,11,0.1); border-radius:8px;">
                        <div style="font-size:1.8rem; font-weight:700; color:var(--aviso);">${clientes.length}</div>
                        <div style="font-size:0.9rem; color:var(--texto-claro);">Clientes</div>
                    </div>
                    <div style="text-align:center; padding:1rem; background:rgba(59,130,246,0.1); border-radius:8px;">
                        <div style="font-size:1.8rem; font-weight:700; color:#3b82f6;">${talhoes.length}</div>
                        <div style="font-size:0.9rem; color:var(--texto-claro);">Talhões</div>
                    </div>
                </div>

                <h3 style="margin:1.5rem 0 1rem 0;">📋 Lista de Visitas</h3>
                ${filtradas.length === 0 ? '<p style="color:var(--texto-claro);">Nenhuma visita no período selecionado.</p>' : `
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                            <thead>
                                <tr style="background:var(--fundo-escuro);">
                                    <th style="padding:0.75rem; text-align:left; border-bottom:2px solid var(--borda);">Data</th>
                                    <th style="padding:0.75rem; text-align:left; border-bottom:2px solid var(--borda);">Cliente</th>
                                    <th style="padding:0.75rem; text-align:left; border-bottom:2px solid var(--borda);">Talhão</th>
                                    <th style="padding:0.75rem; text-align:left; border-bottom:2px solid var(--borda);">Tipo</th>
                                    <th style="padding:0.75rem; text-align:left; border-bottom:2px solid var(--borda);">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filtradas.map(v => `
                                    <tr>
                                        <td style="padding:0.6rem; border-bottom:1px solid var(--borda);">${formatarDataBr(v.data)} ${v.hora ? `às ${v.hora}` : ''}</td>
                                        <td style="padding:0.6rem; border-bottom:1px solid var(--borda);">${v.cliente || '-'}</td>
                                        <td style="padding:0.6rem; border-bottom:1px solid var(--borda);">${v.talhao || '-'}</td>
                                        <td style="padding:0.6rem; border-bottom:1px solid var(--borda);">${tipoTexto[v.tipo] || '-'}</td>
                                        <td style="padding:0.6rem; border-bottom:1px solid var(--borda);">${statusTexto[v.status]}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}

                <div style="margin-top:2rem; text-align:center;">
                    <button onclick="window.print()" class="btn-principal">🖨️ Imprimir / Salvar PDF</button>
                </div>
            </div>
        `;
    });
}