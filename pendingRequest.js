/**
 * 模块说明：用于追踪和控制重复的HTTP请求
 * @Author: chenqingyue
 * @Date: 2023-09-04 16:25:02
 * @LastEditors: chenqingyue
 * @LastEditTime: 2023-09-21 16:15:24
 * @FilePath: /more-axios/pendingRequest.js
 * @Description: 用于防止重复发送相同的HTTP请求，包括延迟删除和状态管理
 */

import axios from 'axios';

import { DEFAULT_REPEAT_CACHE_TIME } from './static';
const axiosInMap = axios.create();
// 使用 Map 数据结构存储正在进行的请求
const requestsMap = new Map();

// 辅助函数，用于格式化请求中的数据部分，确保作为键值的一部分是字符串类型
const formatString = (data) => (typeof data === 'string' ? data : JSON.stringify(data));

// 根据请求的配置生成一个唯一的键，用于标识请求
const getRequestKey = ({ method, url, params, data }) =>
  [method, url, formatString(params), formatString(data)].join('&');

// 获取初始化请求记录对象，标记请求为正在进行和等待状态
const getInitRequestRecord = (requestPromise) => ({ 
  inProgress: true, 
  waiting: true,
  requestPromise 
});

/**
 * 延迟删除请求记录的函数。
 * 如果请求已完成，则立即删除；如果请求未完成，标记为非等待状态。
 * @param {Object} config - 请求的配置对象
 */
const delayRemovePendingRequest = (config) => {
  const requestKey = getRequestKey(config);
  if (!requestsMap.has(requestKey)) {
    return;
  }

  const requestRecord = requestsMap.get(requestKey);

  // 设置延时删除，时间由 config.repeatCacheTime 或默认值决定
  setTimeout(() => {
    if (!requestRecord.inProgress) {
      requestsMap.delete(requestKey);
    } else {
      Object.assign(requestRecord, { waiting: false });
    }
  }, config.repeatCacheTime || DEFAULT_REPEAT_CACHE_TIME);
};

/**
 * 完成请求时调用的函数，用于清理请求记录。
 * 如果请求在等待状态，仅标记为非进行中；如果不在等待状态，则删除记录。
 * @param {Object} config - 请求的配置对象
 */
export const finishPendingRequest = (response, ev, flagName) => {
  const requestKey = getRequestKey(response.config);
  if (!requestsMap.has(requestKey)) {
    return;
  }

  const requestRecord = requestsMap.get(requestKey);

  if (!requestRecord.waiting) {
    ev.emit(requestKey, response, flagName);
    // 如果记录显示请求不在等待（可能已处理完毕或无需进一步等待），则从映射中删除该记录，清理资源。
    requestsMap.delete(requestKey);
  } else {
    Object.assign(requestRecord, { inProgress: false });
  }
};

/**
 * 在发送请求前调用，用于设置请求记录。
 * 如果记录已存在，返回 true 表示请求已经在进行中；
 * 如果不存在，创建新的记录并返回 false 表示请求未在进行中。
 * @param {Object} config - 请求的配置对象
 * @returns {boolean} - 请求是否已存在
 */
export const setPendingRequest = (config) => {
  const requestKey = getRequestKey(config);
  const requestRecord = requestsMap.get(requestKey);

  if (requestRecord) {
    return requestKey; // 请求已存在，表示重复请求
  }

  // 创建并记录新的请求状态
  // 如果请求不存在，将其加入映射并记录其 Promise
  const requestPromise = () => axiosInMap(config);
  requestsMap.set(requestKey, getInitRequestRecord(requestPromise));

  // 设置延时，以在必要时移除请求记录
  delayRemovePendingRequest(config);

  return false; // 请求不存在，可以继续执行
};
