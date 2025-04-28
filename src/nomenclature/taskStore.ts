export interface WeekTasks {
    prev: string[];  // 上周任务
    curr: string[];  // 本周任务
    next: string[];  // 下周任务
  }
  
  const KEY = "nomenclature-tasks";
  
  // 读取整个对象
  export function loadAll(): Record<number, WeekTasks> {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  }
  
  // 保存整个对象
  export function saveAll(obj: Record<number, WeekTasks>) {
    localStorage.setItem(KEY, JSON.stringify(obj));
  }
  
  // 读取单周
  export function loadWeek(week: number): WeekTasks {
    const all = loadAll();
    if (!all[week]) all[week] = { prev: [], curr: [], next: [] };
    return all[week];
  }
  
  // 写入单周
  export function saveWeek(week: number, data: WeekTasks) {
    const all = loadAll();
    all[week] = data;
    saveAll(all);
  }
  