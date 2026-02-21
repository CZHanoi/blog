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
      { text: "治安疏「2026」", link: "", icon: "fa6-solid:hurricane" },
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
    prefix: "/code/",
    children: [
      { text: "序: Dentate gyrus", link: "", icon: "fa6-solid:head-side-brain" },
      { text: "Convert",   link: "convert/", icon: "fa6-solid:arrow-right-arrow-left" },

    ],
  },
  { text: 'Ashoka',
    icon: 'fa6-solid:dharmachakra',
    link: '/ashoka/' },

  // ────────── 命名表 ──────────
  {
    text: "命名表",
    icon: "fa6-solid:wind",
    link: "/nomenclature/",
  },

  // ────────── 金雨计划 ──────────
  {
    text: "金雨",
    icon: "fa6-solid:fish-fins",
    prefix: "/golden-rain/",
    children: [
      { text: "Trajectory & OT",      link: "trajectory-ot/" },
      { text: "Multi-Omics & ATAC",   link: "multi-omics-atac/" },
      { text: "ST",                   link: "st/" },
      { text: "Others",               link: "others/" },
    ],
  },
  {
    text: "Dropsonde",
    link: "/dropsonde/",
    icon: "fa6-solid:torii-gate",
    prefix: "/dropsonde/",
    children: [
      { text: "序: Drop!!!!!", link: "", icon: "fa6-solid:hurricane" },
      { text: "Jupyter", link: "jupyter.html", icon: "fa6-solid:laptop-code" },
      { text: "Otaku-R", link: "otaku-r.html", icon: "fa6-solid:gamepad" },


    ],
  },
]);
