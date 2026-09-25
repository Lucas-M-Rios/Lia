import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBnruF7EZDNKtmRpGpUPbmSuHo76RhdLdI",
    authDomain: "lia-26.firebaseapp.com",
    projectId: "lia-26",
    storageBucket: "lia-26.firebasestorage.app",
    messagingSenderId: "823400940815",
    appId: "1:823400940815:web:48bc0bf9133355a1a26a7a",
    measurementId: "G-5B145VZ3LN"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };