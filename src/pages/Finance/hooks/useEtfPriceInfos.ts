import { useEffect, useState } from 'react';
import type { FinanceInfo } from '../types';
import { ETF_INFOS } from '../constants';
import { fetchFinanceDatas } from '../utils';

const useEtfPriceInfos = (fetchTime: string) => {
  const [etfPriceInfos, setEtfPriceInfos] = useState<FinanceInfo[]>([]);

  useEffect(() => {
    fetchFinanceDatas(ETF_INFOS.map((info) => info.opCode)).then((resArr) => {
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
