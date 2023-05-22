# ZLDLWQ-WEB

## 获取期权数据
用华为云的「函数工作流 FunctionGraph」实现的新浪财经接口转发，代码如下：

```js
const http = require('http'); // Import Node.js core module
const https = require('https');
const url = require('url');

function fetchFinance(query) {
    const options = {
        hostname: 'hq.sinajs.cn',
        path: `/list=${query}`,
        headers: {
            Host: 'hq.sinajs.cn',
            Referer: 'https://stock.finance.sina.com.cn/',
        },
    };

    return new Promise((resolve, reject) => {
        https.get(options, res => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', err => {
            reject(err);
        });
    });
}

var server = http.createServer(function (req, res) {   //create web server
    const { query } = url.parse(req.url, true);
    const { query: queryValue } = query;
    fetchFinance(queryValue).then(data => {
        res.end(data)
    });
});

server.listen(8000, '127.0.0.1'); //6 - listen for any incoming requests

console.log('Node.js web server at port 8000 is running..')
```