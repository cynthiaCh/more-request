/*
 * @Author: chenqingyue 
 * @Date: 2023-08-31 15:25:10
 * @LastEditors: chenqingyue 
 * @LastEditTime: 2023-08-31 15:40:02
 * @FilePath: /epec-ui/src/package/eui-axios/encapsulationAxios.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import JSONBig from 'json-bigint';

import { setPendingRequest, finishPendingRequest } from './pendingRequest';
import { SUPPORT_METHOD } from './static';

const encapsulationAxios = (axios) => {
  const JSONBigToString = JSONBig({ storeAsString: true });
  axios.defaults.transformResponse = (data) => {
    try {
      const parseData = JSONBigToString.parse(data);
      if (Object.prototype.toString.call(parseData) === '[object Object]') {
        return { ...parseData };
      }
      return data;
    } catch {
      return data;
    }
  };

  axios.interceptors.request.use((config) => {
    try {
      if (config.preventRepeat && SUPPORT_METHOD.has(config.method.toLowerCase())) {
        const isRepeat = setPendingRequest(config);
        if (isRepeat) {
          return Promise.reject({
            code: 'ERR_REPEAT_REQUEST',
            config,
            message: 'Request is repeated',
            name: 'EuiAxiosError',
            response: {
              status: 499,
              statusText: 'Repeat Request',
            },
          });
        }
      }
    } catch {
      return config;
    }

    return config;
  });

  axios.interceptors.response.use(
    (response) => {
      try {
        if (response.config.preventRepeat) {
          finishPendingRequest(response.config);
        }
      } catch {
        return response;
      }

      return response;
    },
    (error) => {
      try {
        if (error.config.preventRepeat) {
          finishPendingRequest(error.config);
        }
      } catch {
        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );
  return axios;
};

export default encapsulationAxios;
