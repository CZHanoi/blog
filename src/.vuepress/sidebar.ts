import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  /* 根路径——首页与 intro */
  "/": [
    "",
    "intro",
  ],

  /* ────────── 计算大计 ────────── */
  "/computer/": [
    {
      text: "计算大计",
      icon: "pen-to-square",
      prefix: "",
      collapsible: false,
      children: [
        { text: "概览", link: "" },
        {
          text: "MATLAB",
          prefix: "matlab/",
          children: "structure",
        },
        {
          text: "Python & R",
          prefix: "python-r/",
          children: "structure",
        },
      ],
    },
  ],

  /* ────────── 医学之路 ────────── */
  "/medicine/": [
    {
      text: "医学之路",
      icon: "pen-to-square",
      prefix: "",
      collapsible: false,
      children: [
        { text: "概览", link: "" },          // medicine/README.md
        {
          text: "养生主",
          prefix: "yangshengzhu/",
          children: "structure",
        },
      ],
    },
  ],

  /* ────────── 金雨计划 ────────── */
  "/golden-rain/": [
    {
      text: "金雨计划",
      icon: "fa6-solid:fish-fins",
      prefix: "",
      collapsible: false,
      children: [
        { text: "概览", link: "" },
        {
          text: "Trajectory & OT",
          prefix: "trajectory-ot/",
          children: "structure",
        },
        {
          text: "Multi-Omics & ATAC",
          prefix: "multi-omics-atac/",
          children: "structure",
        },
        {
          text: "ST",
          prefix: "st/",
          children: "structure",
        },
        {
          text: "Others",
          prefix: "others/",
          children: "structure",
        },
      ],
    },
  ],

  /* ────────── 翰史 ────────── */
  "/history/": [
    {
      text: "翰史",
      icon: "pen-to-square",
      prefix: "",
      collapsible: false,
      children: "structure",
    },
  ],

  /* ────────── 命名表（单页面）────────── */
  "/nomenclature/": [
    "",
  ],
});
