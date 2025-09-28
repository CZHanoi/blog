<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { withBase } from "vuepress/client";

/** === 学期起始（周一）——按需改成你的真实起始周一 === */
const SEMESTER_START_ISO = "2025-09-08"; // 周一
const SEM_START = new Date(SEMESTER_START_ISO + "T00:00:00");

/** === 14 节严格对齐（不把“中午”算作行）=== */
const ROWS = 14;
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

/** === 数据结构 === */
type WeeklyRow = { course:string; weeks:string; weekday:string; periods:string; room:string; type?:string };
type EventRow  = { title:string; date:string; start_time:string; end_time:string; week:string; weekday:string; periods:string; place:string; course:string; colorKey?:string; type?:string; remark?:string };

const weekly = ref<WeeklyRow[]>([]);
const events = ref<EventRow[]>([]);

/** === CSV 载入 & 解析 === */
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
onMounted(loadAll);

/** === 工具 === */
function expandWeeks(expr:string):number[]{
  if(!expr) return [];
  return expr.split(",").flatMap(seg=>{
    const m = seg.match(/^(\d+)-(\d+)$/);
    if(m){ const a=+m[1],b=+m[2]; return Array.from({length:b-a+1},(_,i)=>a+i); }
    return [+seg];
  });
}
function periods(expr:string){
  let m = expr.match(/^(\d+)-(\d+)$/);
  if(m) return { s:+m[1], e:+m[2] };
  m = expr.match(/^(\d+)$/);
  if(m) return { s:+m[1], e:+m[1] };
  return { s:0, e:0 };
}
function wdIdx(wd:string){ return Math.max(0, WD.indexOf(wd)); }
function addDays(d:Date, n:number){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function fmtDate(d:Date){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

/** === 颜色（同课同色；示教灰浅化；考试红）=== */
function hueHash(key:string){ let h=0; for(const ch of key) h=(h*33+ch.charCodeAt(0))%360; return h; }
function colorFor(key:string){ return `hsl(${hueHash(key)} 70% 60%)`; }
function grayify(c:string){ return `color-mix(in oklab, ${c} 35%, #999 65%)`; }

/** === 生成整学期“日列”清单（从 week=1 到最大周）=== */
const maxWeek = computed(()=>{
  const w1 = weekly.value.flatMap(r=>expandWeeks(r.weeks));
  const w2 = events.value.flatMap(e=> e.week ? expandWeeks(e.week) : [] );
  const maxW = Math.max(1, ...(w1.length? w1:[1]), ...(w2.length? w2:[1]));
  return Math.min(30, maxW);
});
const allDays = computed(()=>{  // [{week, wd, date}]
  const arr:{week:number; wd:number; date:Date}[] = [];
  for(let w=1; w<=maxWeek.value; w++){
    for(let i=0;i<7;i++){
      const date = addDays(SEM_START, (w-1)*7 + i);
      arr.push({ week:w, wd:i, date });
    }
  }
  return arr;
});

/** === 把 weekly + events 展开到具体“日期列”的课块 === */
type Cell = { title:string; sub?:string; s:number; e:number; color:string; isExam?:boolean };
const grid = computed<Record<string, Cell[]>>(()=> {
  const g:Record<string,Cell[]> = {};

  // weekly -> 具体日期
  for(const r of weekly.value){
    const weeks = expandWeeks(r.weeks);
    const p = periods(r.periods);
    const dayIndex = wdIdx(r.weekday);
    const color = r.type==="demo" ? grayify(colorFor(r.course)) : colorFor(r.course);
    for(const w of weeks){
      const date = addDays(SEM_START, (w-1)*7 + dayIndex);
      const key = fmtDate(date);
      (g[key] ||= []).push({
        title: r.course,
        sub: r.room || "",
        s: p.s, e: p.e, color
      });
    }
  }

  // events
  for(const e of events.value){
    const isExam = (e.type||"") === "exam";
    const baseColor = colorFor(e.colorKey || e.course || e.title);
    const color = isExam ? "#d32f2f" : (e.type==="demo" ? grayify(baseColor) : baseColor);

    if(e.week && e.weekday && e.periods){
      const weeks = expandWeeks(e.week);
      const p = periods(e.periods);
      const dayIndex = wdIdx(e.weekday);
      for(const w of weeks){
        const key = fmtDate(addDays(SEM_START, (w-1)*7 + dayIndex));
        (g[key] ||= []).push({
          title: e.title,
          sub: e.start_time ? `${e.start_time}${e.end_time?("—"+e.end_time):""} · ${e.place||""}` : (e.place||""),
          s: p.s, e: p.e, color, isExam
        });
      }
    }else if(e.date){
      const key = e.date;
      const p = e.periods ? periods(e.periods) : {s:7,e:9};
      (g[key] ||= []).push({
        title: e.title,
        sub: e.start_time ? `${e.start_time}${e.end_time?("—"+e.end_time):""} · ${e.place||""}` : (e.place||""),
        s: p.s, e: p.e, color, isExam
      });
    }
  }

  for(const k of Object.keys(g)){
    g[k].sort((a,b)=> a.s - b.s || a.e - b.e);
  }
  return g;
});
</script>

<template>
  <div class="bodhi-page">
    <!-- 顶部：标题 -->
    <header class="hdr">
      <div class="title">Bodhi · 本学期课程</div>
      <div class="meta">起始周一：{{ SEMESTER_START_ISO }}</div>
    </header>

    <section class="board">
      <!-- 左：时间轴（与右侧网格严格 1:1 行高） -->
      <aside class="times">
        <div class="times-head">小节 / 时间</div>
        <div class="times-body">
          <div v-for="s in SLOTS" :key="s.i" class="time-row">
            <div class="no">第{{ s.i }}节</div>
            <div class="range">{{ s.t }}</div>
          </div>
        </div>
      </aside>

      <!-- 右：统一滚动容器（横向+纵向）；头部与网格一起动 -->
      <div class="canvas">
        <div class="weeks-head">
          <div v-for="w in maxWeek" :key="'w'+w" class="week-tag">第 {{ w }} 周</div>
        </div>

        <div class="days-head">
          <div v-for="d in allDays" :key="'h'+fmtDate(d.date)" class="day-head">
            <div class="dow">星期{{ WD[d.wd] }}</div>
            <div class="date">{{ fmtDate(d.date) }}</div>
          </div>
        </div>

        <div class="days-body">
          <div v-for="d in allDays" :key="'c'+fmtDate(d.date)" class="day-col">
            <!-- 背景横线（14 行） -->
            <div v-for="i in ROWS" :key="'r'+i" class="rowline" :class="{ noon: i===5 }"></div>
            <!-- 课块 -->
            <div
              v-for="c in (grid[fmtDate(d.date)] || [])"
              :key="c.title + c.s + c.e"
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
</template>

<style scoped>
/* —— 全屏占满：除了顶部标题，剩余空间全部给课表 —— */
.bodhi-page{
  height:100vh; display:flex; flex-direction:column; overflow:hidden;
}
.hdr{
  flex:0 0 auto; display:flex; justify-content:space-between; align-items:flex-end;
  padding:12px 4px 8px;
}
.title{font:700 2rem "Cinzel Decorative",serif;color:#7646ff}
.meta{opacity:.8}

/* 主板：左列时间轴 + 右侧画布；让它填满余下高度 */
.board{
  --row-h: 56px;  /* 行高：左/右统一使用 */
  --rows: 14;
  --col-w: 240px; /* 单日日列宽度（可调大些） */
  flex:1 1 auto; min-height:0;
  display:grid; grid-template-columns: 280px 1fr; gap:12px;
}

/* 左侧时间轴（与右侧网格严格对齐） */
.times{
  position:sticky; top:0;
  align-self:stretch; height:100%;
  background:#fff;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.1);overflow:hidden;
  display:flex; flex-direction:column;
}
.times-head{padding:.6rem 1rem;background:#1976d2;color:#fff;font-weight:700;text-align:center}
.times-body{flex:1 1 auto; min-height:0; display:grid; grid-template-rows: repeat(var(--rows), var(--row-h));}
.time-row{
  display:grid; grid-template-columns:100px 1fr; align-items:center; padding:0 .8rem; border-bottom:1px dashed #e5e7eb;
}
.time-row:last-child{border-bottom:none}
.no{font-weight:700;color:#333}
.range{opacity:.85}

/* 右侧统一滚动容器：水平 + 垂直都在这里滚，头部一起动 */
.canvas{
  height:100%; min-width:0;
  background:transparent; border-radius:12px;
  overflow:auto; /* 统一滚动入口 */
  position:relative;
  display:grid;
  grid-template-rows: auto auto 1fr; /* 周数条、列头、主体 */
  align-items:start;
}

/* 顶部两个条都 sticky，且与内容在同一滚动容器，保持同步 */
.weeks-head{
  position:sticky; top:0; z-index:5;
  display:grid; grid-auto-flow:column; grid-auto-columns: calc(7 * var(--col-w));
  gap:10px; padding:6px 6px 0 6px; background:linear-gradient(#fff 80%, rgba(255,255,255,0));
}
.week-tag{
  background:#03a9f4;color:#fff;border-radius:10px;padding:.45rem .8rem;font-weight:700;text-align:center;
}

.days-head{
  position:sticky; top:46px; /* 紧贴在周数条下面（周数条大约 46px 高） */
  z-index:5;
  display:grid; grid-auto-flow:column; grid-auto-columns: var(--col-w);
  gap:10px; padding:6px; background:#fff; border-bottom:1px solid #e5e7eb;
}
.day-head{
  background:#e3f2fd;border-radius:10px;padding:.35rem .5rem;text-align:center;display:flex;flex-direction:column;gap:.1rem
}
.day-head .dow{font-weight:800}
.day-head .date{font-size:.9rem;opacity:.85}

/* 主体网格：每个日列 14 行，课块用 grid-row 定位 */
.days-body{
  display:grid; grid-auto-flow:column; grid-auto-columns: var(--col-w);
  gap:10px; padding:6px;
}
.day-col{
  display:grid;
  grid-template-rows: repeat(var(--rows), var(--row-h));
  position:relative;
  background:#fff;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.08);
  padding:6px;
}
.rowline{ border-bottom:1px dashed #eee; height:var(--row-h); }
.rowline.noon{ border-bottom:2px solid #ddd; }

/* 课块 */
.cell{
  border-radius:12px;padding:.5rem .6rem;box-shadow:0 2px 8px rgba(0,0,0,.12);
  display:flex;flex-direction:column;justify-content:center;font-size:.95rem;line-height:1.25;
}
.cell.exam{ background:#d32f2f !important; color:#fff !important; }
.cell-title{font-weight:800}
.cell-sub{opacity:.95;font-size:.85rem;margin-top:.2rem}

/* 暗色调校 */
:global(html.dark) .times{background:#1f2937;color:#e5e7eb}
:global(html.dark) .time-row{border-color:#3b4251}
:global(html.dark) .week-tag{background:#0ea5e9}
:global(html.dark) .days-head{background:#0b1f33;border-color:#14324f}
:global(html.dark) .day-head{background:#093e66;color:#e6f3ff}
:global(html.dark) .day-col{background:#111827;box-shadow:0 4px 14px rgba(0,0,0,.35)}
:global(html.dark) .cell{box-shadow:0 2px 8px rgba(0,0,0,.5)}
</style>
