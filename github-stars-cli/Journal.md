# github 查询星标学习笔记

``` javascript
 const url = `${GITHUB_API_URL}?q=${encodeURIComponent(
    query
  )}&sort=stars&order=desc`;
```
sort是按照星标数排序，order是升序还是降序

- axios 库 axios.get 获取网站的输出

```javascript
const response = await axios.get(url);
```

responsea 将会返回.json 格式，下面是大致结构 .data 变化为 javascript 对象，然后提取其中的 items

```
{
  "total_count": 123,        // 符合条件的总结果数
  "incomplete_results": false, // 是否返回了不完整结果
  "items": [                 // 仓库项目列表
    {
      "id": 12345678,
      "name": "project-name",
      "full_name": "owner/project-name",
      "owner": { /* 所有者信息 */ },
      "html_url": "https://github.com/owner/project-name",
      "description": "项目描述",
      "stargazers_count": 5000,  // 星标数
    },
  ]
}
```

用 url 提取对象后，可以先查看其返回的对象

- try 语法，比如在没有网络连接，无法收到返回结果 的时候，就会抛出一个异常。
- process.argv 是一个全局属性，用于读取用户的输入
  * 索引 0: Node.js 解释器的完整路径
  * 索引 1: 正在执行的 JavaScript 文件的路径
  * 索引 2 及以后: 用户通过命令行传入的参数
然后用slice函数切割，如果没有输入 args将为空，||将给一个默认输入。

