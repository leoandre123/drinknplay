import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import flagIcon from "vue-flag-icon";

const app = createApp(App);

app.use(router);
app.use(i18n);
app.use(flagIcon);

app.mount("#app");
