import type { ProdDealDateKV } from './types';

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

export const filterDealDates = (
  filterProds: string[],
  prodDealDateKV?: ProdDealDateKV
) => {
  if (typeof prodDealDateKV === 'undefined') {
    return null;
  }
  const result: Record<string, { months: string[]; dealDates: string[] }> = {};

  for (let key in prodDealDateKV) {
    const prod = key.slice(0, 2);
    if (!filterProds.includes(prod)) {
      continue;
    }
    if (!result[prod]) {
      result[prod] = { months: [], dealDates: [] };
    }
    result[prod].months.push(key.slice(-4));
    result[prod].dealDates.push(prodDealDateKV[key]);
  }
  return result;
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
    adjustment = 0.18,
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
