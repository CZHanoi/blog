import { reactive, watchEffect } from "vue";
import {
  doc, getDoc, setDoc, onSnapshot
} from "firebase/firestore";
import { db, remoteEnabled } from "./firebase";

/* ---------- 本地存取 ---------- */
const LOCAL_KEY = "nomenclature-tasks-v2";
type RawWeeks = Record<number, WeekTasks>;
function loadLocal(): RawWeeks {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); }
  catch { return {}; }
}
function saveLocal(obj: RawWeeks) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(obj));
}

/* ---------- 类型 ---------- */
export interface Task { txt: string; done: boolean }
export interface WeekTasks { prev: Task[]; curr: Task[]; next: Task[]; }

/* ---------- 主入口 ---------- */
export function loadWeek(week: number): WeekTasks {
  /* 1) 先用 localStorage 填充，保证离线可见 */
  const all = loadLocal();
  if (!all[week]) all[week] = { prev: [], curr: [], next: [] };
  const local = reactive(all[week]);

  /* 2) 持久化到 localStorage */
  watchEffect(() => {
    const latest = loadLocal();
    latest[week] = JSON.parse(JSON.stringify(local));
    saveLocal(latest);
  });

  /* 3) Firestore 实时同步（可选） */
  if (remoteEnabled && db) {
    const ref = doc(db, "weeks", `week-${week}`);
    let ready = false;                 // true ⇒ 已拿到远端 → 可以开始写

    /* --- 3-a 远端 → 本地（一次快照 + 实时订阅） --- */
    getDoc(ref).then(async snap => {
      if (snap.exists()) {
        Object.assign(local, snap.data() as WeekTasks);
      } else {
        // 远端还没建表：把本地数据（可能为空）推上去
        await setDoc(ref, JSON.parse(JSON.stringify(local)));
      }
      ready = true;                    // 标记已初始化
    });

    onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const remote = snap.data() as WeekTasks;
      local.prev.splice(0, local.prev.length, ...remote.prev);
      local.curr.splice(0, local.curr.length, ...remote.curr);
      local.next.splice(0, local.next.length, ...remote.next);
      ready = true;                    // 首帧可能直接来自 onSnapshot
    });

    /* --- 3-b 本地 → 远端（等 ready==true 再写） --- */
    watchEffect(() => {
      if (!ready) return;              // 防止首次空数组清空远端
      setDoc(ref, JSON.parse(JSON.stringify(local)), { merge: true })
        .catch(console.error);
    });
  }

  return local;
}