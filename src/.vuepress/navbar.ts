import { navbar } from "vuepress-theme-hope";

export default navbar([
  // 首页以外的单页
  { text: "守&望", icon: "fa6-solid:h", link: "/intro.html" },

  // ────────── 医学之路 ──────────
  {
    text: "医学之路",
    icon: "pen-to-square",
    prefix: "/medicine/",
    children: [
      { text: "养生主", link: "yangshengzhu/" },
    ],
  },

  // ────────── 计算大计 ──────────
  {
    text: "计算大计",
    icon: "pen-to-square",
    prefix: "/computer/",
    children: [
      { text: "MATLAB",      link: "matlab/" },
      { text: "Python & R",  link: "python-r/" },
    ],
  },

  // ────────── 翰史 ──────────
  {
    text: "碑",
    icon: "monument",
    prefix: "/history/",
    children: [],
  },

  // ────────── 命名表 ──────────
  {
    text: "命名表",
    icon: "fa6-solid:wind",
    link: "/nomenclature/",
  },

  // ────────── 金雨计划 ──────────
  {
    text: "金雨计划",
    icon: "fa6-solid:fish-fins",
    prefix: "/golden-rain/",
    children: [
      { text: "Trajectory & OT",      link: "trajectory-ot/" },
      { text: "Multi-Omics & ATAC",   link: "multi-omics-atac/" },
      { text: "ST",                   link: "st/" },
      { text: "Others",               link: "others/" },
    ],
  },
]);
