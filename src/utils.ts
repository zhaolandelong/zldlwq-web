import axios from 'axios';
import moment, { type Moment } from 'moment';
import type { ETFPriceInfo } from './types';

export const fetchAvgPrice = (
  code: string,
  startDate: string,
  endDate: string = moment().format('YYYY-MM-DD')
): Promise<number> => {
  return axios
    .get(
      `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${code},month,${moment(
        startDate
      )
        .subtract(1, 'month')
        .format('YYYY-MM-DD')},${endDate},999,qfq`
    )
    .then((res) => res.data.data[code].qfqmonth)
    .then((arr: Array<string[]>) => {
      arr.pop();
      const avgPrice = arr.reduce((a, b) => a + Number(b[2]), 0) / arr.length;
      return Number(avgPrice);
    });
};

export const getDealDate = (date: Moment = moment()): Moment => {
  const firstWend = date.startOf('month').day(3);
  const count = firstWend.date() > 7 ? 4 : 3;
  return firstWend.add(count, 'weeks');
};

export const fetchETFPrice = (codes: string[]): Promise<ETFPriceInfo[]> =>
  axios.get<string>(`https://qt.gtimg.cn/q=${codes.join(',')}`).then((res) =>
    res.data
      .split(';')
      .filter((v) => v.includes('~'))
      .map((str) => {
        const arr = str.split('~');
        return {
          code: arr[2],
          name: arr[1],
          price: Number(arr[3]),
        };
      })
  );

export const getAnualReturnRate = (
  expectedReturnRate: number,
  investMonths: number
): number => {
  if (investMonths <= 12) {
    return expectedReturnRate;
  }
  return Number(((investMonths / 12) * expectedReturnRate).toFixed(4));
};

export const getOptionDealDate = (date: Moment = moment()): Moment => {
  const firstWend = date.startOf('month').day(3);
  const count = firstWend.date() > 7 ? 4 : 3;
  return firstWend.add(count, 'weeks');
};

export const getCount = (amount: number, price: number) => {
  // if (type === OptionType.scaling) {
  //   amount *= this.scalingTimes;
  // }
  const optionCount = Math.floor(amount / price / 10000);
  const etfCount = Math.floor(amount / price / 100 - optionCount * 100) * 100;
  return { optionCount, etfCount };
};
