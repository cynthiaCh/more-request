/*
 * @Author: chenqingyue 
 * @Date: 2023-08-18 18:53:01
 * @LastEditors: chenqingyue 
 * @LastEditTime: 2023-08-23 17:00:02
 * @FilePath: /myGitee/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios'
const JSONBig = require('./parse.js');

axios.defaults.timeout = 60000;
axios.defaults.transformResponse = function (data) {
    try {
        const bigData = JSONBig()(data);
        return bigData;
    } catch (err) {
        return data;
    }
};

const pending = []; //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const findPending = (url, params) => {
    return pending.find((item, i) => {
        if(!item){
            return false;
        }
        //判断当前请求数组中是否存在相同请求地址的接口
        if (url.indexOf(item.url)>-1  && JSON.stringify(item.data) === JSON.stringify(params)) {
            if (Date.now() - item.previous > 500 && !item.loading) {
                pending.splice(i, 1); //把这条记录从数组中移除
                return false;
            } else {
                return true;
            }
        }
    })
};

const setPending = (url, params) => {
    pending.forEach((item, i) => {
        if (!url) {
            item.loading = false;
        }
        //判断当前请求数组中是否存在相同请求地址的接口
        if (item.url === url && JSON.stringify(item.data) === JSON.stringify(params)) {
            item.loading = false;
        }
    })
};

/**
 * 设置请求拦截器
 */
axios.interceptors.request.use(
    c => {
        const { url, data } = c;

        const cancelR = findPending(url, data);
        if (cancelR) {
            return Promise.reject('节流处理中，稍后再试');
        };

        pending.push({ url, data, previous: Date.now(),loading: true });
        return c;
    },
    error => {
        return Promise.reject(error);
    }
)

/**
 * 设置响应拦截器
 */
axios.interceptors.response.use(
    response => {
        const paramsNew = response.config;
        setPending(paramsNew.url, paramsNew.data);
        return response;
    },
    error => {
        setPending();
        return Promise.reject(error);
    }
)

export {pending}