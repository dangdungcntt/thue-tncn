import { createApp } from 'vue';
import './style.css';
import App           from './App.vue';

import { vMaska } from "maska";

createApp(App)
  .directive("maska", vMaska)
  .mount('#app');
