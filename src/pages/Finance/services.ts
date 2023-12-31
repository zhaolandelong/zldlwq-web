import moment from 'moment';
import type {
  DealDate,
  StockInfo,
  IndexOpNestData,
  IndexOpPnCData,
  EtfOpNestData,
  EtfOpPnCData,
} from './types';
import { jsonpPromise, axiosGet } from '../../request';
import { fetchSinaFinance } from '../../services';

export const fetchEtfMonthK = (
  sCode: string,
  startDate: string,
  endDate: string = moment().format('YYYY-MM-DD')
): Promise<{ month: string; open: number; close: number }[]> =>
  axiosGet(
    `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${sCode},month,${moment(
      startDate
    ).format('YYYY-MM-DD')},${endDate},999,qfq`,
    true
  ).then((res) =>
    res.data[sCode].qfqmonth.map((x: string[]) => ({
      month: x[0],
      open: Number(x[1]),
      close: Number(x[2]),
    }))
  );

export const fetchAvgPrice = (
  sCode: string,
  startDate: string,
  endDate: string = moment().format('YYYY-MM-DD')
): Promise<number> =>
  fetchEtfMonthK(
    sCode,
    moment(startDate).subtract(1, 'month').format('YYYY-MM-DD'),
    endDate
  ).then((arr) => {
    arr.pop();
    return arr.reduce((a, b) => a + b.close, 0) / arr.length;
  });

export const fetchRealInvestment = (
  sCode: string,
  startDate: string,
  amount: number = 25000,
  endDate: string = moment().format('YYYY-MM-DD')
) =>
  fetchEtfMonthK(sCode, startDate, endDate).then((arr) => {
    let _count;
    let count = 0;
    let sum = 0;
    arr.forEach(({ open }) => {
      _count = Math.floor(amount / open / 100) * 100;
      count += _count;
      sum += _count * open;
    });
    return {
      realInvestment: sum,
      realCount: count,
    };
  });

/**
 *
 * @param date '2023-06'
 */
export const fetchOpDealDate = (
  date: string,
  cate: string = '300ETF'
): Promise<DealDate> =>
  jsonpPromise(
    `https://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionService.getRemainderDay?exchange=null&cate=${cate}&date=${date}&dpc=1`,
    true
  ).then((res: any) => {
    const { expireDay, remainderDays } = res?.result?.data ?? {};
    if (expireDay === null) {
      return fetchOpDealDate(moment(date).add(1, 'month').format('YYYY-MM'));
    }
    return {
      expireDay,
      remainderDays,
    };
  });

export const fetchFinanceDatas = (
  opCodes: string[]
): Promise<Pick<StockInfo, 'code' | 'price' | 'lastClosePrice'>[]> =>
  axiosGet(`https://qt.gtimg.cn/q=${opCodes.join(',')}`).then((res: string) =>
    res
      .split(';')
      .filter((v) => v.includes('~'))
      .map((str) => {
        const arr = str.split('~');
        return {
          code: arr[2],
          price: Number(arr[3]),
          lastClosePrice: Number(arr[4]),
        };
      })
  );

const formatOpDatas = (data: string) =>
  data.match(/"(.*?)"/g)?.map((x) => {
    const arr = x.replace(/"/g, '').split(',');
    /**
     * var hq_str_CON_OP_代码=“买量(0)，买价，最新价，卖价，卖量，持仓量，涨幅，行权价，昨收价，开盘价，涨停价，跌停价(11), 
      申卖 价五，申卖量五，申卖价四，申卖量四，申卖价三，申卖量三，申卖价二，申卖量二，申卖价一，申卖量一，申买价一，
      申买量一 ，申买价二，申买量二，申买价三，申买量三，申买价四，申买量四，申买价五，申买量五，行情时间，主力合约标识，状态码， 
      标的证券类型，标的股票，期权合约简称，振幅(38)，最高价，最低价，成交量，成交额，分红调整标志，昨结算价，认购认沽标志，
      到期日，剩余天数，虚实值标志，内在价值，时间价值
      */
    const result: EtfOpNestData = {
      currPrice: Number(arr[2]),
      strikePrice: Number(arr[7]),
      lastClosePrice: Number(arr[8]),
      settlePrice: Number(arr[44]),
      PorC: arr[45] as EtfOpNestData['PorC'],
      dealDate: arr[46],
      remainDays: Number(arr[47]),
      innerValue: Number(arr[49]),
      timeValue: Number(arr[50]),
    };
    return result;
  }) ?? [];

const opQueryCache: Record<
  string,
  {
    opUpQuery: string;
    opDownQuery: string;
  }
> = {};

const fetchEtfOpByMonth = async (payload: {
  code: string;
  yearMonth: string;
}) => {
  const { code, yearMonth } = payload;
  const mark = code + yearMonth;
  const opQueryString = await fetchSinaFinance(
    `OP_UP_${mark},OP_DOWN_${mark}`,
    true
  );
  const [opUpQuery, opDownQuery] = opQueryString
    .match(/"(.*?)"/g)
    .map((x: string) => x.replace(/"/g, ''));
  opQueryCache[mark] = {
    opUpQuery,
    opDownQuery,
  };
  const [upRes, downRes] = await Promise.all([
    fetchSinaFinance(opUpQuery),
    fetchSinaFinance(opDownQuery),
  ]);

  return {
    opUpDatas: formatOpDatas(upRes),
    opDownDatas: formatOpDatas(downRes),
  };
};

// http://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionService.getStockName?exchange=%E6%B7%B1%E4%BA%A4%E6%89%80&cate=&date=&dpc=1
// https://stock.finance.sina.com.cn/option/quotes.html
export const fetchOpMonths = () =>
  jsonpPromise(
    'http://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionService.getStockName',
    true
  ).then((res: any) =>
    Array.from<string>(new Set(res?.result?.data?.contractMonth)).map((val) =>
      val.replace(/-/g, '').slice(-4)
    )
  );

const etfOpCodePrimaryIndexCache: {
  code: string;
  month: string;
  upIndex: number;
  downIndex: number;
  price: number;
}[] = [];

const setEtfOpCodePrimaryIndexCache = (
  data: (typeof etfOpCodePrimaryIndexCache)[0]
) => {
  if (
    etfOpCodePrimaryIndexCache.findIndex(
      (x) =>
        x.code === data.code && x.month === data.month && x.price === data.price
    ) === -1
  ) {
    etfOpCodePrimaryIndexCache.push(data);
  }
};

const getEtfOpCodePrimaryIndexCache = (
  code: string,
  month: string,
  price: number
) =>
  etfOpCodePrimaryIndexCache.find(
    (x) => x.code === code && x.month === month && x.price === price
  );

const formatEtfOpPrimaryData = (data: {
  stockInfo: StockInfo;
  month: string;
  primaryUp: EtfOpNestData;
  primaryDown: EtfOpNestData;
}): EtfOpPnCData => {
  const { primaryUp, primaryDown, month, stockInfo } = data;
  const { price, lastClosePrice, ...rest } = stockInfo;
  return {
    ...rest,
    stockLastClosePrice: lastClosePrice,
    stockPrice: price,
    month,
    isPrimary: true,
    strikePrice: primaryUp.strikePrice,
    dealDate: primaryUp.dealDate,
    remainDays: primaryUp.remainDays,
    currPriceC: primaryUp.currPrice,
    currPriceP: primaryDown.currPrice,
    innerValueC: primaryUp.innerValue,
    innerValueP: primaryDown.innerValue,
    timeValueC: primaryUp.timeValue,
    timeValueP: primaryDown.timeValue,
    settlePriceC: primaryUp.settlePrice,
    settlePriceP: primaryDown.settlePrice,
  };
};

const getCachedOpQuery = (codeMonthArr: Array<StockInfo & { month: string }>) =>
  codeMonthArr
    .map(({ code, month, price }) => {
      const opQuery = opQueryCache[code + month];
      const primaryIndexData = getEtfOpCodePrimaryIndexCache(
        code,
        month,
        price
      );
      if (!primaryIndexData) return '';
      return (
        opQuery.opUpQuery.split(',')[primaryIndexData.upIndex] +
        ',' +
        opQuery.opDownQuery.split(',')[primaryIndexData.downIndex]
      );
    })
    .join(',');

const getPrimaryIndex = (
  opUpDatas: IndexOpNestData[],
  opDownDatas: IndexOpNestData[],
  price: number | string,
  code: string
) => {
  let primaryUpIndex = -1;
  let primaryDownIndex = -1;
  let abs = Infinity;
  opUpDatas.forEach((upData, index) => {
    const _abs = Math.abs(upData.strikePrice - Number(price));
    if (_abs < abs) {
      abs = _abs;
      primaryUpIndex = index;
      primaryDownIndex = opDownDatas.findIndex(
        (downData) => downData.strikePrice === upData.strikePrice
      );
    }
  });
  return {
    primaryUpIndex,
    primaryDownIndex,
  };
};

export const fetchEtfOpPrimaryDatas = async (
  etfInfo: StockInfo,
  _months?: string[]
) => {
  const months = _months ?? (await fetchOpMonths());
  const cachedCodeMonthArr: Array<StockInfo & { month: string }> = [];
  const codeMonthArr: Array<StockInfo & { month: string }> = [];
  months.forEach((month) => {
    if (getEtfOpCodePrimaryIndexCache(etfInfo.code, month, etfInfo.price)) {
      cachedCodeMonthArr.push({ ...etfInfo, month });
    } else {
      codeMonthArr.push({ ...etfInfo, month });
    }
  });
  const cachedResult = await fetchSinaFinance(
    getCachedOpQuery(cachedCodeMonthArr)
  ).then((res) => {
    const arr = formatOpDatas(res);
    let index = -1;
    return cachedCodeMonthArr.map(({ month, ...rest }) =>
      formatEtfOpPrimaryData({
        stockInfo: rest,
        month,
        primaryUp: arr[++index],
        primaryDown: arr[++index],
      })
    );
  });

  const result: EtfOpPnCData[] = [];
  await Promise.all(
    codeMonthArr.map(({ month, ...rest }) =>
      fetchEtfOpByMonth({ code: rest.code, yearMonth: month }).then(
        ({ opUpDatas = [], opDownDatas = [] }) => {
          const { primaryUpIndex, primaryDownIndex } = getPrimaryIndex(
            opUpDatas,
            opDownDatas,
            rest.price,
            rest.code
          );
          if (primaryUpIndex > -1 && primaryDownIndex > -1) {
            setEtfOpCodePrimaryIndexCache({
              code: rest.code,
              month,
              upIndex: primaryUpIndex,
              downIndex: primaryDownIndex,
              price: rest.price,
            });
            result.push(
              formatEtfOpPrimaryData({
                stockInfo: rest,
                month,
                primaryUp: opUpDatas[primaryUpIndex],
                primaryDown: opDownDatas[primaryDownIndex],
              })
            );
          }
        }
      )
    )
  );
  return [...cachedResult, ...result];
};

const formatIndexOpDatas = (
  ups: (string | number)[][],
  downs: (string | number)[][]
) => {
  const result = [];
  for (let i = 0; i < ups.length; i++) {
    result.push({
      currPriceC: Number(ups[i][2]),
      currPriceP: Number(downs[i][2]),
      strikePrice: Number(ups[i][7]),
    });
  }
  return result;
};

const fetchIndexOpByMonth = async (params: { op: string; month: string }) => {
  const { op, month } = params;
  return jsonpPromise(
    `https://stock.finance.sina.com.cn/futures/api/openapi.php/OptionService.getOptionData?type=futures&product=${op}&exchange=cffex&pinzhong=${
      op + month
    }`
  ).then((res: any) => {
    const { up, down } = res?.result?.data ?? {};
    return formatIndexOpDatas(up, down);
  });
};

export const fetchIndexOpPrimaryDatas = async (params: {
  indexInfo: StockInfo;
  op: string;
  dealDates: string[];
}) => {
  const { indexInfo, dealDates, op } = params;
  const months = dealDates.map((dd) => moment(dd).format('YYMM'));
  const codeMonthArr: Array<typeof indexInfo & { month: string }> = [];
  months.forEach((month) => {
    codeMonthArr.push({ ...indexInfo, month });
  });
  const result: IndexOpPnCData[] = await Promise.all(
    codeMonthArr.map(({ month, name, price, sCode, code }, i) =>
      fetchIndexOpByMonth({ op, month }).then((opArr) => {
        let primaryIndex = 0;
        let abs = Infinity;
        opArr.forEach((opData, index) => {
          const _abs = Math.abs(opData.strikePrice - price);
          if (_abs < abs) {
            abs = _abs;
            primaryIndex = index;
          }
        });
        const { strikePrice, currPriceC, currPriceP } = opArr[primaryIndex];
        const innerValueC = Math.max(price - strikePrice, 0);
        const innerValueP = Math.max(strikePrice - price, 0);
        return {
          code,
          opCode: op + month,
          sCode,
          name,
          month,
          stockPrice: price,
          isPrimary: true,
          strikePrice,
          dealDate: dealDates[i],
          remainDays: moment(dealDates[i]).diff(moment(), 'days') + 1,
          currPriceC,
          currPriceP,
          innerValueC,
          innerValueP,
          timeValueC: currPriceC - innerValueC,
          timeValueP: currPriceP - innerValueP,
        };
      })
    )
  );
  return result;
};

export const fetchFeatPointByMonths = async (
  prod: string,
  months: string[]
) => {
  const query = months.map((month) => `nf_${prod}${month}`).join(',');
  const dataStr = await fetchSinaFinance(query);
  const result: number[] = dataStr
    .match(/"(.*?)"/g)
    .map((x: string) => Number(x.replace(/"/g, '').split(',')[3]));
  return result;
};

export const fetchFeatureDealDates = (): Promise<Record<string, string>> =>
  axiosGet('http://api.1to10.zldlwq.top/api/cffex', true);

export const fetchIndexOpLastData = (
  code: string, // io2307
  type: 'P' | 'C',
  strikePrice: number // 3950
) =>
  fetchSinaFinance(`P_OP_${code}${type}${strikePrice}`).then((str) => {
    const arr = str.match(/"(.*?)"/)[1].split(',');
    return {
      buyCount: Number(arr[0]), // 买量
      buyPrice: Number(arr[1]), // 买价
      currPrice: Number(arr[2]), // 最新价
      sellPrice: Number(arr[3]), // 卖价
      sellCount: Number(arr[4]), // 卖量
      position: Number(arr[5]), // 持仓
      rate: Number(arr[6]), // 涨跌 * 100
      strikePrice: Number(arr[7]), // 行权价
      lastClosePrice: Number(arr[8]), // 昨收
      openPrice: Number(arr[9]), // 今开
    };
  });
