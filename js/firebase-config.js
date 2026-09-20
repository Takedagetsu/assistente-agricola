// ===== FIREBASE — CONFIGURAÇÃO =====
const firebaseConfig = {
  apiKey: "AIzaSyAOZSFIQquhdQi1Lk8Gq1dUjzd6pxn0wSE",
  authDomain: "agromanejo-22dff.firebaseapp.com",
  projectId: "agromanejo-22dff",
  storageBucket: "agromanejo-22dff.firebasestorage.app",
  messagingSenderId: "31965036380",
  appId: "1:31965036380:web:16582b60640fad20ad8b99"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

window.db = db;
window.auth = auth;

// ===== AUTENTICAÇÃO =====
window.FIREBASE_AUTH = {
  async login(email, senha) {
    try {
      console.log('🔐 Tentando login:', email);
      const cred = await auth.signInWithEmailAndPassword(email, senha);
      
      const dadosSessao = {
        uid: cred.user.uid,
        email: cred.user.email,
        nome: cred.user.email.split('@')[0],
        nivel: 'administrador'
      };
      
      localStorage.setItem('sessao', JSON.stringify(dadosSessao));
      window.usuarioLogado = dadosSessao;
      console.log('✅ Login realizado com sucesso!');
      return { ok: true };
    } catch (erro) {
      console.log('❌ Erro no login:', erro.code);
      return { ok: false, mensagem: this.traduzir(erro.code) };
    }
  },

  traduzir(codigo) {
    const erros = {
      'auth/invalid-email': 'E-mail inválido — verifique o formato',
      'auth/user-not-found': 'Usuário não encontrado — crie no Firebase primeiro',
      'auth/wrong-password': 'Senha incorreta',
      'auth/network-request-failed': 'Sem conexão com a internet',
      'auth/internal-error': 'Erro interno — recarregue a página'
    };
    return erros[codigo] || `Erro: ${codigo}`;
  },

  verificarSessao(callback) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const salvo = localStorage.getItem('sessao');
        if (salvo) {
          window.usuarioLogado = JSON.parse(salvo);
        } else {
          window.usuarioLogado = {
            uid: user.uid,
            email: user.email,
            nome: user.email?.split('@')[0] || 'Usuário',
            nivel: 'administrador'
          };
          localStorage.setItem('sessao', JSON.stringify(window.usuarioLogado));
        }
        callback(true);
      } else {
        const salvo = localStorage.getItem('sessao');
        if (salvo) {
          window.usuarioLogado = JSON.parse(salvo);
          callback(true);
        } else {
          localStorage.removeItem('sessao');
          window.usuarioLogado = null;
          callback(false);
        }
      }
    });
  },

  sair() {
    auth.signOut().then(() => {
      localStorage.removeItem('sessao');
      window.usuarioLogado = null;
      window.location.href = 'login.html';
    });
  }
};

// ===== SINCRONIZAÇÃO =====
window.SINCRONIZACAO = {
  salvarLocal(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
  },
  carregarLocal(chave, padrao = []) {
    const d = localStorage.getItem(chave);
    return d ? JSON.parse(d) : padrao;
  },
  estaConectado() {
    return navigator.onLine;
  },

  async sincronizarVisitas() {
    if (!this.estaConectado()) return;
    try {
      const locais = this.carregarLocal('visitas', []);
      for (const v of locais) {
        await db.collection('visitas').doc(String(v.id)).set(v);
      }
    } catch (e) {
      console.warn('Sincronização falhou:', e);
    }
  },

  async tudo() {
    await this.sincronizarVisitas();
    if (window.atualizarResumo) window.atualizarResumo();
  }
};

console.log('✅ Firebase carregado e pronto!');

// ===== FUNÇÃO DE CRIAÇÃO DE USUÁRIOS =====
window.criarUsuarioFirebase = async function(email, senha, dados) {
    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, senha);
        await db.collection('usuarios').doc(userCred.user.uid).set(dados);
        return { sucesso: true, uid: userCred.user.uid };
    } catch (erro) {
        return { sucesso: false, mensagem: erro.message };
    }
};