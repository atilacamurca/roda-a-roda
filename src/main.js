import Vue from 'vue'
import App from './App.vue'

import vuejsStorage from 'vuejs-storage'
Vue.use(vuejsStorage)

import VueConfetti from 'vue-confetti'
Vue.use(VueConfetti)

import './assets/main.css'

new Vue({
    components: {
        App
    },
    render(h) {
        return h('App');
    }
}).$mount('#app')
