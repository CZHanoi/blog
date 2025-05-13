import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/* 读取 Vite 环境变量（注：必须以 VITE_ 前缀） */
const firebaseConfig = {
  apiKey:               import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:           import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:            import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:        import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:                import.meta.env.VITE_FIREBASE_APP_ID,
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
