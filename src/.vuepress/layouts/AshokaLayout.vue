<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { withBase } from "vuepress/client";
import Navbar from "@theme-hope/modules/navbar/components/Navbar";

const SEMESTER_START_ISO = "2026-01-11";
const SEMESTER_END_ISO = "2026-02-28";
const SEM_START = new Date(SEMESTER_START_ISO + "T00:00:00");
const SEM_END = new Date(SEMESTER_END_ISO + "T00:00:00");
const MIN_WEEKS_TO_SHOW = Math.max(
  1,
  Math.ceil((SEM_END.getTime() - SEM_START.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
);

// === Slots: 14 节课的时间刻度 ===
const ROWS = 14;
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
  [ 18*60+30,19*60+15], // 11: 18:30-19:15
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

// === 数据类型（支持可选 color 列；没有也完全兼容） ===
type RowUnified = {
  course:string; weeks?:string; weekday?:string; date?:string;
  periods?:string; start_time?:string; end_time?:string;
  room?:string; teacher?:string; type?:string; content?:string;
  color?:string;
};

const weekly = ref<RowUnified[]>([]);
const events = ref<RowUnified[]>([]);

// === CSV 解析 ===
function parseCSV(txt:string){
  const lines = txt.trim().split(/\r?\n/).filter(Boolean);
  if(lines.length===0) return [];
  const head = lines.shift()!.split(",").map(s=>s.trim());
  return lines.map(line=>{
    const cells = line.split(","); // 简化：不处理引号转义
    const row:any = {};
    head.forEach((k,i)=> row[k]= (cells[i]??"").trim());
    return row;
  });
}
async function loadAll(){
  const [wTxt,eTxt] = await Promise.all([
    fetch(withBase("/ashoka-weekly.csv")).then(r=>r.text()),
    fetch(withBase("/ashoka-events.csv")).then(r=>r.text())
  ]);
  weekly.value = parseCSV(wTxt) as RowUnified[];
  events.value = parseCSV(eTxt) as RowUnified[];
}

// === 工具函数 ===
function expandWeeks(expr?:string):number[]{
  if(!expr) return [];
  return expr.split(",").flatMap(seg=>{
    seg = seg.trim();
    const m = seg.match(/^(\d+)-(\d+)$/);
    if(m){ const a=+m[1],b=+m[2]; return Array.from({length:b-a+1},(_,i)=>a+i); }
    return seg ? [+seg] : [];
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
function timeToPeriods(startHHMM?:string, endHHMM?:string){
  const sMin = toMin(startHHMM), eMin = toMin(endHHMM);
  if(sMin==null || eMin==null) return { s:0, e:0 };
  let sIdx = 1, eIdx = ROWS;
  for(let i=0;i<ROWS;i++){ const [,b]=SLOT_MM[i]; if(sMin <= b){ sIdx=i+1; break; } }
  for(let i=ROWS-1;i>=0;i--){ const [a]=SLOT_MM[i]; if(eMin >= a){ eIdx=i+1; break; } }
  if(eIdx < sIdx) eIdx = sIdx;
  return { s:sIdx, e:eIdx };
}

// === 颜色策略 ===
function hueHash(key:string){ let h=0; for(const ch of key) h=(h*33+ch.charCodeAt(0))%360; return h; }
function colorFor(key:string){ return `hsl(${hueHash(key)} 70% 60%)`; }
function grayify(c:string){ return `color-mix(in oklab, ${c} 35%, #999 65%)`; }
function looksLikeColor(x?:string){
  if(!x) return false;
  return /^#([0-9a-fA-F]{3,8})$/.test(x)
      || /^rgb(a)?\(/i.test(x)
      || /^hsl(a)?\(/i.test(x)
      || /^oklch\(/i.test(x)
      || /^var\(/i.test(x);
}
function colorFromContent(content?:string){
  if(!content) return null;
  const m = content.match(/\{color:\s*([^}]+)\}/i);
  return m ? m[1].trim() : null;
}
function stripColorTag(content?:string){
  return (content||"").replace(/\s*\{color:\s*[^}]+\}\s*/ig, "").trim();
}
function tintByType(base:string, type?:string){
  const t = (type || "").toLowerCase();
  if(t==="exam") return "#d32f2f";
  if(t==="demo" || t==="lab") return grayify(base);
  if(t==="meeting") return `color-mix(in oklab, ${base} 75%, #1e88e5 25%)`;
  if(t==="party")   return `color-mix(in oklab, ${base} 70%, #e91e63 30%)`;
  if(t==="ds")      return `color-mix(in oklab, ${base} 75%, #673ab7 25%)`;
  if(t==="play")    return `color-mix(in oklab, ${base} 75%, #2e7d32 25%)`;
  return base;
}
function resolveColor(r:RowUnified){
  // 1) color 列
  if(looksLikeColor(r.color)) return r.color!;
  // 2) content 中的颜色标记（兼容旧写法）
  const tagged = colorFromContent(r.content);
  if(looksLikeColor(tagged||"")) return tagged!;
  // 3) 默认：按课程名哈希，并按 type 微调
  const base = colorFor(r.course || r.content || r.teacher || "Ashoka");
  return tintByType(base, r.type);
}

// === 周/日集合（至少显示到18周） ===
const maxWeek = computed(()=>{
  const w1 = weekly.value.flatMap(r=>expandWeeks(r.weeks));
  const w2 = events.value.flatMap(e=> expandWeeks(e.weeks) );
  const maxW = Math.max(MIN_WEEKS_TO_SHOW, ...(w1.length? w1:[1]), ...(w2.length? w2:[1]));
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

// === 网格计算（不在文字中展示 date；并剔除 content 里的 {color:...} ） ===
type Cell = { title:string; sub?:string; s:number; e:number; color:string; isExam?:boolean };
const grid = computed<Record<string, Cell[]>>(()=> {
  const g:Record<string,Cell[]> = {};

  const subFromRow = (r:RowUnified) => {
    const cleanContent = stripColorTag(r.content);
    const parts = [
      cleanContent || null,
      r.start_time && r.end_time ? `${r.start_time}—${r.end_time}` : null,
      r.room, r.teacher
    ].filter(Boolean);
    return parts.join(" · ");
  };

  const putRow = (row:RowUnified) => {
    const p = row.periods && row.periods !== "0-0" && /^\d+(-\d+)?$/.test(row.periods)
      ? periods(row.periods)
      : timeToPeriods(row.start_time, row.end_time);
    const color = resolveColor(row);
    const sub = subFromRow(row);
    const isExam = (row.type||"").toLowerCase()==="exam";

    if(row.date){
      const key = row.date;
      (g[key] ||= []).push({ title: row.course, sub, s:p.s, e:p.e, color, isExam });
    } else if(row.weeks && row.weekday){
      const dayIndex = wdIdx(row.weekday);
      for(const w of expandWeeks(row.weeks)){
        const key = fmtDate(addDays(SEM_START, (w-1)*7 + dayIndex));
        (g[key] ||= []).push({ title: row.course, sub, s:p.s, e:p.e, color, isExam });
      }
    }
  };

  for(const r of weekly.value){ putRow(r); }
  for(const e of events.value){ putRow(e); }

  for(const k of Object.keys(g)){
    g[k].sort((a,b)=> a.s - b.s || a.e - b.e || a.title.localeCompare(b.title));
  }
  return g;
});

// === 头部/滚动 ===
const weeksHeadRef = ref<HTMLElement | null>(null);
const daysHeadRef  = ref<HTMLElement | null>(null);
const boardRef     = ref<HTMLElement | null>(null);
const canvasRef    = ref<HTMLElement | null>(null);
const timesBodyRef = ref<HTMLElement | null>(null);
const timesRef     = ref<HTMLElement | null>(null);

const headsH = ref(108); // (48 + 60)

function applyHeadsH(px:number){
  headsH.value = px;
  boardRef.value?.style.setProperty("--heads-h", `${px}px`);
}
function measureHeads(){
  const a = weeksHeadRef.value;
  const b = daysHeadRef.value;
  if(!a || !b) return;
  const ax = Math.round(a.getBoundingClientRect().height);
  const bx = Math.round(b.getBoundingClientRect().height);
  applyHeadsH(ax + bx);
}

const todayKey = ref<string>(fmtDate(new Date()));
function scrollToToday() {
  const canvas = canvasRef.value;
  if(!canvas) return;
  const target = canvas.querySelector<HTMLElement>(`.day-col[data-date="${todayKey.value}"]`);
  if(!target) return;
  const pad = parseFloat(getComputedStyle(canvas).getPropertyValue("--pad") || "8");
  const left = (target.offsetLeft || 0) - pad;
  canvas.scrollTo({ left, top: 0, behavior: "auto" });
}

let onCanvasScroll: ((ev: Event)=>void) | null = null;
function installScrollSync(){
  const canvas = canvasRef.value;
  const timesBody = timesBodyRef.value;
  if(!canvas || !timesBody) return;

  canvas.style.scrollbarGutter = "stable both-edges";

  onCanvasScroll = () => {
    const y = Math.round(canvas.scrollTop);
    timesBody.style.setProperty("--vscroll", String(y));
  };
  canvas.addEventListener("scroll", onCanvasScroll, { passive: true });

  const times = timesRef.value;
  if(times){
    times.addEventListener("wheel", (e: WheelEvent) => {
      if(!canvas) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        canvas.scrollBy({ top: e.deltaY, behavior: "auto" });
        e.preventDefault();
      }
    }, { passive: false });
  }
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

  await nextTick();
  installScrollSync();
  scrollToToday();
});
onUnmounted(()=>{
  roA?.disconnect(); roB?.disconnect();
  window.removeEventListener("resize", measureHeads);
  if(onCanvasScroll && canvasRef.value){
    canvasRef.value.removeEventListener("scroll", onCanvasScroll);
  }
});
</script>

<template>
  <div class="ashoka-layout">
    <Navbar />
    <div class="ashoka-page">
      <header class="hdr">
        <!-- <div class="title">Bodhi · 本学期课程</div>
        <div class="meta">起始周一：{{ SEMESTER_START_ISO }}</div> -->
        <div class="title">ASHOKA 阿育王时代</div>
        <div class="meta">For unto us a child is born, unto us a son is given;</div>
      </header>

      <section class="board" ref="boardRef">
        <!-- 左：时间刻度轴 -->
        <aside class="times" ref="timesRef">
          <div class="times-head">Class / Time</div>
          <div class="times-body" ref="timesBodyRef">
            <div v-for="s in SLOTS" :key="s.i" class="time-row">
              <div class="no">第{{ s.i }}节</div>
              <div class="range">{{ s.t }}</div>
            </div>
          </div>
        </aside>

        <!-- 右：主画布（唯一滚动容器） -->
        <div class="canvas" ref="canvasRef">
          <div class="weeks-head" ref="weeksHeadRef">
            <div v-for="w in maxWeek" :key="'w'+w" class="week-tag">第 {{ w }} 周</div>
          </div>

          <div class="days-head" ref="daysHeadRef">
            <div
              v-for="d in allDays"
              :key="'h'+fmtDate(d.date)"
              class="day-head"
              :class="{ today: fmtDate(d.date) === todayKey }"
            >
              <div class="dow">
                星期{{ ['一','二','三','四','五','六','日'][d.wd] }}
              </div>
              <div class="date">{{ fmtDate(d.date) }}</div>
            </div>
          </div>

          <div class="days-body">
            <div
              v-for="d in allDays"
              :key="'c'+fmtDate(d.date)"
              class="day-col"
              :class="{ today: fmtDate(d.date) === todayKey }"
              :data-date="fmtDate(d.date)"
            >
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
.ashoka-layout{min-height:100vh;display:flex;flex-direction:column}
:global(.page-cover){display:none !important;}

.ashoka-page{
  height:calc(100vh - var(--navbar-height));
  padding-top: var(--navbar-height);
  display:flex; flex-direction:column; overflow:hidden;
}
.hdr{
  flex:0 0 auto; display:flex; justify-content:space-between; align-items:flex-end;
  padding:12px 4px 8px;
}
.title{font:700 2rem "Cinzel Decorative",serif;color:#7646ff}
.meta{opacity:.8}

.board{
  --row-h: 64px; /* 原 56px，稍微加大 */
  --rows: 14;
  --col-w: 240px;
  --gap: 10px;
  --pad: 8px;
  --weeks-h: 48px;
  --dhead-h: 60px;
  --heads-h: calc(var(--weeks-h) + var(--dhead-h));
  --times-w: var(--col-w);

  flex:1 1 auto; min-height:0;
  display:grid; grid-template-columns: var(--times-w) 1fr; gap:12px;
}

.times{
  align-self:stretch; height:100%;
  background:#fff;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.1);
  display:flex; flex-direction:column;
  margin-top:0;
  overflow:hidden; /* clip translated body */
}
.times-head{
  height: var(--heads-h);
  padding:.0rem .8rem;
  background:#1976d2;color:#fff;font-weight:700;text-align:center;
  line-height:1.2; flex:0 0 auto;
  display:flex; align-items:center; justify-content:center;
}
.times-body{
  position:relative;
  flex:1 1 auto; min-height:0;
  display:grid;
  grid-template-rows: repeat(var(--rows), var(--row-h));
  padding-top: 0;

  background-image:
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent calc(var(--row-h) - 1px),
      #e5e7eb calc(var(--row-h) - 1px),
      #e5e7eb var(--row-h)
    );
  background-position: left top;
  background-origin: content-box;
  background-clip: content-box;

  /* Visual scroll driven by canvas scrollTop (integer px) */
  transform: translateY(calc(-1px * var(--vscroll, 0)));
  will-change: transform;
}
.time-row{
  display:grid; grid-template-columns:110px 1fr; align-items:center;
  height: var(--row-h);
  box-sizing: border-box;
  padding:0 .8rem;
}
.no{font-weight:700;color:#333}
.range{opacity:.9}

.canvas{
  height:100%; min-width:0; overflow:auto;
  position:relative; display:grid;
  grid-template-rows: var(--weeks-h) var(--dhead-h) 1fr;
  align-items:start;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable both-edges;
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
  overflow:hidden;
}
.day-head .dow{font-weight:800; line-height:1.1}
.day-head .date{font-size:.9rem;opacity:.85; line-height:1.1}

.day-head.today{
  outline: 2px solid #0ea5e9;
  background:#cfe9ff;
}
.day-col.today{
  background-color:#f0f7ff;
  box-shadow:0 0 0 2px #0ea5e9 inset, 0 4px 14px rgba(0,0,0,.08);
}

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
  min-width:0; overflow:hidden;

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

.cell{
  border-radius:12px;padding:.6rem .7rem;box-shadow:0 2px 8px rgba(0,0,0,.12);
  display:flex;flex-direction:column;justify-content:center;font-size:.98rem;line-height:1.28;
  min-width:0; overflow:hidden;
}
.cell.exam{ background:#d32f2f !important; color:#fff !important; }
.cell-title{
  font-weight:800;
  overflow:hidden; text-overflow:ellipsis;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
  word-break:break-word;
}
.cell-sub{
  opacity:.95;font-size:.86rem;margin-top:.2rem;
  overflow:hidden; text-overflow:ellipsis;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
  word-break:break-word;
}

@media (max-width: 1200px){
  .board{ --col-w: 200px; --times-w: var(--col-w); }
  .title{ font-size:1.8rem; }
}

@media (max-width: 900px){
  .board{ --col-w: 170px; --row-h: 60px; --times-w: var(--col-w); }
  .title{ font-size:1.6rem; }
  .time-row{ grid-template-columns: 80px 1fr; padding:0 .6rem; }
}

@media (max-width: 600px){
  .board{ --times-w: 96px; --col-w: 44vw; --row-h: 56px; --gap: 8px; }

  .times-head{ font-size:.9rem; padding:.35rem .5rem; }
  .time-row{
    grid-template-columns: 1fr;
    justify-items: start;
    padding:.2rem .5rem;
  }
  .no{ font-size:.95rem; line-height:1.1; }
  .range{ font-size:.85rem; opacity:.95; line-height:1.1; }

  .day-head{ padding:.2rem .2rem; }
  .cell{ font-size:.92rem; }
}

:global(html.dark) .times{background:#1f2937;color:#e5e7eb}
:global(html.dark) .week-tag{background:#0ea5e9}
:global(html.dark) .days-head{background:#0b1f33;border-color:#14324f}
:global(html.dark) .day-head{background:#093e66;color:#e6f3ff}
:global(html.dark) .day-head.today{background:#0a2f4e; outline-color:#38bdf8}
:global(html.dark) .day-col{background-color:#111827;box-shadow:0 4px 14px rgba(0,0,0,.35)}
:global(html.dark) .day-col.today{background-color:#0a1524; box-shadow:0 0 0 2px #38bdf8 inset, 0 4px 14px rgba(0,0,0,.5)}
:global(html.dark) .cell{box-shadow:0 2px 8px rgba(0,0,0,.5)}
</style>
