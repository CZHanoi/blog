/* 双通道数据层：
   ─ localStorage：离线 & 跨路由立即可用
   ─ Firestore    ：多端实时同步（避免首次“把空数组推上去”）
*/

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

/* ---------- 主函数 ---------- */
export function loadWeek(week: number): WeekTasks {
  /* —— 1. 本地初始化 —— */
  const all = loadLocal();
  if (!all[week]) all[week] = { prev: [], curr: [], next: [] };

  const local = reactive(all[week]);

  /* 本地 → localStorage */
  watchEffect(() => {
    const latest = loadLocal();
    latest[week] = JSON.parse(JSON.stringify(local));
    saveLocal(latest);
  });

  /* —— 2. Firestore 双向同步（含首次保护） —— */
  if (remoteEnabled && db) {
    const ref = doc(db, "weeks", `week-${week}`);

    let remoteReady = false;   // <<< 首次禁止写入

    /* 2-1 远端 → 本地 (实时) */
    onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const remote = snap.data() as WeekTasks;
      local.prev.splice(0, local.prev.length, ...remote.prev);
      local.curr.splice(0, local.curr.length, ...remote.curr);
      local.next.splice(0, local.next.length, ...remote.next);
    });

    /* 2-2 首次取远端 */
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        Object.assign(local, snap.data() as WeekTasks);  // 覆盖本地空数组
      } else {
        // 远端不存在 → 上传本地初始（空或有默认值）
        setDoc(ref, JSON.parse(JSON.stringify(local)));
      }
      remoteReady = true;       // 开启写入
    });

    /* 2-3 本地变更 → 远端（需 remoteReady） */
    watchEffect(() => {
      if (!remoteReady) return;                           // <-- 防止首帧误写
      setDoc(ref, JSON.parse(JSON.stringify(local)), { merge: true });
    });
  }

  return local;
}
