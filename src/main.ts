import { createApp } from 'vue';
import './style.css'
import App from './App.vue';
// @ts-ignore
import { vMaska } from "maska"
import { router } from './router';

createApp(App)
    .use(router)
    .directive("maska", vMaska)
    .mount('#app');
