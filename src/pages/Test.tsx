import jsonp from 'jsonp';
import React, { useEffect } from 'react';

const Test: React.FC = () => {
  useEffect(() => {
    jsonp(
      'https://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionService.getRemainderDay?exchange=null&cate=50ETF&date=2023-06&dpc=1',
      (_err, data) => {
        console.log(data);
      }
    );
  }, []);
  return <h1>Test</h1>;
};

export default Test;
