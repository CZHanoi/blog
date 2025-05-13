/* 数据源：
   ─ localStorage：离线与路由跳转立即可用
   ─ Firestore    ：多端实时同步（首帧不再把空数组写上去）
*/

import { reactive, watch } from "vue";
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
  /* 1. 本地初始化 */
  const all = loadLocal();
  if (!all[week]) all[week] = { prev: [], curr: [], next: [] };

  const local = reactive(all[week]);

  /* 本地 → localStorage（深度同步） */
  watch(local, (val) => {
    const cache = loadLocal();
    cache[week] = JSON.parse(JSON.stringify(val));
    saveLocal(cache);
  }, { deep:true, immediate:true });

  /* 2. Firestore 双向（可选） */
  if (remoteEnabled && db) {
    const ref = doc(db, "weeks", `week-${week}`);
    let remoteReady = false;

    /* 2-1 远端 → 本地（实时）*/
    onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const remote = snap.data() as WeekTasks;
      local.prev.splice(0, local.prev.length, ...remote.prev);
      local.curr.splice(0, local.curr.length, ...remote.curr);
      local.next.splice(0, local.next.length, ...remote.next);
    });

    /* 2-2 首次拉取 */
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        Object.assign(local, snap.data() as WeekTasks);
      } else {
        // 远端不存在 → 上传本地初始（可能为空，也可能已有默认任务）
        setDoc(ref, JSON.parse(JSON.stringify(local)));
      }
      remoteReady = true;

      /* **关键**：拉取完成后，再把当前本地状态推到远端，
         以防用户在 remoteReady=false 期间做过编辑 */
      setDoc(ref, JSON.parse(JSON.stringify(local)), { merge:true });
    });

    /* 2-3 本地变化 → 远端 */
    watch(local, (val) => {
      if (!remoteReady) return;
      setDoc(ref, JSON.parse(JSON.stringify(val)), { merge:true });
    }, { deep:true });
  }

  return local;
}
