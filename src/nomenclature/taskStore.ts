/* 零依赖双通道：
     · localStorage：离线 / 首屏即见
     · Firestore   ：多端实时同步
   —— 2025-05-13 修复：
        ① 首帧先拉远端，再开启上行写；不再把空数组覆盖远端
        ② onSnapshot → 本地时打 “applyingRemote” 锁，避免回环写
*/

import { reactive, watchEffect } from "vue";
import {
  doc, getDoc, setDoc, onSnapshot
} from "firebase/firestore";
import { db, remoteEnabled } from "./firebase";

/* ---------- LocalStorage ---------- */
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
  /* 1) 先从 localStorage 取，没有就建空壳 */
  const all = loadLocal();
  if (!all[week]) all[week] = { prev: [], curr: [], next: [] };

  /** 响应式本地对象，供组件使用 */
  const local = reactive(all[week]);

  /* 2) 任意源 → localStorage (离线保障) */
  watchEffect(() => {
    const latest = loadLocal();
    latest[week] = JSON.parse(JSON.stringify(local));
    saveLocal(latest);
  });

  /* 3) Firestore 双向同步（可关闭） */
  if (remoteEnabled && db) {
    const ref = doc(db, "weeks", `week-${week}`);

    /** 首帧远端已加载? */
    let remoteReady   = false;
    /** 正在应用远端数据? （用于阻断 watch 循环） */
    let applyingRemote = false;

    /* ---- 3-A 拉取远端一次 ---- */
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        applyingRemote = true;
        Object.assign(local, snap.data() as WeekTasks);
        applyingRemote = false;
      } else {
        // 首次写入 (远端不存在，推送本地内容)
        setDoc(ref, JSON.parse(JSON.stringify(local)));
      }
      remoteReady = true;          // 标记可上行
    });

    /* ---- 3-B 订阅远端 push → 本地 ---- */
    onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const remote = snap.data() as WeekTasks;
      applyingRemote = true;
      local.prev.splice(0, local.prev.length, ...remote.prev);
      local.curr.splice(0, local.curr.length, ...remote.curr);
      local.next.splice(0, local.next.length, ...remote.next);
      applyingRemote = false;
      remoteReady = true;          // 如果首帧由此触发，同样放行
    });

    /* ---- 3-C 本地改动 → 远端（需首帧就绪且非远端驱动） ---- */
    watchEffect(() => {
      if (!remoteReady || applyingRemote) return;  // 条件未满足 → 跳过
      setDoc(ref, JSON.parse(JSON.stringify(local)), { merge: true });
    });
  }

  return local;
}
