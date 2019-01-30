import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

// 将fly实例挂在vue原型上，在组件中通过this使用fly
var Fly = require("flyio/dist/npm/wx") 
var fly = new Fly
// fly.config.baseURL = 'http://127.0.0.1:8000/api/' // 配置请求基地址
fly.config.baseURL='http://132.232.77.14:3000/api/' // 配置请求基地址
Vue.prototype.$fly = fly // 将fly实例挂在vue原型上

wx.cloud.init({
  traceUser: true
})

const app = new Vue(App)

app.$mount()
