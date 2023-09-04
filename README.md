## 用法
### 直接引入，默认实现防抖节流

```js
import 'eui-axios'
```


### 引入实例

```js
import axios from 'eui-axios/instance';
```

扩展`axios`的`config`参数

| 参数              | 默认值 | 说明                    |
| ----------------- | ------ | ----------------------- |
| `preventRepeat`   | `true` | 打开/关闭防重复提交功能 |
| `repeatCacheTime` | 500    | 防重提交缓存请求时间    |


> 仅对`post`请求生效
