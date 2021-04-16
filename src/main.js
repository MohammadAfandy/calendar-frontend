import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router';
import vuetify from './plugins/vuetify';
import VuetifyDateTimePicker from 'vuetify-datetime-picker';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import "vuetify/dist/vuetify.min.css";
import moment from 'moment-timezone'

Vue.use(VueRouter);

const router = new VueRouter({
  base: '/',
  mode:'history',
})

moment.tz.setDefault('Asia/Jakarta');
Vue.prototype.moment = moment;

// localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjYwNzcwMDYxYzI5NGE3M2Y5MDNiNzYyMiIsInVzZXJuYW1lIjoiQWZhbmR5OTg5NUBnbWFpbC5jb20iLCJmdWxsbmFtZSI6Ik1vaGFtbWFkIEFmYW5keSJ9LCJpYXQiOjE2MTg0MTM5ODksImV4cCI6MTYxOTAxODc4OX0.JuuvkClj7jr970_vGfm9kCV5WBZdMX_0l7dVVvmG5pM');

Vue.config.productionTip = false

Vue.use(VuetifyDateTimePicker);

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')