import moment from 'moment';
import type {
  DealDate,
  StockInfo,
  IndexOpNestData,
  IndexOpPnCData,
  EtfOpNestData,
  EtfOpPnCData,
} from './pages/Finance/types';
import { jsonpPromise, axiosGet } from './request';

const fetchSinaFinance = (query: string, cached: boolean = false) =>
  axiosGet(
    // `https://a28c74f8c23a43c8a36364498baae175.apig.cn-north-1.huaweicloudapis.com/?query=${query}`
    `http://api.1to10.zldlwq.top/api/sina?query=${query}`,
    cached
  );

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

export const fetchAvgPrice2 = (
  sCode: string,
  startDate: string,
  amount: number = 25000,
  endDate: string = moment().format('YYYY-MM-DD')
): Promise<number> =>
  fetchEtfMonthK(sCode, startDate, endDate).then((arr) => {
    let _count;
    let count = 0;
    let sum = 0;
    arr.forEach(({ open }) => {
      _count = Math.floor(amount / open / 100) * 100;
      count += _count;
      sum += _count * open;
    });
    return sum / count;
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
  code: string;
  name: string;
  month: string;
  stockPrice: number;
  stockLastClosePrice: number;
  primaryUp: EtfOpNestData;
  primaryDown: EtfOpNestData;
}): EtfOpPnCData => {
  const { primaryUp, primaryDown, ...rest } = data;
  return {
    ...rest,
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

export const fetchEtfOpPrimaryDatas = async (etfInfo: StockInfo) => {
  const months = await fetchOpMonths();
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
    return cachedCodeMonthArr.map(
      ({ code, month, name, price, lastClosePrice }) =>
        formatEtfOpPrimaryData({
          code,
          name,
          month,
          stockPrice: price,
          stockLastClosePrice: lastClosePrice,
          primaryUp: arr[++index],
          primaryDown: arr[++index],
        })
    );
  });

  const result: EtfOpPnCData[] = [];
  await Promise.all(
    codeMonthArr.map(({ code, month, name, price, lastClosePrice }) =>
      fetchEtfOpByMonth({ code, yearMonth: month }).then(
        ({ opUpDatas = [], opDownDatas = [] }) => {
          const { primaryUpIndex, primaryDownIndex } = getPrimaryIndex(
            opUpDatas,
            opDownDatas,
            price,
            code
          );
          if (primaryUpIndex > -1 && primaryDownIndex > -1) {
            setEtfOpCodePrimaryIndexCache({
              code,
              month,
              upIndex: primaryUpIndex,
              downIndex: primaryDownIndex,
              price,
            });
            result.push(
              formatEtfOpPrimaryData({
                code,
                name,
                month,
                stockPrice: price,
                stockLastClosePrice: lastClosePrice,
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
  months: string[];
  dealDates: string[];
}) => {
  const { indexInfo, months, dealDates, op } = params;
  const codeMonthArr: Array<typeof indexInfo & { month: string }> = [];
  months.forEach((month) => {
    codeMonthArr.push({ ...indexInfo, month });
  });
  const result: IndexOpPnCData[] = await Promise.all(
    codeMonthArr.map(({ month, name, price }, i) =>
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
          code: op + month,
          name,
          month,
          stockPrice: price,
          isPrimary: true,
          strikePrice,
          dealDate: dealDates[i],
          remainDays: moment(dealDates[i]).diff(moment(), 'days'),
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

const DEFAULT_LIST_QUERY = {
  pageNumber: 1,
  pageSize: 50,
  sortTypes: -1, // -1 desc; 1 asc
  columns: 'ALL',
  client: 'WEB',
  source: 'WEB',
};

type ListQuery = typeof DEFAULT_LIST_QUERY;

export enum StaggingType {
  STOCK,
  BOND,
  REITs,
}

const staggingQuery: Record<StaggingType, any> = {
  [StaggingType.STOCK]: {
    sortColumns: 'APPLY_DATE,SECURITY_CODE',
    sortTypes: '-1,-1',
    reportName: 'RPTA_APP_IPOAPPLY',
    columns:
      'SECURITY_CODE,SECURITY_NAME,TRADE_MARKET_CODE,APPLY_CODE,TRADE_MARKET,MARKET_TYPE,ORG_TYPE,ISSUE_NUM,ONLINE_ISSUE_NUM,OFFLINE_PLACING_NUM,TOP_APPLY_MARKETCAP,PREDICT_ONFUND_UPPER,ONLINE_APPLY_UPPER,PREDICT_ONAPPLY_UPPER,ISSUE_PRICE,LATELY_PRICE,CLOSE_PRICE,APPLY_DATE,BALLOT_NUM_DATE,BALLOT_PAY_DATE,LISTING_DATE,AFTER_ISSUE_PE,ONLINE_ISSUE_LWR,INITIAL_MULTIPLE,INDUSTRY_PE_NEW,OFFLINE_EP_OBJECT,CONTINUOUS_1WORD_NUM,TOTAL_CHANGE,PROFIT,LIMIT_UP_PRICE,INFO_CODE,OPEN_PRICE,LD_OPEN_PREMIUM,LD_CLOSE_CHANGE,TURNOVERRATE,LD_HIGH_CHANG,LD_AVERAGE_PRICE,OPEN_DATE,OPEN_AVERAGE_PRICE,PREDICT_PE,PREDICT_ISSUE_PRICE2,PREDICT_ISSUE_PRICE,PREDICT_ISSUE_PRICE1,PREDICT_ISSUE_PE,PREDICT_PE_THREE,ONLINE_APPLY_PRICE,MAIN_BUSINESS,PAGE_PREDICT_PRICE1,PAGE_PREDICT_PRICE2,PAGE_PREDICT_PRICE3,PAGE_PREDICT_PE1,PAGE_PREDICT_PE2,PAGE_PREDICT_PE3,SELECT_LISTING_DATE,IS_BEIJING,INDUSTRY_PE_RATIO,INDUSTRY_PE,IS_REGISTRATION',
    quoteColumns: 'f2~01~SECURITY_CODE~NEWEST_PRICE',
    quoteType: '0',
    filter: "(APPLY_DATE>'2010-01-01')",
  },
  [StaggingType.BOND]: {
    sortColumns: 'PUBLIC_START_DATE',
    reportName: 'RPT_BOND_CB_LIST',
    quoteColumns:
      'f2~01~CONVERT_STOCK_CODE~CONVERT_STOCK_PRICE,f235~10~SECURITY_CODE~TRANSFER_PRICE,f236~10~SECURITY_CODE~TRANSFER_VALUE,f2~10~SECURITY_CODE~CURRENT_BOND_PRICE,f237~10~SECURITY_CODE~TRANSFER_PREMIUM_RATIO,f239~10~SECURITY_CODE~RESALE_TRIG_PRICE,f240~10~SECURITY_CODE~REDEEM_TRIG_PRICE,f23~01~CONVERT_STOCK_CODE~PBV_RATIO',
    quoteType: '0',
  },
  [StaggingType.REITs]: {
    sortColumns: 'SUBSCRIBE_START_DATE',
    reportName: 'RPT_CUSTOM_REITS_APPLY_LIST_MARKET',
    quoteColumns:
      'f14~09~SECURITY_CODE~LTD_SECURITY_NAME,f2~09~SECURITY_CODE~f2,NEW_DISCOUNT_RATIO~09~SECURITY_CODE,NEW_CHANGE_RATE~09~SECURITY_CODE,NEW_DIVIDEND_RATE_TTM~09~SECURITY_CODE',
  },
};
// https://data.eastmoney.com/xg/xg/default.html
const listQueryStrigify = (type: StaggingType, params?: ListQuery): string =>
  new URLSearchParams(
    Object.assign(
      {},
      DEFAULT_LIST_QUERY,
      staggingQuery[type],
      params
    ) as unknown as Record<string, string>
  ).toString();

export const fetchNewStagging = (type: StaggingType, params?: ListQuery) =>
  jsonpPromise(
    `https://datacenter-web.eastmoney.com/api/data/v1/get?${listQueryStrigify(
      type,
      params
    )}`
  );
