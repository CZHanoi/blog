<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from "vue";
import { withBase } from "vuepress/client";
import { loadWeek, saveWeek, WeekTasks } from "../../nomenclature/taskStore";

/* ───────── ① 计时器 ───────── */
const baseDate = new Date("2004-09-05T00:00:00Z");
const now      = ref(new Date());
const weekday  = "日一二三四五六".split("");

function partsOf(d: Date) {
  const days = Math.floor((d.getTime() - baseDate.getTime()) / 86_400_000);
  return { X: Math.floor(days / (7 * 140)), Y: Math.floor(days / 7) % 140, Z: days % 7 };
}
const parts = ref(partsOf(now.value));
setInterval(() => { now.value=new Date(); parts.value=partsOf(now.value); }, 1000);

/* ───────── ② 读取 CSV (支持 UTF-8 / GBK) ───────── */
interface Ty { cn:string; en:string; retired:boolean }
const tyMap = ref<Record<number,Ty>>({});

async function loadCSV() {
  const resp = await fetch(withBase("/typhoon.csv"));
  if (!resp.ok) return;                // 找不到文件直接保空表
  const buf  = await resp.arrayBuffer();

  let text = new TextDecoder("utf-8").decode(buf);
  if (text.includes("�")) {            // 怀疑是 GBK/GB18030
    try { text = new TextDecoder("gb18030").decode(buf); } catch { /* 若浏览器不支持跳过 */ }
  }

  const map: Record<number,Ty> = {};
  text.trim().split(/\r?\n/).slice(1).forEach(line => {
    const [id,en,cn,,ret] = line.split(/,(?!\s)/);
    map[Number(id)-1] = { cn, en, retired: ret==="TRUE" };
  });
  tyMap.value = map;
}
onMounted(loadCSV);

/* 当前、前、后一周台风 */
const ty     = computed(() => tyMap.value[ parts.value.Y ]          ?? { cn:"未知", en:"Unknown", retired:false });
const tyPrev = computed(() => tyMap.value[(parts.value.Y+139)%140] ?? { cn:"未知", en:"Unknown", retired:false });
const tyNext = computed(() => tyMap.value[(parts.value.Y+1)%140]   ?? { cn:"未知", en:"Unknown", retired:false });

/* ───────── ③ 任务存储 ───────── */
const weekIdx = ref(parts.value.Y);
const tasks: WeekTasks = reactive(loadWeek(weekIdx.value));
watch(() => ({...tasks}), v => saveWeek(weekIdx.value, v), { deep:true });

const newTxt = ref("");
function addTask() { if(newTxt.value.trim()){ tasks.curr.unshift(newTxt.value.trim()); newTxt.value=""; } }

/* ───────── ④ 折叠逻辑 ───────── */
const L = ref(false), R = ref(false);
function toggle(which:"L"|"R"){ if(which==="L"){L.value=!L.value;R.value=false;}else{R.value=!R.value;L.value=false;} }
const grid = computed(()=>L.value?"3fr 1fr 1fr":R.value?"1fr 1fr 3fr":"1fr 3fr 1fr");
</script>

<template>
  <!-- 顶栏 -->
  <header class="top">
    <div class="counter">
      {{ parts.X.toString().padStart(2,"0") }}.
      {{ parts.Y.toString().padStart(3,"0") }}.
      {{ parts.Z }}
    </div>
    <div class="dt">
      <span>{{ now.toLocaleDateString() }}</span>
      <span>{{ now.toLocaleTimeString() }}・星期{{ weekday[now.getDay()] }}</span>
    </div>
  </header>

  <!-- 台风名称 -->
  <section class="ty" :class="{ret:ty.retired}">
    <h1>{{ ty.cn }}</h1>
    <p>{{ ty.en }}</p>
  </section>

  <!-- 三栏任务 -->
  <section class="boards" :style="{gridTemplateColumns:grid}">
    <!-- 上一周 -->
    <aside class="card prev" @dblclick="toggle('L')">
      <h3 :class="{ret:tyPrev.retired}">{{ tyPrev.cn }}</h3>
      <ul><li v-for="(t,i) in tasks.prev" :key="i">{{ t }}</li></ul>
    </aside>

    <!-- 本周 -->
    <main class="card curr">
      <h3>本周任务</h3>
      <form class="adder" @submit.prevent="addTask">
        <input v-model="newTxt" placeholder="新任务…" /><button type="submit">＋</button>
      </form>
      <ul><li v-for="(t,i) in tasks.curr" :key="i">{{ t }}</li></ul>
    </main>

    <!-- 下一周 -->
    <aside class="card next" @dblclick="toggle('R')">
      <h3 :class="{ret:tyNext.retired}">{{ tyNext.cn }}</h3>
      <ul><li v-for="(t,i) in tasks.next" :key="i">{{ t }}</li></ul>
    </aside>
  </section>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Share+Tech+Mono&display=swap");
/* 顶栏 */
.top{display:grid;grid-template-columns:3fr 1.3fr;gap:1rem;align-items:center;margin-top:1.4rem}
.counter{font:700 5rem "Cinzel Decorative",serif;color:#7646ff;word-break:break-all}
.dt{display:flex;flex-direction:column;text-align:right;font-weight:600}.dt span:nth-child(1){font-size:1.4rem}.dt span:nth-child(2){font-size:1.1rem;opacity:.8}
@media(max-width:640px){.top{grid-template-columns:1fr}.dt{display:none}.counter{text-align:center;font-size:4rem}}

/* 台风名称 */
.ty{text-align:center;margin:2rem 0 1rem}.ty h1{margin:0;font:700 2.8rem "Cinzel Decorative",serif}.ty p{margin:.25rem 0 0;font-style:italic;opacity:.8}.ret h1,.ret p,.ret{color:#e53935}

/* 三栏 */
.boards{display:grid;gap:1rem;margin-bottom:3rem;transition:grid-template-columns .35s ease}
.card{background:#fff;border-radius:18px;box-shadow:0 4px 14px rgba(0,0,0,.1);padding:1rem 1.2rem;overflow:hidden;cursor:pointer}
.prev{background:#ffe8f3}.curr{background:#e6f1ff;cursor:default}.next{background:#fff6d8}
.card h3{margin:0 0 .55rem;font-size:1.1rem;text-align:center}.card h3.ret{color:#e53935}
ul{list-style:none;padding:0;margin:0;max-height:240px;overflow:auto}li{padding:.3rem 0;border-bottom:1px dashed #ccc}li:last-child{border:none}

/* 主列居中 */
.curr{display:flex;flex-direction:column;align-items:center}.adder{display:flex;gap:.45rem;margin-bottom:.6rem;width:80%}
.adder input{flex:1;padding:.45rem .6rem;border:1px solid #bbb;border-radius:10px}.adder button{width:2.6rem;border:none;border-radius:10px;background:#7646ff;color:#fff;font-size:1.3rem}
.curr ul{width:80%}

/* 侧栏折叠时只显示标题 */
.prev:not(:hover):not(.open) ul,
.next:not(:hover):not(.open) ul{display:none}
</style>
