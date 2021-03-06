/* @flow */

import config from "core/config";
import { warn, cached } from "core/util/index";
import { mark, measure } from "core/util/perf";

import Vue from "./runtime/index";
import { query } from "./util/index";
import { compileToFunctions } from "./compiler/index";
import {
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref,
} from "./util/compat";

const idToTemplate = cached((id) => {
  const el = query(id);
  return el && el.innerHTML;
});

/**
 * const mount = Vue.prototype.$mount;
 * Vue.prototype.$mount = function (el){
 *    // 做些什么
 *    return mount.call(this,el)
 * }
 *
 *❗注意：这里做了函数劫持
 * 我们将 Vue原型上的 $mount 方法保存到了 mount中，以便后续使用。
 * 然后 Vue原型上的$mount方法被一个新的方法覆盖了。新方法中会调用原始的方法，这种做法通常被称为函数劫持。
 * 通过函数劫持，可以在原始功能之上增加一些其他功能。在上面的代码中，vm.$mount 的原始方法就是 mount 的核心功能，
 * 而在完整版中（包含编译器）需要将编译器功能新增到核心功能上去。
 */

const mount = Vue.prototype.$mount;
/**
 * 编译器的入口
 * 就做了一件事，得到组件的渲染函数，将其设置到`this.$options`上
 * 运行时的 Vue.js 包就没有这部分的代码，通过打包器结合 vue-loader + vue-template-compiler 进行预编译，将模板编译成 render 函数
 */
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 挂载点
  el = el && query(el);

  // 挂载点不能是 body 或者 html，只能挂载到 normal elements上
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== "production" &&
      warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      );
    return this;
  }

  // 配置项
  const options = this.$options;
  // resolve template/el and convert to render function
  // 如果用户提供了 render 配置项，则直接跳过编译阶段，否则进入编译阶段
  // 解析 template和el,并转换为 render 函数
  // 优先级：render > template > el

  if (!options.render) {
    let template = options.template;
    if (template) {
      if (typeof template === "string") {
        // 处理 template 选项
        if (template.charAt(0) === "#") {
          // { template: '#app' }，template 是一个 id 选择器，则获取该元素的 innerHtml 作为模板
          template = idToTemplate(template);
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== "production" && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            );
          }
        }
      } else if (template.nodeType) {
        // template 是一个正常的元素，获取其 innerHtml 作为模版
        template = template.innerHTML;
      } else {
        if (process.env.NODE_ENV !== "production") {
          warn("invalid template option:" + template, this);
        }
        return this;
      }
    } else if (el) {
      // 设置了 el 选项，获取 el 选择器的 outerHtml 作为模版
      template = getOuterHTML(el);
    }
    if (template) {
      // 模板就绪，进入编译阶段
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== "production" && config.performance && mark) {
        mark("compile");
      }

      // 编译模板得到渲染函数
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          //在非生产环境下，编译时记录标签属性在模板字符串中开始和结束的位置索引
          outputSourceRange: process.env.NODE_ENV !== "production",
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          //界定符，默认是{{}}
          delimiters: options.delimiters,
          //是否保留注释
          comments: options.comments,
        },
        this
      );
      // 将两个渲染函数放到 this.$options
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== "production" && config.performance && mark) {
        mark("compile end");
        measure(`vue ${this._name} compile`, "compile", "compile end");
      }
    }
  }
  // 进行挂载
  return mount.call(this, el, hydrating);
};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML(el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML;
  } else {
    const container = document.createElement("div");
    container.appendChild(el.cloneNode(true));
    return container.innerHTML;
  }
}

Vue.compile = compileToFunctions;

export default Vue;
