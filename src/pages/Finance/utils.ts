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

export const getEtfOpCount = (amount: number, price: number) => {
  const optionCount = Math.floor(amount / price / 10000);
  const etfCount = Math.floor(amount / price / 100 - optionCount * 100) * 100;
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

export const calculateEtfOpMargin = (
  settlePrice: number,
  lastClosePrice: number,
  strikePrice: number,
  type: 'P' | 'C'
): number => {
  let premium;
  if (type === 'C') {
    premium =
      settlePrice +
      Math.max(
        0.12 * lastClosePrice - Math.max(strikePrice - lastClosePrice, 0),
        0.07 * lastClosePrice
      );
  } else {
    premium = Math.min(
      settlePrice +
        Math.max(
          0.12 * lastClosePrice - Math.max(lastClosePrice - strikePrice, 0),
          0.07 * strikePrice
        ),
      strikePrice
    );
  }

  return premium * 10000;
};
