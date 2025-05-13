import { reactive } from "vue";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/** 三栏结构 */
export interface WeekTasks {
  prev: { txt: string; done: boolean }[];
  curr: { txt: string; done: boolean }[];
  next: { txt: string; done: boolean }[];
}

/**
 * 读取（并实时监听）指定周。
 * 若远端不存在则自动初始化为空三栏。
 */
export function loadWeek(week: number): WeekTasks {
  const local: WeekTasks = reactive({
    prev: [],
    curr: [],
    next: [],
  });

  const ref = doc(db, "weeks", `week-${week}`);

  // 一次性取远端快照（初始化用）
  getDoc(ref).then((snap) => {
    if (snap.exists()) Object.assign(local, snap.data() as WeekTasks);
    else setDoc(ref, local); // 第一次写入
  });

  // 后续实时同步
  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const remote = snap.data() as WeekTasks;
    // 用 splice 保持响应式数组引用不变
    local.prev.splice(0, local.prev.length, ...remote.prev);
    local.curr.splice(0, local.curr.length, ...remote.curr);
    local.next.splice(0, local.next.length, ...remote.next);
  });

  return local;
}

/** 将本地修改写回远端（合并更新） */
export function saveWeek(week: number, data: WeekTasks) {
  const ref = doc(db, "weeks", `week-${week}`);
  updateDoc(ref, {
    /* Firestore 不能直接存响应式 Proxy，先转 JSON */
    prev: JSON.parse(JSON.stringify(data.prev)),
    curr: JSON.parse(JSON.stringify(data.curr)),
    next: JSON.parse(JSON.stringify(data.next)),
  }).catch(console.error);
}
