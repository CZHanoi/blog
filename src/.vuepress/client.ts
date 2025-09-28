import { defineClientConfig } from "vuepress/client";
import Nomenclature from "./components/Nomenclature.vue";
import BodhiLayout from './layouts/BodhiLayout.vue'
// import NoCoverLayout from "./layouts/NoCoverLayout.vue";
export default defineClientConfig({
  enhance: ({ app }) => {
    app.component("Nomenclature", Nomenclature);
  },
  layouts: {
    BodhiLayout,
  },
});
