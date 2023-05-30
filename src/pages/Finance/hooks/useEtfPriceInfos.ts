import { useEffect, useState } from 'react';
import type { StockInfo } from '../types';
import { ETF_INFOS } from '../constants';
import { fetchFinanceDatas } from '../services';

const useEtfPriceInfos = (fetchTime: string) => {
  const [etfPriceInfos, setEtfPriceInfos] = useState<StockInfo[]>([]);

  useEffect(() => {
    fetchFinanceDatas(ETF_INFOS.map((info) => info.sCode)).then((resArr) => {
      setEtfPriceInfos(
        resArr.map(({ price }, i) => ({
          ...ETF_INFOS[i],
          price,
        }))
      );
    });
  }, [fetchTime]);

  return etfPriceInfos;
};

export default useEtfPriceInfos;
