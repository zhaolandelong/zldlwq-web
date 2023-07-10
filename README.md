# ZLDLWQ-WEB

## 获取 ETF 期权数据
用华为云的「函数工作流 FunctionGraph」实现的新浪财经接口转发，代码见 `faas.js`。

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

## 华泰期货
（2）股指期权

（每手）股指看涨期权卖方保证金=（合约当日结算价*合约乘数）+max（标的指数当日收盘价*合约乘数*合约保证金调整系数-虚值额，最低保障系数*标的指数当日收盘价*合约乘数*合约保证金调整系数）

股指看涨期权虚值额=max（（行权价格-标的指数当日收盘价）*合约乘数，0）

（每手）股指看跌期权卖方保证金=（合约当日结算价*合约乘数）+max（标的指数当日收盘价*合约乘数*合约保证金调整系数-虚值额，最低保障系数*合约行权价格*合约乘数*合约保证金调整系数）

股指看跌期权虚值额=max（（标的指数当日收盘价-行权价格）*合约乘数，0）

其中，股指期权合约的保证金调整系数、最低保障系数以当日公司网站公告为准。

中证1000股指期权各合约的保证金调整系数为18%，最低保障系数为0.5。
https://www.htfc.com/main/a/20220721/80142148.shtml
沪深300股指期权合约的保证金调整系数为13%，最低保障系数为0.5。
https://www.htfc.com/main/a/20191219/80109245.shtml
上证50股指期权各合约的保证金调整系数为15%，最低保障系数为0.5
https://www.htfc.com/main/a/20221215/80146463.shtml

## 期权数据2

http://www.cffex.com.cn/hs300/
http://www.cffex.com.cn/quote_IF.txt
http://www.cffex.com.cn/yshqtz/hqtym/quoteDatas/IF2307_price.txt?t=1688955200022

http://58.32.205.2/rtj/

优先看这个：
http://quote.eastmoney.com/gzqh/IF2307.html
http://futsseapi.eastmoney.com/static/220_IF2307_qt