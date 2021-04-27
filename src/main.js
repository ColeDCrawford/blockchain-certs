import Vue from "vue";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import AsyncComputed from "vue-async-computed";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import drizzleVuePlugin from "@drizzle/vue-plugin";
import drizzleOptions from "./drizzleOptions";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

// import HomePage from "@/components/pages/HomePage.vue";

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(AsyncComputed);

Vue.use(drizzleVuePlugin, { store, drizzleOptions });

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
