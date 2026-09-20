// ===== MAPA E GEOLOCALIZAÇÃO =====
let mapa;
let marcadores = [];
let minhaPosicao = null;

// Inicializar mapa ao carregar
document.addEventListener('DOMContentLoaded', () => {
    // Proteger acesso
    if (!window.FIREBASE_AUTH) {
        setTimeout(() => window.location.href = 'login.html', 500);
        return;
    }

    // Inicializar mapa — centro no Brasil
    mapa = L.map('mapa').setView([-15.77972, -47.92972], 13);

    // Camada de mapa gratuito
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);

    // Botões
    document.getElementById('btn-minha-localizacao').addEventListener('click', capturarLocalizacao);
    document.getElementById('btn-mostrar-todos').addEventListener('click', mostrarTalhoesNoMapa);
    document.getElementById('btn-limpar-mapa').addEventListener('click', limparMapa);
    document.getElementById('btn-salvar-talhao-mapa').addEventListener('click', salvarTalhaoDoMapa);

    // Clique no mapa pega coordenadas
    mapa.on('click', (e) => {
        document.getElementById('lat-mapa').value = e.latlng.lat.toFixed(6);
        document.getElementById('lng-mapa').value = e.latlng.lng.toFixed(6);
    });

    // Carregar talhões salvos
    setTimeout(mostrarTalhoesNoMapa, 500);
});

// ===== Capturar localização atual =====
function capturarLocalizacao() {
    const status = document.getElementById('status-localizacao');
    status.textContent = '📍 Obtendo localização...';

    if (!navigator.geolocation) {
        status.textContent = '❌ Navegador não suporta geolocalização';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (posicao) => {
            const lat = posicao.coords.latitude;
            const lng = posicao.coords.longitude;
            
            minhaPosicao = { lat, lng };
            
            // Centralizar mapa
            mapa.setView([lat, lng], 16);

            // Adicionar marcador
            L.marker([lat, lng], { icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [30, 49],
                iconAnchor: [15, 49]
            })})
            .addTo(mapa)
            .bindPopup(`
                <strong>📍 Sua Posição</strong><br>
                <span class="coordenadas">${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
            `);

            // Preencher automaticamente
            document.getElementById('lat-mapa').value = lat.toFixed(6);
            document.getElementById('lng-mapa').value = lng.toFixed(6);

            status.innerHTML = `✅ Localização obtida: <span class="coordenadas">${lat.toFixed(6)}, ${lng.toFixed(6)}</span>`;
        },
        (erro) => {
            status.textContent = `❌ Erro: ${erro.message}`;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// ===== Mostrar todos os talhões no mapa =====
function mostrarTalhoesNoMapa() {
    limparMapa();
    
    const talhoes = JSON.parse(localStorage.getItem('talhoes') || '[]');
    const visitas = JSON.parse(localStorage.getItem('visitas') || '[]');

    // Talhões salvos
    talhoes.forEach(t => {
        if (t.latitude && t.longitude) {
            const marcador = L.marker([t.latitude, t.longitude], { icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            })})
            .addTo(mapa)
            .bindPopup(`
                <div class="marker-localizacao">
                    <strong>🌾 ${t.nome}</strong>
                    ${t.cliente ? `<small>Cliente: ${t.cliente}</small>` : ''}
                    <span class="coordenadas">${t.latitude.toFixed(6)}, ${t.longitude.toFixed(6)}</span>
                    <button onclick="traçarRota(${t.latitude}, ${t.longitude})" 
                        style="margin-top: 0.3rem; padding: 0.3rem; cursor: pointer;">🛣️ Traçar Rota</button>
                </div>
            `);
            marcadores.push(marcador);
        }
    });

    // Visitas com localização
    visitas.forEach(v => {
        if (v.latitude && v.longitude) {
            const marcador = L.marker([v.latitude, v.longitude], { icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            })})
            .addTo(mapa)
            .bindPopup(`
                <div class="marker-localizacao">
                    <strong>📅 Visita: ${v.cliente}</strong>
                    <small>Talhão: ${v.talhao || '-'}</small>
                    <small>Data: ${v.data}</small>
                    <span class="coordenadas">${v.latitude.toFixed(6)}, ${v.longitude.toFixed(6)}</span>
                </div>
            `);
            marcadores.push(marcador);
        }
    });

    if (marcadores.length > 0) {
        // Ajustar visualização para incluir todos os pontos
        const grupo = L.featureGroup(marcadores);
        mapa.fitBounds(grupo.getBounds(), { padding: [30, 30] });
    }
}

// ===== Salvar talhão do mapa =====
function salvarTalhaoDoMapa() {
    const nome = document.getElementById('nome-talhao-mapa').value.trim();
    const lat = parseFloat(document.getElementById('lat-mapa').value);
    const lng = parseFloat(document.getElementById('lng-mapa').value);

    if (!nome || isNaN(lat) || isNaN(lng)) {
        alert('⚠️ Preencha o nome e clique no mapa para pegar as coordenadas!');
        return;
    }

    const talhoes = JSON.parse(localStorage.getItem('talhoes') || '[]');
    
    // Verificar se já existe
    const existente = talhoes.findIndex(t => t.nome === nome);
    const novoTalhao = {
        id: Date.now(),
        nome,
        latitude: lat,
        longitude: lng,
        dataCadastro: new Date().toLocaleString('pt-BR')
    };

    if (existente >= 0) {
        talhoes[existente] = { ...talhoes[existente], ...novoTalhao };
    } else {
        talhoes.push(novoTalhao);
    }

    localStorage.setItem('talhoes', JSON.stringify(talhoes));
    
    // Sincronizar com nuvem
    if (window.SINCRONIZACAO) SINCRONIZACAO.sincronizarTalhoes();

    // Limpar campos
    document.getElementById('nome-talhao-mapa').value = '';
    document.getElementById('lat-mapa').value = '';
    document.getElementById('lng-mapa').value = '';

    alert(`✅ Talhão "${nome}" salvo com sucesso!`);
    mostrarTalhoesNoMapa();
}

// ===== Traçar rota =====
window.traçarRota = function(latDest, lngDest) {
    if (!minhaPosicao) {
        alert('⚠️ Clique em "Minha Posição" primeiro para traçar a rota!');
        return;
    }
    // Abrir rota no Google Maps
    const url = `https://www.google.com/maps/dir/${minhaPosicao.lat},${minhaPosicao.lng}/${latDest},${lngDest}`;
    window.open(url, '_blank');
};

// ===== Limpar mapa =====
function limparMapa() {
    marcadores.forEach(m => mapa.removeLayer(m));
    marcadores = [];
}