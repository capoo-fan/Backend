# Web Scraper CLI

一个简单的命令行工具，用于从网页中提取特定元素的文本内容。

## 功能特点

- 通过URL和CSS选择器提取网页元素文本
- 支持多个匹配元素的批量提取
- 完善的错误处理机制
- 简单易用的命令行界面

## 安装依赖

```bash
npm install
```

## 使用方法

```bash
node web-scraper.js <URL> <CSS选择器>
```

## 使用示例

```bash
# 提取网页标题
node web-scraper.js https://example.com h1

# 提取所有链接文本
node web-scraper.js https://github.com a

# 提取特定class的元素
node web-scraper.js https://news.ycombinator.com .storylink

# 提取段落文本
node web-scraper.js https://example.com p
```

## CSS选择器示例

- `h1` - 选择所有h1标题
- `.class-name` - 选择特定class的元素
- `#id-name` - 选择特定id的元素
- `div p` - 选择div内的所有p元素
- `a[href]` - 选择所有包含href属性的链接

## 错误处理

程序会处理以下常见错误：
- 网络连接错误
- HTTP状态错误
- 无效的URL格式
- 找不到匹配的元素

## 技术栈

- Node.js
- Axios (HTTP客户端)
- Cheerio (服务端jQuery实现)
