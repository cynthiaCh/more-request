/*
 * @Author: chenqingyue 
 * @Date: 2023-08-23 10:52:15
 * @LastEditors: chenqingyue 
 * @LastEditTime: 2023-08-23 16:46:52
 * @FilePath: /more-axios/useRequest.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
function useRequest(requestFn, options = {}) {
    let loading = false;
    let err = '';

    const run = async (...params) => {
        loading = true;
        let res;
        try {
            res = await requestFn({
                ...params, 
                ...options
            });
            loading = false;
        } catch (error) {
            loading = false;
            err = error;
        }
        return res;
    }

    return {
        loading,
        err,
        run,
    };
}

export {useRequest}