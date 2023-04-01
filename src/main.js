import { createApp } from 'vue';
import '~bootstrap/dist/css/bootstrap.min.css'
import App           from './App.vue';

import { vMaska } from "maska";

createApp(App)
  .directive("maska", vMaska)
  .mount('#app');
