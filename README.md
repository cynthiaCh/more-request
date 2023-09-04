<!--
 * @Author: chenqingyue 
 * @Date: 2023-09-04 16:25:02
 * @LastEditors: chenqingyue 
 * @LastEditTime: 2023-09-04 16:53:20
 * @FilePath: /more-axios/README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
## 用法
### 直接引入，默认实现防抖节流

```js
import 'more-request'
```


### 引入实例

```js
import axios from 'more-request/instance';
```

扩展`axios`的`config`参数

| 参数              | 默认值 | 说明                    |
| ----------------- | ------ | ----------------------- |
| `preventRepeat`   | `true` | 打开/关闭防重复提交功能 |
| `repeatCacheTime` | 500    | 防重提交缓存请求时间    |


> 仅对`post`请求生效
