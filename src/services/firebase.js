import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";9

const firebaseConfig = {
  apiKey: "AIzaSyDiSWm9r7wLMnvSbGpXXG6u5CvVclaJkKo",
  authDomain: "soft-cw2-fb.firebaseapp.com",
  projectId: "soft-cw2-fb",
  storageBucket: "soft-cw2-fb.firebasestorage.app",
  messagingSenderId: "407219946886",
  appId: "1:407219946886:web:4cd13e39ca8ffffc8e1807",
  measurementId: "G-YJPT8Y5R0M"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспортируем auth и db для использования в других файлах
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);