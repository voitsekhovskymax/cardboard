import Vue from 'vue'
import Demo from './demo';
import vSelect from 'vue-select'
Vue.component('v-select', vSelect)
import axios from 'axios'
import VueAxios from 'vue-axios'
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(VueAxios, axios)
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
Vue.component('icon', Icon)
import './polyfills';
Vue.config.productionTip = false
import './style.css'
new Vue({
  el: '#app',
  components: { Demo },
  template: '<Demo/>'
})
