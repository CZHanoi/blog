#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { TextDecoder } from "util";

/* ---------- 环境 ---------- */
const SRC = path.resolve("src");                          // 文档根
const TEMP = path.resolve("src/.vuepress/.temp");         // VuePress 构建时会存在
fs.mkdirSync(TEMP, { recursive: true });

/* ---------- 读取浏览器导出的 tasks.json(若有) ---------- */
const jsonFile = path.join(SRC, "nomenclature", "tasks.json");
const tasksAll = fs.existsSync(jsonFile) ? JSON.parse(fs.readFileSync(jsonFile, "utf8")) : {};

/* ---------- 当下计数 ---------- */
const base = new Date("2004-09-05T00:00:00Z");
const days = Math.floor((Date.now() - base.getTime()) / 86_400_000);
const X = String(Math.floor(days / (7 * 140))).padStart(2, "0");
const Y = Math.floor(days / 7) % 140;

/* ---------- 台风英文名 ---------- */
const csvBuf = fs.readFileSync(path.join(SRC, ".vuepress/public/typhoon.csv"));
let csvText = new TextDecoder("utf8").decode(csvBuf);
if (csvText.includes("�")) csvText = new TextDecoder("gb18030").decode(csvBuf);
const enMap = {};
csvText.trim().split(/\r?\n/).slice(1).forEach(l => {
  const [id,en] = l.split(/,(?!\s)/);
  enMap[id - 1] = en;
});
const enName = enMap[Y] || "Unknown";

/* ---------- 本周任务 ---------- */
const weekTasks = (tasksAll[Y] || {}).curr || [];

/* ---------- 写入临时 TaskXX.md ---------- */
const md =
`---
title: Task ${X}
sidebar: false
---

## ${enName}

${weekTasks.map(t => "- " + t).join("\n")}
`;

const mdPath = path.join(TEMP, `Task${X}.md`);
fs.writeFileSync(mdPath, md, "utf8");
console.log("✅ 临时生成:", mdPath);
