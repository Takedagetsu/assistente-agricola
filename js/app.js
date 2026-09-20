document.addEventListener('DOMContentLoaded', () => {
    const botoes = document.querySelectorAll('.navegacao button[data-aba]');
    const abas = document.querySelectorAll('.aba-conteudo');

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            const nomeAba = botao.getAttribute('data-aba');
            botoes.forEach(b => b.classList.remove('aba-ativa'));
            botao.classList.add('aba-ativa');
            abas.forEach(aba => {
                aba.style.display = aba.id === `aba-${nomeAba}` ? 'block' : 'none';
            });
        });
    });

    atualizarResumo();
});

window.atualizarResumo = function() {
    const visitas = JSON.parse(localStorage.getItem('visitas') || '[]');
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');

    document.getElementById('qtd-agendadas').textContent = visitas.filter(v => v.status === 'agendada').length;
    document.getElementById('qtd-andamento').textContent = visitas.filter(v => v.status === 'andamento').length;
    document.getElementById('qtd-concluidas').textContent = visitas.filter(v => v.status === 'concluida').length;
    document.getElementById('qtd-clientes').textContent = clientes.length;
};