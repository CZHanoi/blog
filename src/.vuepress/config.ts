import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/blog/",

  lang: "en-US",
  title: "CZHanoi",
  description: "What can I say?",

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
