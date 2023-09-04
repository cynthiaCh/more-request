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

  if (requestRecord && requestRecord.inProgress && requestRecord.waiting) {
    return true;
  }

  pendingRequest.set(requestKey, getInitRequestRecord());
  delayRemovePendingRequest(config);

  return false;
};
