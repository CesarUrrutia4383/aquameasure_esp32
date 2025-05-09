const firebase = require('firebase');  // No usar admin, usar firebase
require('firebase/firestore'); // Para usar Firestore

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,  // Puedes usar las variables de entorno
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicializa Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Usa la app ya inicializada si existe
}

const db = firebase.firestore();

module.exports = db;
