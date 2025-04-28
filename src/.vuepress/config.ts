import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

import { path } from "@vuepress/utils";

export default defineUserConfig({
  base: "/blog/",

  lang: "en-US",
  title: "CZHanoi",
  description: "What can I say?",

  theme,
  // plugins: [
  //   registerComponentsPlugin({
  //     componentsDir: path.resolve(__dirname, "./components"),
  //   }),
  // ],
  // Enable it with pwa
  // shouldPrefetch: false,
});
