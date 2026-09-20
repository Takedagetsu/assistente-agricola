let visitas = JSON.parse(localStorage.getItem('visitas') || '[]');
let talhoes = JSON.parse(localStorage.getItem('talhoes') || '[]');
const formVisita = document.getElementById('form-visita');
const listaVisitas = document.getElementById('lista-visitas');
const filtroStatus = document.getElementById('filtro-status');
let mapaSeletor = null;
let marcadorSelecionado = null;

function formatarDataBr(dataStr) {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Preencher lista de talhões no select
function carregarTalhoesSelect() {
    const select = document.getElementById('talhao-visita');
    if (!select) return;
    talhoes = JSON.parse(localStorage.getItem('talhoes') || '[]');
    select.innerHTML = '<option value="">— Selecione —</option>';
    talhoes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.nome;
        opt.textContent = t.nome + (t.area ? ` (${t.area} ha)` : '');
        opt.dataset.lat = t.lat || '';
        opt.dataset.lng = t.lng || '';
        select.appendChild(opt);
    });
}

function renderizarVisitas(filtro = 'todas') {
    if (!listaVisitas) return;
    listaVisitas.innerHTML = '';

    let filtradas = filtro === 'todas' ? [...visitas] : visitas.filter(v => v.status === filtro);
    filtradas.sort((a, b) => new Date(b.data) - new Date(a.data));

    if (filtradas.length === 0) {
        listaVisitas.innerHTML = '<p style="text-align:center; color:var(--texto-claro); padding:2rem;">Nenhuma visita encontrada.</p>';
        return;
    }

    const statusTexto = { agendada: 'Agendada', andamento: 'Em Andamento', concluida: 'Concluída' };
    const tipoTexto = { acompanhamento: 'Acompanhamento', amostragem: 'Amostragem', diagnostico: 'Diagnóstico', recomendacao: 'Recomendação', outro: 'Outro' };

    filtradas.forEach(visita => {
        const card = document.createElement('div');
        card.className = `card-visita status-${visita.status}`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
                <div style="flex:1; min-width:250px;">
                    <h4 style="margin:0 0 0.4rem 0; font-size:1.1rem;">${visita.cliente || 'Não informado'}</h4>
                    <p style="margin:0.3rem 0;"><strong>Talhão:</strong> ${visita.talhao || '-'}</p>
                    <p style="margin:0.3rem 0;"><strong>Data:</strong> ${formatarDataBr(visita.data)} ${visita.hora ? `às ${visita.hora}` : ''}</p>
                    <p style="margin:0.3rem 0;"><strong>Tipo:</strong> ${tipoTexto[visita.tipo] || '-'}</p>
                    ${visita.observacoes ? `<p style="margin:0.5rem 0; font-style:italic; color:var(--texto-claro);">📝 ${visita.observacoes}</p>` : ''}
                    ${visita.latitude ? `<p style="margin:0.4rem 0; font-size:0.85rem; color:var(--texto-claro);">📍 ${visita.latitude.toFixed(6)}, ${visita.longitude.toFixed(6)} <a href="https://www.google.com/maps/search/?api=1&query=${visita.latitude},${visita.longitude}" target="_blank" style="color:var(--primaria);">Ver no Mapa</a></p>` : ''}
                </div>
                <span class="status-badge">${statusTexto[visita.status]}</span>
            </div>
            <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                ${visita.status === 'agendada' ? `<button class="btn-principal btn-sm" onclick="iniciarVisita(${visita.id})">▶️ Iniciar</button>` : ''}
                ${visita.status === 'andamento' ? `<button class="btn-principal btn-sm" onclick="concluirVisita(${visita.id})">✅ Concluir</button>` : ''}
                <button class="btn-secundario btn-sm" onclick="editarVisita(${visita.id})">✏️ Editar</button>
                <button class="btn-perigo btn-sm" onclick="excluirVisita(${visita.id})">🗑️ Excluir</button>
            </div>
        `;
        listaVisitas.appendChild(card);
    });
}

// ===== FORMULÁRIO DE VISITA =====
if (formVisita) {
    formVisita.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const talhaoSelect = document.getElementById('talhao-visita');
        const talhaoSelecionado = talhaoSelect ? talhaoSelect.value : '';
        
        // Se selecionou um talhão com coordenadas, usa ele
        let lat = parseFloat(document.getElementById('latitude').value) || null;
        let lng = parseFloat(document.getElementById('longitude').value) || null;
        
        if (talhaoSelecionado && talhaoSelect.selectedIndex > 0) {
            const opt = talhaoSelect.options[talhaoSelect.selectedIndex];
            if (opt.dataset.lat && opt.dataset.lng && !lat) {
                lat = parseFloat(opt.dataset.lat);
                lng = parseFloat(opt.dataset.lng);
            }
        }
        
        const novaVisita = {
            id: Date.now(),
            cliente: document.getElementById('cliente-visita').value.trim(),
            talhao: talhaoSelecionado,
            data: document.getElementById('data-visita').value,
            hora: document.getElementById('hora-visita').value,
            tipo: document.getElementById('tipo-visita').value,
            status: 'agendada',
            observacoes: document.getElementById('observacoes-visita').value.trim(),
            latitude: lat,
            longitude: lng,
            criadoEm: new Date().toLocaleString('pt-BR')
        };
        
        visitas.unshift(novaVisita);
        localStorage.setItem('visitas', JSON.stringify(visitas));
        
        if (window.SINCRONIZACAO) await SINCRONIZACAO.sincronizarVisitas();
        
        formVisita.reset();
        const textoLoc = document.getElementById('texto-localizacao');
        if (textoLoc) textoLoc.textContent = 'Nenhuma localização selecionada';
        
        renderizarVisitas();
        if (window.atualizarResumo) atualizarResumo();
        alert('✅ Visita agendada com sucesso!');
    });
}

window.iniciarVisita = function(id) {
    const visita = visitas.find(v => v.id === id);
    if (visita) {
        visita.status = 'andamento';
        visita.iniciadoEm = new Date().toLocaleString('pt-BR');
        localStorage.setItem('visitas', JSON.stringify(visitas));
        renderizarVisitas();
        if (window.atualizarResumo) atualizarResumo();
    }
};

window.concluirVisita = function(id) {
    const visita = visitas.find(v => v.id === id);
    if (visita) {
        visita.status = 'concluida';
        visita.concluidoEm = new Date().toLocaleString('pt-BR');
        localStorage.setItem('visitas', JSON.stringify(visitas));
        renderizarVisitas();
        if (window.atualizarResumo) atualizarResumo();
    }
};

window.excluirVisita = function(id) {
    if (confirm('Tem certeza que deseja excluir esta visita?')) {
        visitas = visitas.filter(v => v.id !== id);
        localStorage.setItem('visitas', JSON.stringify(visitas));
        renderizarVisitas();
        if (window.atualizarResumo) atualizarResumo();
    }
};

window.editarVisita = function(id) {
    const visita = visitas.find(v => v.id === id);
    if (!visita) return;
    document.getElementById('cliente-visita').value = visita.cliente || '';
    document.getElementById('talhao-visita').value = visita.talhao || '';
    document.getElementById('data-visita').value = visita.data || '';
    document.getElementById('hora-visita').value = visita.hora || '';
    document.getElementById('tipo-visita').value = visita.tipo || 'outro';
    document.getElementById('observacoes-visita').value = visita.observacoes || '';
    document.getElementById('latitude').value = visita.latitude || '';
    document.getElementById('longitude').value = visita.longitude || '';
    const textoLoc = document.getElementById('texto-localizacao');
    if (textoLoc && visita.latitude) {
        textoLoc.innerHTML = `📍 ${visita.latitude.toFixed(6)}, ${visita.longitude.toFixed(6)}`;
    }
    alert('✏️ Atualize os dados e clique em Salvar!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ===== GPS — PEGAR LOCALIZAÇÃO ATUAL =====
function configurarBotoesLocalizacao() {
    const btnLoc = document.getElementById('btn-pegar-localizacao');
    const btnMapa = document.getElementById('btn-escolher-mapa');
    const btnLimpar = document.getElementById('btn-limpar-localizacao');
    const btnConfirmar = document.getElementById('btn-confirmar-localizacao');
    const seletorMapa = document.getElementById('seletor-mapa');
    const textoLoc = document.getElementById('texto-localizacao');
    
    if (btnLoc) {
        btnLoc.addEventListener('click', () => {
            textoLoc.textContent = '📍 Obtendo localização...';
            if (!navigator.geolocation) {
                textoLoc.textContent = '❌ Geolocalização não suportada';
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    document.getElementById('latitude').value = pos.coords.latitude.toFixed(6);
                    document.getElementById('longitude').value = pos.coords.longitude.toFixed(6);
                    textoLoc.innerHTML = `✅ ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
                    if (seletorMapa) seletorMapa.style.display = 'none';
                },
                (erro) => {
                    textoLoc.textContent = `❌ ${erro.message}`;
                },
                { enableHighAccuracy: true, timeout: 15000 }
            );
        });
    }
    
    // ===== ABRIR MAPA PARA ESCOLHER LOCALIZAÇÃO =====
    if (btnMapa) {
        btnMapa.addEventListener('click', () => {
            if (seletorMapa.style.display === 'none') {
                seletorMapa.style.display = 'block';
                inicializarMapaSeletor();
            } else {
                seletorMapa.style.display = 'none';
            }
        });
    }
    
    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            document.getElementById('latitude').value = '';
            document.getElementById('longitude').value = '';
            textoLoc.textContent = 'Nenhuma localização selecionada';
            if (seletorMapa) seletorMapa.style.display = 'none';
            marcadorSelecionado = null;
        });
    }
    
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            if (marcadorSelecionado) {
                const latLng = marcadorSelecionado.getLatLng();
                document.getElementById('latitude').value = latLng.lat.toFixed(6);
                document.getElementById('longitude').value = latLng.lng.toFixed(6);
                textoLoc.innerHTML = `✅ ${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)} (selecionada no mapa)`;
                seletorMapa.style.display = 'none';
            } else {
                alert('⚠️ Clique no mapa para selecionar um ponto primeiro!');
            }
        });
    }
}

// ===== INICIALIZAR MAPA DE SELEÇÃO =====
function inicializarMapaSeletor() {
    if (mapaSeletor) return; // Já inicializado
    
    const container = document.getElementById('mapa-seletor');
    if (!container) return;
    
    // Centraliza no Brasil
    mapaSeletor = L.map('mapa-seletor').setView([-15.7801, -47.9292], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapaSeletor);
    
    // Adicionar marcadores dos talhões
    talhoes = JSON.parse(localStorage.getItem('talhoes') || '[]');
    talhoes.forEach(t => {
        if (t.lat && t.lng) {
            const marcador = L.marker([parseFloat(t.lat), parseFloat(t.lng)], {
                icon: L.divIcon({
                    html: `<div style="width:16px; height:16px; background:var(--sucesso); border-radius:50%; border:2px solid white; box-shadow:0 0 6px rgba(0,0,0,0.4);"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            }).addTo(mapaSeletor);
            marcador.bindPopup(`<strong>${t.nome}</strong>${t.area ? `<br>${t.area} ha` : ''}`);
        }
    });
    
    // Clique no mapa = novo marcador
    mapaSeletor.on('click', function(e) {
        if (marcadorSelecionado) {
            mapaSeletor.removeLayer(marcadorSelecionado);
        }
        marcadorSelecionado = L.marker(e.latlng, {
            draggable: true,
            icon: L.divIcon({
                html: `<div style="width:18px; height:18px; background:var(--primaria); border-radius:50%; border:3px solid white; box-shadow:0 0 8px rgba(99,91,255,0.5);"></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            })
        }).addTo(mapaSeletor);
    });
    
    // Lista de talhões para clique rápido
    const listaDiv = document.getElementById('lista-talhoes-mapa');
    if (listaDiv) {
        listaDiv.innerHTML = '<span style="font-size:0.8rem; color:var(--texto-claro);">Talhões cadastrados:</span>';
        talhoes.forEach(t => {
            if (t.lat && t.lng) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-secundario btn-sm';
                btn.style.fontSize = '0.8rem';
                btn.textContent = `📍 ${t.nome}`;
                btn.addEventListener('click', () => {
                    mapaSeletor.setView([parseFloat(t.lat), parseFloat(t.lng)], 15);
                    if (marcadorSelecionado) mapaSeletor.removeLayer(marcadorSelecionado);
                    marcadorSelecionado = L.marker([parseFloat(t.lat), parseFloat(t.lng)], {
                        icon: L.divIcon({
                            html: `<div style="width:18px; height:18px; background:var(--primaria); border-radius:50%; border:3px solid white;"></div>`,
                            iconSize: [18, 18],
                            iconAnchor: [9, 9]
                        })
                    }).addTo(mapaSeletor);
                });
                listaDiv.appendChild(btn);
            }
        });
    }
    
    setTimeout(() => mapaSeletor.invalidateSize(), 100);
}

// ===== FILTRO DE STATUS =====
if (filtroStatus) {
    filtroStatus.addEventListener('change', () => renderizarVisitas(filtroStatus.value));
}

// ===== INICIALIZAR TUDO =====
document.addEventListener('DOMContentLoaded', () => {
    carregarTalhoesSelect();
    configurarBotoesLocalizacao();
    renderizarVisitas();
});

// Atualizar quando talhões mudarem
window.atualizarTalhoesSelect = carregarTalhoesSelect;