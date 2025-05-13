import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/* -------- 读取并校验环境变量 -------- */
const configKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

const firebaseConfig: Record<string,string> = {};
const missing: string[] = [];

for (const k of configKeys) {
  const v = import.meta.env[k];
  if (!v) missing.push(k);
  firebaseConfig[k.replace("VITE_", "").toLowerCase()] = v;
}

/* -------- 初始化 / 回退 -------- */
export let remoteEnabled = missing.length === 0;
let db_: ReturnType<typeof getFirestore> | null = null;

if (remoteEnabled) {
  try {
    const app = initializeApp(firebaseConfig);
    db_ = getFirestore(app);
    console.info("[nomenclature] Firebase connected");
  } catch (e) {
    console.error("[nomenclature] Firebase init failed:", e);
    remoteEnabled = false;
  }
} else {
  console.warn(`[nomenclature] Firebase disabled; missing env: ${missing.join(", ")}`);
}

export const db = db_;
