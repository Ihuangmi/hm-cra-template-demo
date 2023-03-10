// axios配置

import type { AxiosResponse } from 'axios';
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform';
import { ContentTypeEnum, RequestEnum, ResultEnum, VAxios } from './Axios';
import { checkStatus } from './checkStatus';
import { joinTimestamp, formatRequestDate } from './helper';
import { isString } from 'lodash';
import { OriginResult, RequestOptions } from './type';
import { Dialog, Toast } from 'antd-mobile';
import memoryConfig from '@/utils/memoryConfig';
import setXYZ from './setXYZ';
import qs from 'qs';

/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = '';
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}

export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`;
}

export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, 'Object');
}

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string;
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
  }
  return src;
}

function alterMessage(options: RequestOptions, msg: string | undefined) {
  if (options.errorMessageMode === 'notification') {
    Dialog.alert({
      content: msg,
      closeOnMaskClick: true,
    });
  } else if (options.errorMessageMode === 'message') {
    Toast.show({
      icon: 'fail',
      content: msg,
    });
  }
}

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * @description: 处理请求数据。如果数据不是预期格式，可直接抛出错误
   */
  transformRequestHook: (res: AxiosResponse<OriginResult>, options: RequestOptions) => {
    const { isTransformResponse, isReturnNativeResponse } = options;
    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res;
    }
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse) {
      return res.data;
    }
    // 错误的时候返回
    const { data } = res;

    if (!data) {
      // return '[HTTP] Request has no return value';
      alterMessage(options, '服务出错');
      return {
        success: false,
        result: null,
        message: '服务出错',
      };
    }
    // 兼容另一种格式的返回值
    let _data = {
      code: data.code,
      message: data.message,
      data: data.data,
    };
    if (data.hasOwnProperty('success')) {
      const { value } = data;
      _data = {
        code: value!.code,
        message: value!.message,
        data: value!.data.list,
      };
    }

    //  这里 code，result，message为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    const { code, data: result, message } = _data;

    // 这里逻辑可以根据项目进行修改
    const successCode = ['000000', '1', 0, 1, 2000];
    const hasSuccess = successCode.includes(code);

    if (hasSuccess) {
      return {
        success: true,
        result: result,
        message: message!,
      };
    }

    if (code === ResultEnum.NotLogin || message === ResultEnum.NotLogin) {
      window.location.href = memoryConfig.loginUrl;
      return {
        success: false,
        message: '',
        result: null,
      };
    }

    // 在此处根据自己项目的实际情况对不同的code执行不同的操作
    // 如果不希望中断当前请求，请return数据，否则直接抛出异常即可
    let timeoutMsg = message;
    let errorTitle = '';
    let newOptions: RequestOptions = {};
    switch (code) {
      case ResultEnum.TIMEOUT:
        timeoutMsg = '参数错误';
        break;
      case ResultEnum.QuantityOverflow:
        errorTitle = '超出版本限制';
        newOptions.errorMessageMode = 'notification';
        Dialog.alert({
          content: '数量超出版本限制，请删除部分资源或者升级版本',
          closeOnMaskClick: true,
        });
        break;
      case ResultEnum.ShouldPay:
        // 付费可见暂不做任何提示
        return {
          success: false,
          result: null,
          message: timeoutMsg || '请求出错，请稍后重试' || errorTitle,
        };
      default:
        break;
    }

    // errorMessageMode=‘notification’的时候会显示notification，而不是消息提示，用于一些比较重要的错误
    // errorMessageMode='none' 一般是调用时明确表示不希望自动弹出错误提示
    alterMessage(newOptions.errorMessageMode ? newOptions : options, timeoutMsg);

    return {
      success: false,
      result: null,
      message: timeoutMsg || '请求出错，请稍后重试',
    };
  },

  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true, urlPrefix } = options;

    if (joinPrefix) {
      config.url = `${urlPrefix}${config.url}`;
    }

    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`;
    }
    const params = config.params || {};

    const data = config.data || false;
    formatDate && data && !isString(data) && formatRequestDate(data);
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false));
      } else {
        // 兼容restful风格
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
      }
    } else {
      // post 默认json请求
      if (
        config.method?.toUpperCase() === RequestEnum.POST &&
        !config.headers?.['Content-Type'] &&
        !config.headers?.['content-type']
      ) {
        config.headers = {
          ...config.headers,
          'Content-Type': ContentTypeEnum.JSON,
        };
      }
      if (!isString(params)) {
        formatDate && formatRequestDate(params);
        if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
          config.data = data;
          config.params = params;
        } else {
          // 非GET请求如果没有提供data，则将params视为data
          config.data = params;
          config.params = undefined;
        }
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(config.url as string, Object.assign({}, config.params, config.data));
        }
      } else {
        // 兼容restful风格
        config.url = config.url + params;
        config.params = undefined;
      }
    }
    return config;
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config, options) => {
    // 请求之前处理config
    // 添加XYZ
    if (config.method?.toLocaleLowerCase() === 'get') {
      config.params = setXYZ(config.url, config.params);
    }

    if (config.method?.toLocaleLowerCase() === 'post') {
      const contentType = options.headers?.['Content-Type'] || options.headers?.['content-type'];

      if (contentType === ContentTypeEnum.JSON) {
        config.params = setXYZ(config.url);
      } else if (contentType === ContentTypeEnum.FORM_URLENCODED) {
        config.data = setXYZ(config.url, config.data);
      }
    }

    return config;
  },

  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    return res;
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    const { response, code, message, config } = error || {};
    const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none';
    const msg: string = response?.data?.error?.message ?? '';
    const err: string = error?.toString?.() ?? '';
    let errMessage = '';

    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        errMessage = '接口请求超时，请刷新页面重试';
      }
      if (err?.includes('Network Error')) {
        errMessage = '网络异常，请检查您的网络连接是否正常';
        console.error(err);
      }

      if (errMessage) {
        if (errorMessageMode === 'notification') {
          Toast.show({
            icon: 'fail',
            content: errMessage,
          });
        } else if (errorMessageMode === 'message') {
          Toast.show({
            icon: 'fail',
            content: errMessage,
          });
        }
        return Promise.resolve({
          success: false,
          result: null,
          message: 'test1',
        });
      }
    } catch (e) {
      throw new Error(e as unknown as string);
    }

    checkStatus(error?.response?.status, msg, errorMessageMode);

    return Promise.reject(error);
  },

  /**
   * @description 请求错误捕获
   */
  requestCatchHook: (e) => {
    return Promise.reject(e);
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    deepMerge(
      {
        // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
        // authentication schemes，e.g: Bearer
        // authenticationScheme: 'Bearer',
        authenticationScheme: '',
        timeout: 30 * 1000,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: true,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 消息提示类型
          errorMessageMode: 'message',
          // 接口地址
          apiUrl: '',
          // 接口拼接地址
          urlPrefix: '',
          //  是否加入时间戳
          joinTime: true,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true,
        },
        paramsSerializer: (params) => qs.stringify(params, { indices: false }),
      } as CreateAxiosOptions,
      opt || {},
    ),
  );
}

export const requestGW = createAxios({
  withCredentials: true,
  requestOptions: {
    urlPrefix: import.meta.env.VITE_GW_HOST as string,
  },
  headers: {
    'n-token': '342bdbf6864146f59730fbd6eace18f9',
  },
});

export const requestXYZ = createAxios({});

export default createAxios;
