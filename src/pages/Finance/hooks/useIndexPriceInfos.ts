import { useEffect, useState } from 'react';
import type { StockInfo } from '../types';
import { INDEX_INFOS } from '../constants';
import { fetchFinanceDatas } from '../services';

const useIndexPriceInfos = (fetchTime: string) => {
  const [stockInfos, setPriceInfos] = useState<StockInfo[]>([]);

  useEffect(() => {
    fetchFinanceDatas(INDEX_INFOS.map((info) => info.sCode)).then((resArr) => {
      setPriceInfos(
        resArr.map(({ price, lastClosePrice }, i) => ({
          ...INDEX_INFOS[i],
          price,
          lastClosePrice
        }))
      );
    });
  }, [fetchTime]);

  return stockInfos;
};

export default useIndexPriceInfos;
