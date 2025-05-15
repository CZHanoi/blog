<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from "vue";
import { withBase } from "vuepress/client";
import { loadWeek, WeekTasks } from "../../nomenclature/taskStore";

/* ───── ① 计数 & 时间 ───── */
const base = new Date("2004-09-05T00:00:00Z");
const now  = ref(new Date());
const weekday = "日一二三四五六".split("");
function partsOf(d: Date){
  const n = Math.floor((d - base) / 864e5);
  return { X: Math.floor(n / 980), Y: Math.floor(n / 7) % 140, Z: n % 7 };
}
const parts = ref(partsOf(now.value));
setInterval(() => { now.value = new Date(); parts.value = partsOf(now.value); }, 1e3);

/* ───── ② 台风数据 ───── */
interface Ty { cn: string; en: string; retired: boolean }
const tyMap = ref<Record<number, Ty>>({});
onMounted(async () => {
  const buf = await fetch(withBase("/typhoon.csv")).then(r => r.arrayBuffer());
  let txt   = new TextDecoder("utf-8").decode(buf);
  if (txt.includes("�")) try { txt = new TextDecoder("gb18030").decode(buf); } catch {}
  txt.trim().split(/\r?\n/).slice(1).forEach(l => {
    const [d, e, c, , r] = l.split(/,(?!\s)/);
    tyMap.value[+d - 1] = { cn: c, en: e, retired: r === "TRUE" };
  });
});
const ty     = computed(() => tyMap.value[  parts.value.Y             ] ?? { cn: "未知", en: "Unknown", retired: false });
const tyPrev = computed(() => tyMap.value[ (parts.value.Y + 139) % 140] ?? { cn: "未知", en: "Unknown", retired: false });
const tyNext = computed(() => tyMap.value[ (parts.value.Y +   1) % 140] ?? { cn: "未知", en: "Unknown", retired: false });

/* ───── ③ 任务 ───── */
const weekIdx = ref(parts.value.Y);
const tasks: WeekTasks = reactive(loadWeek(weekIdx.value));

const input = ref("");
function add() { if (!input.value.trim()) return; tasks.curr.unshift({ txt: input.value.trim(), done: false }); input.value = ""; }
function toggle(list: keyof WeekTasks, i: number) { tasks[list][i].done = !tasks[list][i].done; }
function remove(list: keyof WeekTasks, i: number) { tasks[list].splice(i, 1); }

/* ───── ④ 折叠列宽 ───── */
const L = ref(false), R = ref(false);
function tog(w: "L" | "R") { w === "L" ? (L.value = !L.value, R.value = false) : (R.value = !R.value, L.value = false); }
const grid = computed(() => L.value ? "3fr 1fr 1fr" : R.value ? "1fr 1fr 3fr" : "1fr 3fr 1fr");

/* ───── ⑤ 跨周迁移 ───── */
watch(() => parts.value.Y, (newY, oldY) => {
  if (newY === oldY) return;
  const prevWeekData = JSON.parse(JSON.stringify(tasks));
  const loaded = loadWeek(newY);
  if (loaded.prev.length === 0 && loaded.curr.length === 0 && loaded.next.length === 0) {
    loaded.prev = prevWeekData.curr;
    loaded.curr = prevWeekData.next;
    loaded.next = [];
  }
  weekIdx.value = newY;
  tasks.prev = loaded.prev; tasks.curr = loaded.curr; tasks.next = loaded.next;
});
</script>

<template>
  <div class="nomenclature-page-wrapper">
    <header class="top">
      <div class="counter">
        {{ parts.X.toString().padStart(2, "0") }}.
        {{ parts.Y.toString().padStart(3, "0") }}.
        {{ parts.Z }}
      </div>
      <div class="dt">
        <span>{{ now.toLocaleDateString() }}</span>
        <span>{{ now.toLocaleTimeString() }}・星期{{ weekday[now.getDay()] }}</span>
      </div>
    </header>

    <section class="ty" :class="{ ret: ty.retired }">
      <h1>{{ ty.cn }}</h1><p>{{ ty.en }}</p>
    </section>

    <section class="boards" :style="{ gridTemplateColumns: grid }">
      <aside class="card prev"   @dblclick="tog('L')">
        <h3 :class="{ ret: tyPrev.retired }">{{ tyPrev.cn }}</h3>
        <ul>
          <li v-for="(t,i) in tasks.prev" :key="i">
            <span :class="{ done:t.done }">{{ t.txt }}</span>
            <div class="btns">
              <button @click="toggle('prev',i)">✅</button>
              <button @click="remove('prev',i)">🗑</button>
            </div>
          </li>
        </ul>
      </aside>

      <main class="card curr">
        <h3>本周任务</h3>
        <form class="adder" @submit.prevent="add">
          <input v-model="input" placeholder="新任务…" /><button type="submit">＋</button>
        </form>
        <ul>
          <li v-for="(t,i) in tasks.curr" :key="i">
            <span :class="{ done:t.done }">{{ t.txt }}</span>
            <div class="btns">
              <button @click="toggle('curr',i)">✅</button>
              <button @click="remove('curr',i)">🗑</button>
            </div>
          </li>
        </ul>
      </main>

      <aside class="card next"   @dblclick="tog('R')">
        <h3 :class="{ ret: tyNext.retired }">{{ tyNext.cn }}</h3>
        <ul>
          <li v-for="(t,i) in tasks.next" :key="i">
            <span :class="{ done:t.done }">{{ t.txt }}</span>
            <div class="btns">
              <button @click="toggle('next',i)">✅</button>
              <button @click="remove('next',i)">🗑</button>
            </div>
          </li>
        </ul>
      </aside>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap");
.top{display:grid;grid-template-columns:3fr 1.3fr;gap:1rem;align-items:center;margin-top:1.4rem}
.counter{font:700 5rem "Cinzel Decorative",serif;color:#7646ff}
.dt{display:flex;flex-direction:column;text-align:right;font-weight:600}
.dt span:nth-child(1){font-size:1.4rem}.dt span:nth-child(2){font-size:1.1rem;opacity:.8}
@media(max-width:640px){.top{grid-template-columns:1fr}.dt{display:none}.counter{text-align:center;font-size:4rem}}

.ty{text-align:center;margin:2rem 0 1rem}.ty h1{margin:0;font:700 2.8rem "Cinzel Decorative",serif}.ty p{margin:.25rem 0 0;font-style:italic;opacity:.8}.ret{color:#e53935}

.boards{display:grid;gap:1rem;margin-bottom:3rem;transition:grid-template-columns .35s ease}
.card{background:#fff;border-radius:18px;box-shadow:0 4px 14px rgba(0,0,0,.1);padding:1rem 1.2rem;overflow:hidden;cursor:pointer}
.prev{background:#ffe8f3}.curr{background:#e6f1ff;cursor:default}.next{background:#fff6d8}
.card h3{margin:0 0 .55rem;font-size:1.1rem;text-align:center}.card h3.ret{color:#e53935}

.adder{display:flex;gap:.45rem;margin-bottom:.6rem;width:80%}.adder input{flex:1;padding:.45rem .6rem;border:1px solid #bbb;border-radius:10px}.adder button{width:2.6rem;border:none;border-radius:10px;background:#7646ff;color:#fff;font-size:1.3rem}
.curr{display:flex;flex-direction:column;align-items:center}.curr ul{width:80%}

ul{list-style:none;padding:0;margin:0;max-height:240px;overflow:auto}
li{display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;border-bottom:1px dashed #ccc}
li:last-child{border:none}.done{text-decoration:line-through;opacity:.6}
.btns button{background:none;border:none;font-size:1.1rem;cursor:pointer;padding:0 .2rem}

/* ─── Dark Mode ─── */
#app {
  html[data-theme="dark"] & {
    .nomenclature-page-wrapper::before {
      background-image: url("/blog/bg-dark.jpg");
      background-size: cover;      // !!!
      animation: none;
      background-position: 0% 0%;
      // 如果还需要 top/left/width/height 的微调
      // top: -10%;
      // left: -10%;
      // width: 110%;
      // height: 110%;
    }

    // 以下就是原 @media dark 下的各条规则
    .counter {
      color: #d1c8ff;
    }
    .card {
      box-shadow: 0 4px 14px rgba(0,0,0,.4);
      color: #f7f7f7;
    }
    .prev {
      background: #5b2241;
    }
    .curr {
      background: #1c355a;
    }
    .next {
      background: #423b1a;
    }
    .adder {
      input {
        background: #2a2a2a;
        border-color: #666;
        color: #f7f7f7;
      }
      button {
        background: #a78bfa;
      }
    }
    .dt span:nth-child(2) {
      opacity: .95;
    }
  }
}

.nomenclature-page-wrapper::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;                  
  pointer-events: none;

  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  background-size: cover;
  will-change: background-position;   
}

html:not(.dark) .nomenclature-page-wrapper::before {
  background-image: url("/blog/bg-light6.jpg");
//   background-size: 110%;
  animation: bg-pan 45s linear infinite alternate;
  background-position: center 0%; 
  top: -10%;
  left: -10%;
  width: 110%;
  height: 110%;
}

#app {
    html[data-theme="dark"] & {
        .nomenclature-page-wrapper::before {
        background-image: url("/blog/bg-dark.jpg");
        background-size: cover;      //!!!
        animation: none;
        background-position: 0% 0%;
//         top: -10%;
//   left: -10%;
//   width: 110%;
//   height: 110%;
        }
    }
}

@keyframes bg-pan {

  0%   { transform: translateX(9%); }       
  50%  { transform: translateX(5%); }    
  100% { transform: translateX(9%); }
}

.vp-blog-mask {
  z-index: 1 !important;      
}

.nomenclature-page-wrapper > * {
  position: relative;
  z-index: 0;                  
}

.epic-quote {
  font-style: italic;
  font-size: 1.4rem;
  line-height: 1.5;
  margin: 1.5rem 0;
  padding: 1.25rem 1.5rem;
  border-left: 4px solid currentColor;   // 默认用文字色作占位
  border-radius: 6px;
  transition: background-color .35s ease, color .35s ease,
              border-color .35s ease;
}
</style>
