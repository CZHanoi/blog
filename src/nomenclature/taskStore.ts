import { reactive, watch } from "vue";
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot
} from "firebase/firestore";
import { db, remoteEnabled } from "./firebase";

/* ---------- 本地存储 ---------- */
const LS_KEY = "nomenclature-tasks-v3";
function readLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
  catch { return {}; }
}
function writeLS(obj: any) {
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}

/* ---------- 类型 ---------- */
export interface Task { txt: string; done: boolean }
export interface WeekTasks { prev: Task[]; curr: Task[]; next: Task[]; }

/* ---------- 主接口 ---------- */
export function loadWeek(week: number): WeekTasks {
  /* ① 本地初始化 */
  const all = readLS();
  if (!all[week]) all[week] = { prev: [], curr: [], next: [] };
  const local = reactive(all[week]);

  /* ② 本地 → localStorage */
  watch(local, v => {
    const cache = readLS();
    cache[week] = JSON.parse(JSON.stringify(v));
    writeLS(cache);
  }, { deep:true, immediate:true });

  /* ③ Firestore 双向同步 */
  if (remoteEnabled && db) {
    const ref = doc(db, "weeks", `week-${week}`);
    let initialDone = false;

    /* ③-1 先拉一次远端，再决定是否覆盖 */
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        Object.assign(local, snap.data() as WeekTasks);     // 用远端覆盖本地
      } else {
        setDoc(ref, JSON.parse(JSON.stringify(local)));     // 创建文档
      }
      initialDone = true;
    });

    /* ③-2 远端实时 → 本地 */
    onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const remote = snap.data() as WeekTasks;
      if (JSON.stringify(remote) === JSON.stringify(local)) return; // identical
      local.prev.splice(0, local.prev.length, ...remote.prev);
      local.curr.splice(0, local.curr.length, ...remote.curr);
      local.next.splice(0, local.next.length, ...remote.next);
    });

    /* ③-3 本地变化 → 远端（在 initialDone 之后）*/
    watch(local, v => {
      if (!initialDone) return;
      updateDoc(ref, JSON.parse(JSON.stringify(v))).catch(() =>
        setDoc(ref, JSON.parse(JSON.stringify(v)), { merge:true })
      );
    }, { deep:true });
  }

  return local;
}
