// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNKn3Vv6a8t1ED_suSFlkjs9t5CKFEczs",
  authDomain: "blogczh.firebaseapp.com",
  projectId: "blogczh",
  storageBucket: "blogczh.firebasestorage.app",
  messagingSenderId: "138673168059",
  appId: "1:138673168059:web:2b8d484a7f43842524139e",
  measurementId: "G-64EW6CCBF6"
};

export let remoteEnabled = true;
let db_: ReturnType<typeof getFirestore> | null = null;

try {
  const app = initializeApp(firebaseConfig);
  db_ = getFirestore(app);
} catch (e) {
  console.warn("[nomenclature] Firebase init failed, fallback to local only.", e);
  remoteEnabled = false;
}

export const db = db_;