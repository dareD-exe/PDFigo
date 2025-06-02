// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQZiYxQh72a3zn60u44Ehyx1MsRWFve_g",
  authDomain: "pdfigo.firebaseapp.com",
  projectId: "pdfigo",
  storageBucket: "pdfigo.appspot.com", // Corrected from pdfigo.firebasestorage.app
  messagingSenderId: "327603403099",
  appId: "1:327603403099:web:d3b09c6ad54d9eefbcc27e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };