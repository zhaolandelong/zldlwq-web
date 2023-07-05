const http = require('http'); // Import Node.js core module
const https = require('https');
const url = require('url');
const { parseStringPromise } = require('xml2js');

const httpFetch = (options, type) =>
  new Promise((resolve, reject) => {
    (type === 'https' ? https : http)
      .get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      })
      .on('error', reject);
  });

const getCookies = (options, type) =>
  new Promise((resolve, reject) => {
    (type === 'https' ? https : http)
      .get(options, (res) => {
        const cookies = res.headers['set-cookie'] || [];
        resolve(cookies.map((ck) => ck.split(';')[0]).join('; '));
      })
      .on('error', reject);
  });

let xueqiuCookies = '';

const xueqiuFetch = async (options) => {
  const { headers, ...rest } = options;
  const fetchOptions = {
    ...rest,
    headers: {
      ...headers,
      Cookie: xueqiuCookies,
    },
  };
  let json = await httpFetch(fetchOptions, 'https');
  if (json.includes('"error_code":"400016"')) {
    xueqiuCookies = await getCookies(
      { hostname: 'xueqiu.com', path: '/hq' },
      'https'
    );
    json = await xueqiuFetch(options);
  }
  return json;
};

const server = http.createServer(async function (req, res) {
  //create web server
  const { query, pathname } = url.parse(req.url, true);
  try {
    if (pathname.includes('/sina')) {
      res.end(
        await httpFetch(
          {
            hostname: 'hq.sinajs.cn',
            path: `/list=${query.query}`,
            headers: {
              Host: 'hq.sinajs.cn',
              Referer: 'https://stock.finance.sina.com.cn/',
            },
          },
          'https'
        )
      );
    } else if (pathname.includes('/cffex')) {
      const xmlStr = await httpFetch({
        hostname: 'www.cffex.com.cn',
        path: `/cp/index_6719.xml?id=${query.id}`,
      });
      const json = await parseStringPromise(xmlStr);
      const result = {};
      for (
        let i = 0, info, prod;
        i < json.TIP.T_INSTRUMENTPROPERTY.length;
        i++
      ) {
        info = json.TIP.T_INSTRUMENTPROPERTY[i];
        prod = info.INSTRUMENTID[0].slice(0, 6); // 'MO2308-C-6400'
        if (!result[prod]) {
          result[prod] = info.EXPIREDATE[0]; // '20230818'
        }
      }
      res.end(JSON.stringify(result));
    } else if (pathname.includes('/xueqiu')) {
      // https://xueqiu.com/hq#fundtype=18&pfundtype=1&industry=5_7&firstName=5
      const path = `${pathname.split('/xueqiu')[1]}?${new URLSearchParams(
        query
      ).toString()}`;
      const json = await xueqiuFetch({
        hostname: 'stock.xueqiu.com',
        path,
      });

      res.setHeader('Content-Type', 'application/json;charset=UTF-8');
      res.end(json);
    }
  } catch (e) {
    console.error('error', e);
    res.end(e);
  }
});

server.listen(8000, '127.0.0.1'); //6 - listen for any incoming requests

console.log('Node.js web server at port 8000 is running..');
