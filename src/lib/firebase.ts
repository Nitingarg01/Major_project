// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAGmKYSGDBVUhwcveP3zPbtMcRIf5as404",
  authDomain: "resume-checker-aa59d.firebaseapp.com",
  projectId: "resume-checker-aa59d",
  storageBucket: "resume-checker-aa59d.firebasestorage.app",
  messagingSenderId: "79378264709",
  appId: "1:79378264709:web:816406d8e31677c8d96fec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app)

export { storage };