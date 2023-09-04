/*
 * @Author: chenqingyue 
 * @Date: 2023-09-04 16:25:02
 * @LastEditors: chenqingyue 
 * @LastEditTime: 2023-09-04 18:21:41
 * @FilePath: /more-axios/pendingRequest.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { DEFAULT_REPEAT_CACHE_TIME } from './static';

const pendingRequest = new Map();

const getRequestKey = ({ method, url, params, data }) =>
  [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');

const getInitRequestRecord = () => ({ inProgress: true, waiting: true });

const delayRemovePendingRequest = (config) => {
  const requestKey = getRequestKey(config);
  if (!pendingRequest.has(requestKey)) {
    return;
  }

  const requestRecord = pendingRequest.get(requestKey);
  setTimeout(() => {
    if (!requestRecord.inProgress) {
      pendingRequest.delete(requestKey);
    } else {
      Object.assign(requestRecord, { waiting: false });
    }
  }, config.repeatCacheTime || DEFAULT_REPEAT_CACHE_TIME);
};

export const finishPendingRequest = (config) => {
  const requestKey = getRequestKey(config);
  if (!pendingRequest.has(requestKey)) {
    return;
  }

  const requestRecord = pendingRequest.get(requestKey);

  if (!requestRecord.waiting) {
    pendingRequest.delete(requestKey);
  } else {
    Object.assign(requestRecord, { inProgress: false });
  }
};

export const setPendingRequest = (config) => {
  const requestKey = getRequestKey(config);
  const requestRecord = pendingRequest.get(requestKey);

  if (requestRecord && (requestRecord.inProgress || requestRecord.waiting)) {
    return true;
  }

  pendingRequest.set(requestKey, getInitRequestRecord());
  delayRemovePendingRequest(config);

  return false;
};
