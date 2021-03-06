import { initMixin } from "./init";
import { stateMixin } from "./state";
import { renderMixin } from "./render";
import { eventsMixin } from "./events";
import { lifecycleMixin } from "./lifecycle";
import { warn } from "../util/index";

// Vue的构造函数
function Vue(options) {
  if (process.env.NODE_ENV !== "production" && !(this instanceof Vue)) {
    warn("Vue is a constructor and should be called with the `new` keyword");
  }
  this._init(options);
}

// 定义 Vue.prototype._init 方法
initMixin(Vue);
// 定义数据相关的实例方法
// Vue.prototype.$data, $props, $set, $delete, $watch
stateMixin(Vue);
// 定义事件相关方法
// $on, $off, $once, $emit
eventsMixin(Vue);
// 定义生命周期相关的实例方法
// Vue.prototype._update | Vue.prototype.$forceUpdate | Vue.prototype.$destroy
lifecycleMixin(Vue);
/**
 * 执行 installRenderHelpers，在 Vue.prototype 对象上安装运行时便利程序
 * 定义：
 * Vue.prototype.$nextTick
 * Vue.prototype._render
 */
renderMixin(Vue);

export default Vue;
