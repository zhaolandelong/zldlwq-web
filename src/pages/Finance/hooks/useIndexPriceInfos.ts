import { useEffect, useState } from 'react';
import type { FinanceInfo } from '../types';
import { INDEX_INFOS } from '../constants';
import { fetchFinanceDatas } from '../utils';

const useIndexPriceInfos = (fetchTime: string) => {
  const [priceInfos, setPriceInfos] = useState<Required<FinanceInfo>[]>([]);

  useEffect(() => {
    fetchFinanceDatas(INDEX_INFOS.map((info) => info.opCode)).then((resArr) => {
      setPriceInfos(
        resArr.map(({ price }, i) => ({
          ...INDEX_INFOS[i],
          price,
        }))
      );
    });
  }, [fetchTime]);

  return priceInfos;
};

export default useIndexPriceInfos;
