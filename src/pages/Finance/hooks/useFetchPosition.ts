import { useEffect, useState } from 'react';
import type { ETFPosInfo, InvestBaseInfo, StockInfo } from '../types';
import { fetchAvgPrice, fetchRealInvestment } from '../services';
import moment from 'moment';
import { getAnualReturnRate } from '../utils';

const fetchAndFormatPosData = (
  investInfos: InvestBaseInfo[],
  eftPriceInfos: StockInfo[]
) =>
  Promise.all(
    investInfos.map((info) =>
      Promise.all([
        fetchAvgPrice(info.sCode, info.startDate),
        fetchRealInvestment(info.sCode, info.startDate, info.monthlyAmount),
      ])
    )
  ).then((avgPricesArr) =>
    investInfos.map((info, index) => {
      const investMonths = moment().diff(info.startDate, 'month') + 1;
      const actualReturnRate = getAnualReturnRate(
        info.expectedReturnRate,
        investMonths
      );
      const { price = 0, name = info.sCode } =
        eftPriceInfos.find((item) => item.sCode === info.sCode) ?? {};
      const [avgCost, { realInvestment, realCount }] = avgPricesArr[index];
      const additionPrice =
        info.firstAdditionPrice * (1 - 0.1 * info.additionTimes);
      const result: ETFPosInfo = {
        ...info,
        name,
        investMonths,
        avgCost,
        realInvestment,
        realCount,
        actualReturnRate,
        price,
        additionPrice,
      };
      return result;
    })
  );

const useFetchPosition = (
  investInfos: InvestBaseInfo[],
  eftPriceInfos: StockInfo[]
) => {
  const [dataSource, setDataSource] = useState<ETFPosInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAndFormatPosData(investInfos, eftPriceInfos)
      .then(setDataSource)
      .finally(() => setLoading(false));
  }, [investInfos, eftPriceInfos]);

  return {
    loading,
    dataSource,
  };
};

export default useFetchPosition;
