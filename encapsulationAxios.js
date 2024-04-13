/*
 * @Author: chenqingyue 
 * @Date: 2023-08-31 15:25:10
 * @LastEditors: chenqingyue 
 * @LastEditTime: 2023-10-19 19:10:47
 * @FilePath: /epec-ui/src/package/eui-axios/encapsulationAxios.js
 * @Description: 这个模块提供了对 axios 的增强封装，包括对大整数的处理和防止重复请求的功能。
 */

// 引入 JSONBig 库以安全地处理 JavaScript 中的大数字
import JSONBig from 'json-bigint';

// 引入处理重复请求的逻辑
import { setPendingRequest, finishPendingRequest } from './pendingRequest';
// 引入支持的 HTTP 方法集合
import { SUPPORT_METHOD } from './static';

/**
 * 对 axios 实例进行封装，增加大数字处理和重复请求拦截功能
 * @param {Object} axios - 待封装的 axios 实例
 * @return {Object} - 封装后的 axios 实例
 */
const encapsulationAxios = (axios) => {
  // 配置 JSONBig 来存储大整数为字符串
  const JSONBigToString = JSONBig({ storeAsString: true });

  // 设置 axios 的 transformResponse，以使用 JSONBig 安全地解析响应数据
  axios.defaults.transformResponse = (data) => {
    try {
      return JSONBigToString.parse(data);
    } catch {
      // 如果解析失败，返回原始数据
      return data;
    }
  };

  // 请求拦截器，用于防止重复请求
  axios.interceptors.request.use((config) => {
    try {
      // 检查配置中的 preventRepeat 标志和请求方法是否需要防重复处理
      if (config.preventRepeat && SUPPORT_METHOD.has(config.method.toLowerCase())) {
        const requestPromise = setPendingRequest(config);
        if (requestPromise) {
          // 如果是重复请求，返回自定义的错误
          return Promise.reject({
            code: 'ERR_REPEAT_REQUEST',
            config,
            message: 'Request is repeated',
            name: 'EuiAxiosError',
            useExistingPromise: true,
            requestPromise,
            response: {
              status: 499,
              statusText: 'Repeat Request',
            },
          });
        }
      }
    } catch {
      // 异常安全，出错时返回原始配置
      return config;
    }

    return config;
  });

  // 响应拦截器，用于清理完成的请求记录
  axios.interceptors.response.use(
    (response) => {
      try {
        // 如果响应来自一个需要防重复处理的请求，清理其记录
        if (response.config.preventRepeat) {
          finishPendingRequest(response.config);
        }
      } catch {
        // 异常安全，出错时返回原始响应
        return response;
      }

      return response;
    },
    (error) => {
      try {
        // 请求失败处理重复请求的映射
        if (error.useExistingPromise) {
          // 如果错误是因为重复请求引起的，返回原有的 Promise
          return error.requestPromise;
        }
        // 对于请求出错的情况，同样清理记录
        if (error.config.preventRepeat) {
          finishPendingRequest(error.config);
        }
      } catch {
        // 异常安全，出错时继续抛出错误
        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );

  return axios; // 返回封装后的 axios 实例
};

export default encapsulationAxios;
