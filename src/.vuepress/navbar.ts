import { navbar } from "vuepress-theme-hope";

export default navbar([
  // "/",
  // "/demo/",
  {
    text: "医学之路",
    icon: "pen-to-square",
    prefix: "/medicine/",
    children: [
      { text: "demo", icon: "pen-to-square", link: "Demo" },
    ]
  },
  {
    text: "计算大计",
    icon: "pen-to-square",
    prefix: "/computer/",
    children: [
      // {
      //   text: "Apple",
      //   icon: "pen-to-square",
      //   prefix: "apple/",
      //   children: [
      //     { text: "Apple1", icon: "pen-to-square", link: "1" },
      //     { text: "Apple2", icon: "pen-to-square", link: "2" },
      //     "3",
      //     "4",
      //   ],
      // },
      // {
      //   text: "Banana",
      //   icon: "pen-to-square",
      //   prefix: "banana/",
      //   children: [
      //     {
      //       text: "Banana 1",
      //       icon: "pen-to-square",
      //       link: "1",
      //     },
      //     {
      //       text: "Banana 2",
      //       icon: "pen-to-square",
      //       link: "2",
      //     },
      //     "3",
      //     "4",
      //   ],
      // },
      // { text: "Cherry", icon: "pen-to-square", link: "cherry" },
      // { text: "Dragon Fruit", icon: "pen-to-square", link: "dragonfruit" },
      // "tomato",
      // "strawberry",
    ],
  },
  {
    text: "翰史",
    icon: "pen-to-square",
    prefix: "/history/",
    children: [
      // { text: "demo", icon: "pen-to-square", link: "Demo" },
    ]
  },
  {
    text: "命名表",
    icon: "fa6-solid:wind",      // theme.ts 中已设 icon.prefix = "fa6-solid:"
    link: "/nomenclature/",      // 直接跳转，不带 children
  },

  

 // {
 //   text: "V2 Docs",
 //  icon: "book",
 //   link: "https://theme-hope.vuejs.press/",
 //},
]);
