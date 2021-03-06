/* @flow */

import { ASSET_TYPES } from "shared/constants";
import { isPlainObject, validateComponentName } from "../util/index";

export function initAssetRegisters(Vue: GlobalAPI) {
  /**
   * 定义 Vue.component、Vue.filter、Vue.directive 这三个方法
   * 这三个方法所做的事情是类似的，就是在 this.options.xx 上存放对应的配置
   * 比如：Vue.component(component,{xxx}), 结果是 this.options.components.compName = 组件构造函数
   * ASSET_TYPES = ['component','directive','filter']
   */
  ASSET_TYPES.forEach((type) => {
    /**
     * 比如：Vue.component(name,definition)
     * @param {*} id name
     * @param {*} definition 组件构造函数或者配置对象
     * @returns 返回组件构造函数
     */
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + "s"][id];
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== "production" && type === "component") {
          // 判断组件名称是否可用
          validateComponentName(id);
        }
        if (type === "component" && isPlainObject(definition)) {
          // 如果组件配置中存在 name,则使用。否则直接使用 id
          definition.name = definition.name || id;
          // extend 就是Vue.extend。所以这时的 definition 就变成了组件的构造函数，使用时可直接使用 new Definition()
          definition = this.options._base.extend(definition);
        }
        if (type === "directive" && typeof definition === "function") {
          definition = { bind: definition, update: definition };
        }
        // this.options.components[id] = definition
        this.options[type + "s"][id] = definition;
        return definition;
      }
    };
  });
}
