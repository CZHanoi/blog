import { reactive, watch } from "vue";
import {
  doc, getDoc, setDoc, onSnapshot
} from "firebase/firestore";
import { db, remoteEnabled } from "./firebase";

/* ----- 本地存储 ----- */
const LS_KEY = "nomenclature-tasks-v2";
function readLS(): Record<number, WeekTasks> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
  catch { return {}; }
}
function writeLS(data: Record<number, WeekTasks>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

/* ----- 类型 ----- */
export interface Task { txt: string; done: boolean }
export interface WeekTasks { prev: Task[]; curr: Task[]; next: Task[]; }

/* ----- 主入口 ----- */
export function loadWeek(week: number): WeekTasks {
  /* 1) 本地初始 */
  const all = readLS();
  if (!all[week]) all[week] = { prev: [], curr: [], next: [] };
  const local = reactive(all[week]);

  /* 2) 本地变化 → LS（深度） */
  watch(local, v => {
    const cache = readLS();
    cache[week] = JSON.parse(JSON.stringify(v));
    writeLS(cache);
  }, { deep:true, immediate:true });

  /* 3) Firestore 双向 */
  if (remoteEnabled && db) {
    const ref = doc(db, "weeks", `week-${week}`);
    let ready = false;

    /* 3-1 远端 → 本地 */
    onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const r = snap.data() as WeekTasks;
      local.prev.splice(0, local.prev.length, ...r.prev);
      local.curr.splice(0, local.curr.length, ...r.curr);
      local.next.splice(0, local.next.length, ...r.next);
    });

    /* 3-2 首次拉取 */
    getDoc(ref).then(snap => {
      if (snap.exists()) Object.assign(local, snap.data() as WeekTasks);
      else setDoc(ref, JSON.parse(JSON.stringify(local)));
      ready = true;
      setDoc(ref, JSON.parse(JSON.stringify(local)), { merge:true }); // 首次同步
    });

    /* 3-3 本地 → 远端（需 ready） */
    watch(local, v => {
      if (!ready) return;
      setDoc(ref, JSON.parse(JSON.stringify(v)), { merge:true });
    }, { deep:true });
  }

  return local;
}
