
// =================================================================
// ARCHIVO DE CREDENCIALES DE FIREBASE
// =================================================================
// Por favor, rellena el siguiente objeto con tus propias credenciales.
// Una vez que guardes este archivo, la aplicación se conectará
// a tu proyecto de Firebase.
// =================================================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
    apiKey: "AIzaSyAG3Il7YKZXNicnuN39K1LeQIjL0kFYIaI",
    authDomain: "appasistenciasdeestudiantes.firebaseapp.com",
    projectId: "appasistenciasdeestudiantes",
    storageBucket: "appasistenciasdeestudiantes.firebasestorage.app",
    messagingSenderId: "175211025016",
    appId: "1:175211025016:web:35426c5f5a6112a65d938d",
    measurementId: "G-SP26NRFMCR"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
