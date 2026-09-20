const Auth = {
    verificar: function() {
        if (!DB.buscar('usuario_atual')) {
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
            return false;
        }
        return true;
    }
};

// Só executa na página de login
if (document.getElementById('form-login')) {
    document.getElementById('form-login').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;

        const usuario = Usuarios.autenticar(email, senha);
        if (usuario) {
            Historico.registrar('login', 'Sistema', { usuario: usuario.nome });
            window.location.href = 'principal.html';
        } else {
            alert('❌ E-mail ou senha incorretos!');
        }
    });
}