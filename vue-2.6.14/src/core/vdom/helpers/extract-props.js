/* @flow */

import {
  tip,
  hasOwn,
  isDef,
  isUndef,
  hyphenate,
  formatComponentName,
} from "core/util/index";

/**
 * <comp :msg='hello vue'></comp>
 * 提取 props, 得到res[key] = val
 * 组件的props选项：{props: {msg: {type: String, defalut: xx}}}
 *
 * 以props配置中的属性为key, 父组件中对应的数据为 value
 * 当父组件中数据更新时，触发响应式更新，重新执行 render, 生成新的vnode, 又走到这里
 * 这样子组件中相应的数据就会被更新
 */
export function extractPropsFromVNodeData(
  data: VNodeData, //{msg:'hello vue'}
  Ctor: Class<Component>, //组件构造函数
  tag?: string // 组件标签名
): ?Object {
  //这里只提取原始值，验证和默认值在子组件中处理
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  const propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return;
  }
  const res = {};
  const { attrs, props } = data;
  if (isDef(attrs) || isDef(props)) {
    for (const key in propOptions) {
      const altKey = hyphenate(key);
      if (process.env.NODE_ENV !== "production") {
        const keyInLowerCase = key.toLowerCase();
        if (key !== keyInLowerCase && attrs && hasOwn(attrs, keyInLowerCase)) {
          tip(
            `Prop "${keyInLowerCase}" is passed to component ` +
              `${formatComponentName(
                tag || Ctor
              )}, but the declared prop name is` +
              ` "${key}". ` +
              `Note that HTML attributes are case-insensitive and camelCased ` +
              `props need to use their kebab-case equivalents when using in-DOM ` +
              `templates. You should probably use "${altKey}" instead of "${key}".`
          );
        }
      }
      checkProp(res, props, key, altKey, true) ||
        checkProp(res, attrs, key, altKey, false);
    }
  }
  return res;
}

function checkProp(
  res: Object,
  hash: ?Object,
  key: string,
  altKey: string,
  preserve: boolean
): boolean {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true;
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true;
    }
  }
  return false;
}
