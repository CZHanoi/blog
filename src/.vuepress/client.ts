import { defineClientConfig } from "vuepress/client";
import Nomenclature from "./components/Nomenclature.vue";

export default defineClientConfig({
  enhance: ({ app }) => {
    app.component("Nomenclature", Nomenclature);
  },
});
