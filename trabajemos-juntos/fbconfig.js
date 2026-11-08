// Conexión con Firebase (provisional: proyecto del taller Devida; reemplazar por un proyecto propio del taller Feed Good) para admin.html, grupos.html y el portal (index.html).
// Estos datos son públicos por diseño; la seguridad la dan las reglas de Firestore (firestore.rules).
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCj1Ucv0OYXIML8Stljr59GGKbavU04ZHk",
  authDomain: "taller-devida-pirdais.firebaseapp.com",
  projectId: "taller-devida-pirdais",
  storageBucket: "taller-devida-pirdais.firebasestorage.app",
  messagingSenderId: "95230860642",
  appId: "1:95230860642:web:5ef5d7bca3130e4ff7e03b"
};

// Archivos de más de 15 MB que envía el facilitador: se suben a Google Drive (opcional).
// Para activarlo, complete los datos de un proyecto propio de Google Cloud.
window.DRIVE_CLIENT_ID = "";
window.DRIVE_FOLDER_ID = "";
