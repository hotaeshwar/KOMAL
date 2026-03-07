// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXvcaOSu6Efp2mVhW3gxCy7rqVpq2cPmE",
  authDomain: "komaldhavan-2112c.firebaseapp.com",
  projectId: "komaldhavan-2112c",
  storageBucket: "komaldhavan-2112c.firebasestorage.app",
  messagingSenderId: "575449039077",
  appId: "1:575449039077:web:2fc86213da20cf72c7540c"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
export const db = getFirestore(app);