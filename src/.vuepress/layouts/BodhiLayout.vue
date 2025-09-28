<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { withBase } from "vuepress/client";
import Navbar from "@theme-hope/modules/navbar/components/Navbar";

/** === 学期起始（周一） === */
const SEMESTER_START_ISO = "2025-09-08"; // 周一
const SEM_START = new Date(SEMESTER_START_ISO + "T00:00:00");

/** === 14 节严格对齐 === */
const ROWS = 14;
// 每节起止分钟（从 00:00 的分钟数），用于时间⇄节次映射
const SLOT_MM = [
  [ 8*60,   8*60+45 ],  // 1: 08:00-08:45
  [ 8*60+55,9*60+40 ],  // 2: 08:55-09:40
  [ 9*60+55,10*60+40 ], // 3: 09:55-10:40
  [ 10*60+50,11*60+35], // 4: 10:50-11:35
  [ 11*60+45,12*60+30], // 5: 11:45-12:30
  [ 13*60+30,14*60+15], // 6: 13:30-14:15
  [ 14*60+25,15*60+10], // 7: 14:25-15:10
  [ 15*60+20,16*60+5 ], // 8: 15:20-16:05
  [ 16*60+15,17*60    ],// 9: 16:15-17:00
  [ 17*60+10,17*60+55], // 10: 17:10-17:55
  [ 18*60+30,19*60+15], // ✅ 11: 18:30-19:15（修正）
  [ 19*60+25,20*60+10], // 12: 19:25-20:10
  [ 20*60+20,21*60+5 ], // 13: 20:20-21:05
  [ 21*60+15,22*60   ], // 14: 21:15-22:00
];
const SLOTS = [
  { i:1,  t:"08:00-08:45" },
  { i:2,  t:"08:55-09:40" },
  { i:3,  t:"09:55-10:40" },
  { i:4,  t:"10:50-11:35" },
  { i:5,  t:"11:45-12:30" },
  { i:6,  t:"13:30-14:15" },
  { i:7,  t:"14:25-15:10" },
  { i:8,  t:"15:20-16:05" },
  { i:9,  t:"16:15-17:00" },
  { i:10, t:"17:10-17:55" },
  { i:11, t:"18:30-19:15" },
  { i:12, t:"19:25-20:10" },
  { i:13, t:"20:20-21:05" },
  { i:14, t:"21:15-22:00" },
];
const WD = ["一","二","三","四","五","六","日"];

/** === 数据结构（不改） === */
type WeeklyRow = {
  course:string; weeks:string; weekday:string; periods?:string;
  start_time?:string; end_time?:string;
  room:string; teacher?:string; type?:string
};
type EventRow  = {
  title:string; date:string; start_time:string; end_time:string;
  week:string; weekday:string; periods:string; place:string;
  course:string; colorKey?:string; type?:string; remark?:string; teacher?:string
};

const weekly = ref<WeeklyRow[]>([]);
const events = ref<EventRow[]>([]);

/** === CSV 载入 & 解析（不改） === */
function parseCSV(txt:string){
  const lines = txt.trim().split(/\r?\n/);
  const head = lines.shift()!.split(",");
  return lines.map(line=>{
    const cells = line.split(",").map(s=>s.trim());
    const row:any = {};
    head.forEach((k,i)=> row[k]=cells[i] ?? "");
    return row;
  });
}
async function loadAll(){
  const [wTxt,eTxt] = await Promise.all([
    fetch(withBase("/bodhi-weekly.csv")).then(r=>r.text()),
    fetch(withBase("/bodhi-events.csv")).then(r=>r.text())
  ]);
  weekly.value = parseCSV(wTxt) as WeeklyRow[];
  events.value = parseCSV(eTxt) as EventRow[];
}

/** === 工具函数（不改） === */
function expandWeeks(expr:string):number[]{
  if(!expr) return [];
  return expr.split(",").flatMap(seg=>{
    const m = seg.match(/^(\d+)-(\d+)$/);
    if(m){ const a=+m[1],b=+m[2]; return Array.from({length:b-a+1},(_,i)=>a+i); }
    return [+seg];
  });
}
function periods(expr?:string){
  let m = expr?.match?.(/^(\d+)-(\d+)$/);
  if(m) return { s:+m[1], e:+m[2] };
  m = expr?.match?.(/^(\d+)$/);
  if(m) return { s:+m[1], e:+m[1] };
  return { s:0, e:0 };
}
function wdIdx(wd:string){ return Math.max(0, WD.indexOf(wd)); }
function addDays(d:Date, n:number){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function fmtDate(d:Date){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function toMin(hhmm?:string){
  if(!hhmm) return null;
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/); if(!m) return null;
  return (+m[1])*60 + (+m[2]);
}

/** === 颜色（不改） === */
function hueHash(key:string){ let h=0; for(const ch of key) h=(h*33+ch.charCodeAt(0))%360; return h; }
function colorFor(key:string){ return `hsl(${hueHash(key)} 70% 60%)`; }
function grayify(c:string){ return `color-mix(in oklab, ${c} 35%, #999 65%)`; }

/** === 时间 → 节次（不改） === */
function timeToPeriods(startHHMM?:string, endHHMM?:string){
  const sMin = toMin(startHHMM), eMin = toMin(endHHMM);
  if(sMin==null || eMin==null) return { s:0, e:0 };
  let sIdx = 1, eIdx = ROWS;
  for(let i=0;i<ROWS;i++){ const [a,b]=SLOT_MM[i]; if(sMin <= b){ sIdx=i+1; break; } }
  for(let i=ROWS-1;i>=0;i--){ const [a,b]=SLOT_MM[i]; if(eMin >= a){ eIdx=i+1; break; } }
  if(eIdx < sIdx) eIdx = sIdx;
  return { s:sIdx, e:eIdx };
}

/** === 生成整学期日列（不改） === */
const maxWeek = computed(()=>{
  const w1 = weekly.value.flatMap(r=>expandWeeks(r.weeks));
  const w2 = events.value.flatMap(e=> e.week ? expandWeeks(e.week) : [] );
  const maxW = Math.max(1, ...(w1.length? w1:[1]), ...(w2.length? w2:[1]));
  return Math.min(30, maxW);
});
const allDays = computed(()=>{
  const arr:{week:number; wd:number; date:Date}[] = [];
  for(let w=1; w<=maxWeek.value; w++){
    for(let i=0;i<7;i++){
      const date = addDays(SEM_START, (w-1)*7 + i);
      arr.push({ week:w, wd:i, date });
    }
  }
  return arr;
});

/** === 展开 weekly + events 到具体日期（不改） === */
type Cell = { title:string; sub?:string; s:number; e:number; color:string; isExam?:boolean };
const grid = computed<Record<string, Cell[]>>(()=> {
  const g:Record<string,Cell[]> = {};

  // weekly
  for(const r of weekly.value){
    const weeks = expandWeeks(r.weeks);
    const dayIndex = wdIdx(r.weekday);
    const p = r.periods && r.periods !== "0-0"
      ? periods(r.periods)
      : timeToPeriods(r.start_time, r.end_time);
    const color = r.type==="demo" ? grayify(colorFor(r.course)) : colorFor(r.course);
    const sub = [r.room, r.teacher].filter(Boolean).join(" · ");
    for(const w of weeks){
      const date = addDays(SEM_START, (w-1)*7 + dayIndex);
      const key = fmtDate(date);
      (g[key] ||= []).push({ title: r.course, sub, s:p.s, e:p.e, color });
    }
  }

  // events
  for(const e of events.value){
    const isExam = (e.type||"") === "exam";
    const baseColor = colorFor(e.colorKey || e.course || e.title);
    const color = isExam ? "#d32f2f" : (e.type==="demo" ? grayify(baseColor) : baseColor);
    const subBase = [e.place, e.teacher].filter(Boolean).join(" · ");

    const derivePeriods = (et:EventRow) => {
      if(et.periods){ return periods(et.periods); }
      if(et.start_time && et.end_time){ return timeToPeriods(et.start_time, et.end_time); }
      return { s:7, e:8 };
    };

    if(e.week && e.weekday){
      const weeks = expandWeeks(e.week);
      const dayIndex = wdIdx(e.weekday);
      const p = derivePeriods(e);
      const sub = e.start_time ? `${e.start_time}—${e.end_time} · ${subBase}` : subBase;
      for(const w of weeks){
        const key = fmtDate(addDays(SEM_START, (w-1)*7 + dayIndex));
        (g[key] ||= []).push({ title: e.title, sub, s:p.s, e:p.e, color, isExam });
      }
    } else if(e.date){
      const key = e.date;
      const p = derivePeriods(e);
      const sub = e.start_time ? `${e.start_time}—${e.end_time} · ${subBase}` : subBase;
      (g[key] ||= []).push({ title: e.title, sub, s:p.s, e:p.e, color, isExam });
    }
  }

  for(const k of Object.keys(g)){
    g[k].sort((a,b)=> a.s - b.s || a.e - b.e || a.title.localeCompare(b.title));
  }
  return g;
});

/** === 关键：动态测量右侧两条表头高度，写入 CSS 变量 === */
const weeksHeadRef = ref<HTMLElement | null>(null);
const daysHeadRef  = ref<HTMLElement | null>(null);
const boardRef     = ref<HTMLElement | null>(null);
const headsH = ref(108); // 回退（48 + 60）

function applyHeadsH(px:number){
  headsH.value = px;
  boardRef.value?.style.setProperty("--heads-h", `${px}px`);
}
function measureHeads(){
  const a = weeksHeadRef.value;
  const b = daysHeadRef.value;
  if(!a || !b) return;
  const px = a.offsetHeight + b.offsetHeight; // 含 padding+border
  applyHeadsH(px);
}

let roA:ResizeObserver | null = null;
let roB:ResizeObserver | null = null;

onMounted(async ()=>{
  await loadAll();
  await nextTick();
  measureHeads();
  roA = new ResizeObserver(measureHeads);
  roB = new ResizeObserver(measureHeads);
  weeksHeadRef.value && roA.observe(weeksHeadRef.value);
  daysHeadRef.value  && roB.observe(daysHeadRef.value);
  window.addEventListener("resize", measureHeads);
});
onUnmounted(()=>{
  roA?.disconnect(); roB?.disconnect();
  window.removeEventListener("resize", measureHeads);
});
</script>

<template>
  <div class="bodhi-layout">
    <div class="bodhi-page">
      <header class="hdr">
        <div class="title">Bodhi · 本学期课程</div>
        <div class="meta">起始周一：{{ SEMESTER_START_ISO }}</div>
      </header>

      <section class="board" ref="boardRef">
        <!-- 左：时间轴 -->
        <aside class="times">
          <div class="times-head">小节 / 时间</div>
          <div class="times-body">
            <div class="shim" :style="{ height: headsH + 'px' }" />
            <div v-for="s in SLOTS" :key="s.i" class="time-row">
              <div class="no">第{{ s.i }}节</div>
              <div class="range">{{ s.t }}</div>
            </div>
          </div>
        </aside>

        <!-- 右：统一滚动容器 -->
        <div class="canvas">
          <div class="weeks-head" ref="weeksHeadRef">
            <div v-for="w in maxWeek" :key="'w'+w" class="week-tag">第 {{ w }} 周</div>
          </div>

          <div class="days-head" ref="daysHeadRef">
            <div v-for="d in allDays" :key="'h'+fmtDate(d.date)" class="day-head">
              <div class="dow">星期{{ ['一','二','三','四','五','六','日'][d.wd] }}</div>
              <div class="date">{{ fmtDate(d.date) }}</div>
            </div>
          </div>

          <div class="days-body">
            <div v-for="d in allDays" :key="'c'+fmtDate(d.date)" class="day-col">
              <div
                v-for="c in (grid[fmtDate(d.date)] || [])"
                :key="c.title + c.s + '-' + c.e + (c.sub||'')"
                class="cell"
                :class="{ exam: c.isExam }"
                :style="{ gridRow: `${c.s} / ${c.e + 1}`, background: c.color, color: c.isExam ? '#fff' : '#111' }"
              >
                <div class="cell-title">{{ c.title }}</div>
                <div v-if="c.sub" class="cell-sub">{{ c.sub }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* —— 整屏 —— */
.bodhi-layout{min-height:100vh;display:flex;flex-direction:column}
:global(.page-cover){display:none !important;}

.bodhi-page{
  height:100vh; display:flex; flex-direction:column; overflow:hidden;
}
.hdr{
  flex:0 0 auto; display:flex; justify-content:space-between; align-items:flex-end;
  padding:12px 4px 8px;
}
.title{font:700 2rem "Cinzel Decorative",serif;color:#7646ff}
.meta{opacity:.8}

/* 主板参数 */
.board{
  --row-h: 56px;     /* 行高 */
  --rows: 14;
  --col-w: 240px;    /* 单日列宽（桌面） */
  --gap: 10px;       /* 日列间距 */
  --pad: 8px;
  --weeks-h: 48px;   /* 周数条高度（回退） */
  --dhead-h: 60px;   /* 日期头高度（回退） */
  --heads-h: calc(var(--weeks-h) + var(--dhead-h));
  flex:1 1 auto; min-height:0;
  display:grid; grid-template-columns: 300px 1fr; gap:12px;
}

/* 左侧时间轴：横线与右侧完全一致（统一用背景渐变），起点用 --heads-h 对齐 */
.times{
  align-self:stretch; height:100%;
  background:#fff;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.1);overflow:hidden;
  display:flex; flex-direction:column;
}
.times-head{
  padding:.6rem 1rem;background:#1976d2;color:#fff;font-weight:700;text-align:center
}
.times-body{
  position:relative;
  flex:1 1 auto; min-height:0;
  display:grid;
  grid-template-rows: var(--heads-h) repeat(var(--rows), var(--row-h));

  /* 直接在容器背景画“行线”，起点 = 表头总高，避免 1px 漂移 */
  background-image:
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent calc(var(--row-h) - 1px),
      #e5e7eb calc(var(--row-h) - 1px),
      #e5e7eb var(--row-h)
    );
  background-position: left var(--heads-h);
  background-origin: content-box;
  background-clip: content-box;
}
.shim{ height: var(--heads-h); } /* 同步占位 */
.time-row{
  display:grid; grid-template-columns:110px 1fr; align-items:center;
  height: var(--row-h);
  box-sizing: border-box;
  padding:0 .8rem;
}
.no{font-weight:700;color:#333}
.range{opacity:.9}

/* 右侧统一滚动容器：触控优化 + scroll snap */
.canvas{
  height:100%; min-width:0; overflow:auto;
  position:relative; display:grid;
  grid-template-rows: var(--weeks-h) var(--dhead-h) 1fr;
  align-items:start;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.weeks-head{
  position:sticky; top:0; z-index:5; height:var(--weeks-h);
  box-sizing:border-box; padding:0 var(--pad); background:#fff; border-bottom:1px solid #e5e7eb;
  display:grid; grid-auto-flow:column;
  grid-auto-columns: calc(7 * var(--col-w) + 6 * var(--gap));
  gap: var(--gap);
}
.week-tag{
  background:#03a9f4;color:#fff;border-radius:10px;
  display:flex;align-items:center;justify-content:center;font-weight:700;
}

.days-head{
  position:sticky; top:var(--weeks-h); z-index:5; height:var(--dhead-h);
  box-sizing:border-box; padding:0 var(--pad); background:#fff; border-bottom:1px solid #e5e7eb;
  display:grid; grid-auto-flow:column; grid-auto-columns: var(--col-w);
  gap: var(--gap);
}
.day-head{
  box-sizing:border-box;
  background:#e3f2fd;border-radius:10px;
  padding:.2rem .4rem;
  text-align:center;display:flex;flex-direction:column;justify-content:center;gap:.1rem;
  height:100%;
}
.day-head .dow{font-weight:800; line-height:1.1}
.day-head .date{font-size:.9rem;opacity:.85; line-height:1.1}

/* 主体网格：列吸附 + 与左侧同样的“行线” */
.days-body{
  display:grid; grid-auto-flow:column; grid-auto-columns: var(--col-w);
  gap: var(--gap); padding:0 var(--pad) var(--pad) var(--pad);
  scroll-snap-type: x mandatory;
}
.day-col{
  display:grid; grid-template-rows: repeat(var(--rows), var(--row-h));
  position:relative;
  background-color:#fff; border-radius:12px; box-shadow:0 4px 14px rgba(0,0,0,.08);
  padding:0;
  scroll-snap-align: start;

  /* 背景横线：与左侧完全一致（第一条线就在第一节下沿） */
  background-image:
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent calc(var(--row-h) - 1px),
      #e5e7eb calc(var(--row-h) - 1px),
      #e5e7eb var(--row-h)
    );
  background-origin: content-box;
  background-clip: content-box;
}

/* 课块 */
.cell{
  border-radius:12px;padding:.5rem .6rem;box-shadow:0 2px 8px rgba(0,0,0,.12);
  display:flex;flex-direction:column;justify-content:center;font-size:.95rem;line-height:1.25;
}
.cell.exam{ background:#d32f2f !important; color:#fff !important; }
.cell-title{font-weight:800}
.cell-sub{opacity:.95;font-size:.85rem;margin-top:.2rem}

/* —— 响应式 —— */
/* ≤1200px：略缩列宽与时间轴 */
@media (max-width: 1200px){
  .board{ grid-template-columns: 220px 1fr; }
  .board{ --col-w: 200px; }
}
/* ≤900px：进一步缩小；行高略减 */
@media (max-width: 900px){
  .board{ grid-template-columns: 160px 1fr; }
  .board{ --col-w: 160px; --row-h: 52px; }
  .title{ font-size:1.6rem; }
  .time-row{ grid-template-columns: 80px 1fr; padding:0 .6rem; }
}
/* ≤600px：手机优化 —— 一列一屏，且“节次+时间”纵向排列、时间始终可见；列更窄 */
@media (max-width: 600px){
  .board{ grid-template-columns: 96px 1fr; }
  .board{ --col-w: 74vw; --row-h: 48px; --gap: 8px; }

  .times-head{ font-size:.9rem; padding:.5rem .6rem; }
  .time-row{
    grid-template-columns: 1fr;        /* 纵向堆叠 */
    justify-items: start;
    padding:.2rem .5rem;
  }
  .no{ font-size:.95rem; line-height:1.1; }
  .range{ font-size:.85rem; opacity:.95; line-height:1.1; }

  .day-head{ padding:.2rem .2rem; }
  .cell{ font-size:.9rem; }
}

/* 暗色 */
:global(html.dark) .times{background:#1f2937;color:#e5e7eb}
:global(html.dark) .week-tag{background:#0ea5e9}
:global(html.dark) .days-head{background:#0b1f33;border-color:#14324f}
:global(html.dark) .day-head{background:#093e66;color:#e6f3ff}
:global(html.dark) .day-col{background-color:#111827;box-shadow:0 4px 14px rgba(0,0,0,.35)}
:global(html.dark) .cell{box-shadow:0 2px 8px rgba(0,0,0,.5)}
</style>
