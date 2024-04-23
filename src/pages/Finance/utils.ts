import moment from 'moment';
import type { ETFPosInfo } from './types';

export const getAnualReturnRate = (
  expectedReturnRate: number,
  investMonths: number
): number => {
  if (investMonths <= 12) {
    return expectedReturnRate;
  }
  return (investMonths / 12) * expectedReturnRate;
};

export const getEtfOpCount = (
  amount: number,
  price: number,
  baseEtfCount = 0
) => {
  const ETF_OP_HAND_COUNT = 10000;
  let optionCount = Math.floor(amount / price / ETF_OP_HAND_COUNT);
  let etfCount = Math.floor(amount / price / 100 - optionCount * 100) * 100;
  if (etfCount + baseEtfCount > ETF_OP_HAND_COUNT) {
    optionCount += 1;
    etfCount -= ETF_OP_HAND_COUNT;
  }
  return { optionCount, etfCount };
};

interface MarginParams {
  settlePrice: number; // 昨结算价
  lastClosePrice: number; // 昨收盘价
  strikePrice: number; // 行权价
  guarantee?: number; // 保障系数
  adjustment?: number; // 调整系数
  multiple?: number; // 乘数
  type: 'P' | 'C';
}

export const calculateEtfOpMargin = (params: MarginParams): number => {
  const {
    settlePrice,
    lastClosePrice,
    strikePrice,
    guarantee = 0.07,
    adjustment = 0.12,
    multiple = 10000,
    type,
  } = params;
  if (type === 'C') {
    return (
      (settlePrice +
        Math.max(
          adjustment * lastClosePrice -
            Math.max(strikePrice - lastClosePrice, 0),
          guarantee * lastClosePrice
        )) *
      multiple
    );
  }
  return (
    Math.min(
      settlePrice +
        Math.max(
          adjustment * lastClosePrice -
            Math.max(lastClosePrice - strikePrice, 0),
          guarantee * strikePrice
        ),
      strikePrice
    ) * multiple
  );
};

// - 参考保证金 = [昨结算价 + Max(调整系数 * 昨收盘价 - 看涨期权虚值,
//   保障系数 * 调整系数 * 昨收盘价)] * 10000
//   - 看涨期权虚值 = Max(行权价 - 昨收盘价, 0)
//   - 参考保证金 = [昨结算价 + Max(调整系数 * 昨收盘价 - 看跌期权虚值,
//   保障系数 * 调整系数 * 行权价)] * 10000
//   - 看跌期权虚值 = Max(昨收盘价 - 行权价, 0)
//   - 调整系数 = 10%，保障系数 = 0.5

export const calculateIndexOpMargin = (params: MarginParams): number => {
  const {
    settlePrice,
    lastClosePrice,
    strikePrice,
    guarantee = 0.5,
    adjustment = 0.13,
    multiple = 100,
    type,
  } = params;
  if (type === 'C') {
    return (
      (settlePrice +
        Math.max(
          adjustment * lastClosePrice -
            Math.max(strikePrice - lastClosePrice, 0),
          guarantee * adjustment * lastClosePrice
        )) *
      multiple
    );
  }
  return (
    (settlePrice +
      Math.max(
        adjustment * lastClosePrice - Math.max(lastClosePrice - strikePrice, 0),
        guarantee * adjustment * strikePrice
      )) *
    multiple
  );
};

export const getRealInvestment = (posInfo: ETFPosInfo) => {
  const {
    realCount,
    realInvestment,
    firstAdditionPrice,
    additionTimes,
    monthlyAmount,
    additionMutiple,
  } = posInfo;
  let count = realCount;
  let investMent = realInvestment;
  for (let i = 0, addPrice, addCount; i < additionTimes; i++) {
    addPrice = firstAdditionPrice * (1 - 0.1 * i);
    addCount =
      Math.floor((monthlyAmount * additionMutiple) / addPrice / 100) * 100;
    count += addCount;
    investMent += addCount * addPrice;
  }
  return {
    investMent,
    count,
  };
};

// 获取某几月第n个星期day
export const getNthDayOfMonths = (yearMonths: string[], n = 3, day = 5) =>
  yearMonths.map((ym) => {
    const firstDayOfMonth = moment(ym);
    let diff = day - 7 - firstDayOfMonth.day();
    if (firstDayOfMonth.day() > day) {
      diff += 7;
    }
    return firstDayOfMonth.add(7 * n + diff, 'days').format('YYYY-MM-DD');
  });

// 获取期权交易月份
export const getOpDealMonths = (startYearMonth?: string) => {
  const today = moment(startYearMonth);
  const monthArr = [
    today.format('YYYYMM'),
    today.add(1, 'M').format('YYYYMM'),
    today.add(1, 'M').format('YYYYMM'),
  ];
  let len = monthArr.length;
  let i = 1;
  while (monthArr.length < len + 1) {
    if (i * 3 > today.month() + 1) {
      monthArr.push(today.add(i * 3 - today.month() - 1, 'M').format('YYYYMM'));
    }
    i += 1;
  }
  return monthArr;
};

export enum TradeMonthType {
  ETFOp,
  IndexOp,
  IndexFeat,
}
// ETF 期权、股指期权、股指期货交易月份及交割日
export const getDealMonthsAndDates = (
  type = TradeMonthType.ETFOp,
  startYearMonth?: string
) => {
  let currMonth = moment(startYearMonth);
  let nextMonthCount = 1;
  let nextQuaterCount = 2;
  let dealDateWeek = 4;
  let dealDateDay = 3;
  if (type === TradeMonthType.IndexOp) {
    nextMonthCount = 2;
    nextQuaterCount = 3;
    dealDateWeek = 3;
    dealDateDay = 5;
  }
  if (type === TradeMonthType.IndexFeat) {
    dealDateWeek = 3;
    dealDateDay = 5;
  }
  if (startYearMonth === undefined) {
    const [currMonthDealDate] = getNthDayOfMonths(
      [currMonth.format('YYYY-MM')],
      dealDateWeek,
      dealDateDay
    );
    if (moment().isSameOrAfter(moment(currMonthDealDate).startOf('D'))) {
      currMonth.add(1, 'M');
    }
  }
  const monthSet = new Set([currMonth.format('YYYYMM')]);
  for (let i = 0; i < nextMonthCount; i++) {
    monthSet.add(currMonth.add(1, 'M').format('YYYYMM'));
  }
  let currQuarterEnd = currMonth.clone().endOf('quarter');
  if (currMonth.month() !== currQuarterEnd.month()) {
    currQuarterEnd.add(-1, 'Q');
  }
  for (let i = 0; i < nextQuaterCount; i++) {
    monthSet.add(currQuarterEnd.add(1, 'Q').format('YYYYMM'));
  }
  const months = Array.from(monthSet);
  return {
    type,
    months,
    dealDates: getNthDayOfMonths(months, dealDateWeek, dealDateDay),
  };
};
