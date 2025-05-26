const axios = require("axios");
const cheerio = require("cheerio");

async function extractTextContent(url, selector) {
  try {
    // 发送HTTP请求获取网页内容
    console.log(`正在获取网页: ${url}`);
    const response = await axios.get(url);

    // 使用cheerio加载HTML
    const $ = cheerio.load(response.data);

    // 使用CSS选择器查找元素
    const elements = $(selector);//解析元素

    if (elements.length === 0) {
      console.log(`没有找到匹配选择器 "${selector}" 的元素`);
      return;
    }

    console.log(`找到 ${elements.length} 个匹配的元素:`);
    console.log("-----------------------------------");

    // 遍历所有匹配的元素并打印文本内容
    elements.each((index, element) => {
      const text = $(element).text().trim();
      if (text) {
        console.log(`元素 ${index + 1}: ${text}`);
      } else {
        console.log(`元素 ${index + 1}: [空内容]`);
      }
    });
  } catch (error) {
    if (error.response) {
      console.error(
        `HTTP错误: ${error.response.status} - ${error.response.statusText}`
      );
    } else if (error.request) {
      console.error("网络错误: 无法连接到指定URL");
    } else {
      console.error("错误:", error.message);
    }
  }
}

function parseArguments() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("使用方法: node web-scraper-cli.js <URL> <CSS选择器>");
    console.log("");
    console.log("示例:");
    console.log("  node web-scraper-cli.js https://example.com h1");
    console.log(
      '  node web-scraper-cli.js https://github.com ".js-site-search-focus"'
    );
    console.log(
      '  node web-scraper-cli.js https://news.ycombinator.com ".storylink"'
    );
    process.exit(1);
  }

  const url = args[0];
  const selector = args[1];

  // 简单的URL验证
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.error("错误: URL必须以 http:// 或 https:// 开头");
    process.exit(1);
  }

  return { url, selector };
}

async function main() {
  const { url, selector } = parseArguments();

  console.log(`URL: ${url}`);
  console.log(`CSS选择器: ${selector}`);
  console.log("");

  await extractTextContent(url, selector);//异步程序，网络请求的同时不阻塞主线程
}

// 运行程序
main().catch((error) => {
  console.error("程序执行出错:", error.message);
  process.exit(1);
});
