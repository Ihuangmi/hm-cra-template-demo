import type { AxiosRequestConfig, Canceler } from 'axios';
import axios from 'axios';
import { isFunction, omit } from 'lodash';

// 用于存储每个请求的标识和取消功能
let pendingMap = new Map<string, Canceler>();

/**
 * 判断两次的url是否一致
 */
export const getPendingUrl = (config: AxiosRequestConfig) => {
  return [
    config.method,
    config.url,
    JSON.stringify(omit(config.params, ['_t', 'xyz', 'nonce'])),
    JSON.stringify(config.data),
  ].join('&');
};

export class AxiosCanceler {
  /**
   * @description: 添加请求
   */
  addPending(config: AxiosRequestConfig) {
    // 把当前请求从pending中移除
    this.removePending(config);
    const url = getPendingUrl(config);
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken((cancel) => {
        if (!pendingMap.has(url)) {
          // 如果在pending中没有当前请求，则添加它
          pendingMap.set(url, cancel);
        }
      });
  }

  /**
   * @description: 清除所有请求
   */
  removeAllPending() {
    pendingMap.forEach((cancel) => {
      cancel && isFunction(cancel) && cancel();
    });
    pendingMap.clear();
  }

  /**
   * @description: 移除请求
   */
  removePending(config: AxiosRequestConfig) {
    const url = getPendingUrl(config);

    if (pendingMap.has(url)) {
      // 若当前pending中有url标识，则取消pending中的请求
      const cancel = pendingMap.get(url);
      cancel && cancel(url);
      pendingMap.delete(url);
    }
  }

  /**
   * @description: reset
   */
  reset(): void {
    pendingMap = new Map<string, Canceler>();
  }
}
