/* 双通道数据层：
     ─ localStorage：离线 & 跨路由立即可用
     ─ Firestore    ：多端实时同步（可断网后自动追赶）
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
  const all = loadLocal();
  if (!all[week]) all[week] = { prev: [], curr: [], next: [] };

  // 用 reactive 包装，让组件直接使用
  const local = reactive(all[week]);

  /* —— 保存到 localStorage —— */
  watchEffect(() => {
    const latest = loadLocal();
    latest[week] = JSON.parse(JSON.stringify(local));
    saveLocal(latest);
  });

  /* —— 远端 Firestore（可选） —— */
  if (remoteEnabled && db) {
    const ref = doc(db, "weeks", `week-${week}`);

    // 1) 首次同步：若远端不存在则上传本地；存在则覆盖本地
    getDoc(ref).then(snap => {
      if (snap.exists()) Object.assign(local, snap.data() as WeekTasks);
      else setDoc(ref, local);                     // merge = false 首次写入
    });

    // 2) 实时订阅远端 → 本地
    onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const remote = snap.data() as WeekTasks;
      local.prev.splice(0, local.prev.length, ...remote.prev);
      local.curr.splice(0, local.curr.length, ...remote.curr);
      local.next.splice(0, local.next.length, ...remote.next);
    });

    // 3) 本地变化 → 远端
    watchEffect(() => {
      setDoc(ref, JSON.parse(JSON.stringify(local)), { merge: true });
    });
  }

  return local;
}
