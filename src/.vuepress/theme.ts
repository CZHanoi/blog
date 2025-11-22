import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://czhanoi.github.io/blog/",

  author: {
    name: "CZHanoi",
    url: "https://czhanoi.github.io/blog/",
  },

  logo: "./logo.png",
  logoDark: "./logoDark.png",
  repo: "vuepress-theme-hope/vuepress-theme-hope",

  docsDir: "src",
  editLink: false,

  repoDisplay: true,
  // navbar
  navbar,

  // sidebar
  sidebar,                                // ★ 新增

  footer: "Default footer",
  displayFooter: true,
  pageInfo: ["Author", "Date", "Category", "Tag"],
  encrypt: {
    config: {
      "/demo/encrypt.html": {
        hint: "Password: 1234",
        password: "1234",
      },
    },
  },

  blog: {
    description: "Onward to Jerusalem",
    intro: "/intro.html",
    medias: {
      BiliBili: "https://space.bilibili.com/276236496",
      GitHub: "https://github.com/CZHanoi",
    },
  },

  metaLocales: {
    editLink: "Edit this page on GitHub",
  },

  markdown: {
    align: true,
    attrs: true,
    codeTabs: true,
    component: true,
    demo: true,
    figure: true,
    gfm: true,
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    plantuml: true,
    spoiler: true,
    stylize: [
      {
        matcher: "Recommended",
        replacer: ({ tag }) => {
          if (tag === "em")
            return {
              tag: "Badge",
              attrs: { type: "tip" },
              content: "Recommended",
            };
        },
      },
    ],
    sub: true,
    sup: true,
    tabs: true,
    tasklist: true,
    vPre: true,
  },

  plugins: {
    blog: true,

    components: {
      components: ["Badge", "VPCard"],
    },

    icon: {
      prefix: "fa6-solid:",
    },
  },
},
{
  custom: true,
});
