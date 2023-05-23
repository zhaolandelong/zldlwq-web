# ZLDLWQ-WEB

## 获取 ETF 期权数据
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

## 获取股指期权数据
https://stock.finance.sina.com.cn/futures/view/optionsCffexDP.php

jsonp

https://stock.finance.sina.com.cn/futures/api/openapi.php/OptionService.getOptionData?callback=jQuery17205710995844320619_1684820199735&type=futures&product=io&exchange=cffex&pinzhong=io2306

TODO: 获取指数数据
https://finance.sina.com.cn/realstock/company/sh000300/nc.shtml

https://hq.sinajs.cn/etag.php?_=1684821983640&list=sh000300
https://hq.sinajs.cn/rn=1684821999211&list=s_sh000016,s_sh000852,s_sh000905,s_sz159755,s_sz159941,s_sz159865,s_sh000009,s_sz159981,s_sh000827


时间价值 = 期权价 - 内涵价值

实值期权内涵价 = 指数 - 行权价
虚值期权内涵价 = 0

看涨（认购）内涵价 = 指数 > 行权价 ? (指数 - 行权价) : 0;
看跌（认沽）内涵价 = 行权价 > 指数 ? (行权价 - 指数) : 0;

股指期货：

https://finance.sina.com.cn/futures/quotes/IF2306.shtml

https://hq.sinajs.cn/?_=1684821527374/&list=nf_IF2306,nf_IF0,nf_SA2309,nf_FG2309,nf_MA2309,nf_TA2309,nf_RB2310,nf_M2309,nf_RM2309,nf_P2309,nf_Y2309,nf_FU2309,nf_V2309,nf_I2309,nf_SR2307

