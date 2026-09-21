// ============================================
// 🔥 FIREBASE — Configuração (Versão Moderna)
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAOZSFIQquhdQi1Lk8Gq1dUjzd6pxn0wSE",
  authDomain: "agromanejo-22dff.firebaseapp.com",
  projectId: "agromanejo-22dff",
  storageBucket: "agromanejo-22dff.firebasestorage.app",
  messagingSenderId: "31965036380",
  appId: "1:31965036380:web:16582b60640fad20ad8b99",
  measurementId: "G-VM9FENPQN3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar para usar nos outros arquivos
export { app, db, auth };

console.log('✅ Firebase conectado com sucesso!');