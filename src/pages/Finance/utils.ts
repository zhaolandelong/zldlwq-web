import axios from 'axios';
import moment from 'moment';
import type {
  DealDate,
  StockInfo,
  OptionNestData,
  OptionPnCData,
  ProdDealDateKV,
} from './types';
import jsonp from 'jsonp';

export const fetchAvgPrice = (
  sCode: string,
  startDate: string,
  endDate: string = moment().format('YYYY-MM-DD')
): Promise<number> => {
  return axios
    .get(
      `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${sCode},month,${moment(
        startDate
      )
        .subtract(1, 'month')
        .format('YYYY-MM-DD')},${endDate},999,qfq`
    )
    .then((res) => res.data.data[sCode].qfqmonth)
    .then((arr: Array<string[]>) => {
      arr.pop();
      const avgPrice = arr.reduce((a, b) => a + Number(b[2]), 0) / arr.length;
      return Number(avgPrice);
    });
};

/**
 *
 * @param date '2023-06'
 */
export const fetchOpDealDate = (
  date: string,
  cate: string = '300ETF'
): Promise<DealDate> =>
  new Promise((rev, rej) => {
    jsonp(
      `https://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionService.getRemainderDay?exchange=null&cate=${cate}&date=${date}&dpc=1`,
      (err, data) => {
        if (err) {
          rej(err);
        } else {
          rev(data);
        }
      }
    );
  }).then((res: any) => {
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
): Promise<Pick<StockInfo, 'code' | 'price'>[]> =>
  axios.get<string>(`https://qt.gtimg.cn/q=${opCodes.join(',')}`).then((res) =>
    res.data
      .split(';')
      .filter((v) => v.includes('~'))
      .map((str) => {
        const arr = str.split('~');
        return {
          code: arr[2],
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

export const getEtfOpCount = (amount: number, price: number) => {
  const optionCount = Math.floor(amount / price / 10000);
  const etfCount = Math.floor(amount / price / 100 - optionCount * 100) * 100;
  return { optionCount, etfCount };
};

const fetchSinaFinance = (query: string) =>
  axios
    .get(
      // `https://a28c74f8c23a43c8a36364498baae175.apig.cn-north-1.huaweicloudapis.com/?query=${query}`
      `http://api.1to10.zldlwq.top/api/sina?query=${query}`
    )
    .then((res) => res.data);

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
    const result: OptionNestData = {
      currPrice: Number(arr[2]),
      strikePrice: Number(arr[7]),
      PorC: arr[45] as OptionNestData['PorC'],
      dealDate: arr[46],
      remainDays: Number(arr[47]),
      innerValue: Number(arr[49]),
      timeValue: Number(arr[50]),
    };
    return result;
  }) ?? [];

const fetchEtfOpByMonth = async (payload: {
  code: string;
  yearMonth: string;
}) => {
  const { code, yearMonth } = payload;
  const mark = code + yearMonth;
  const opQueryString = await fetchSinaFinance(`OP_UP_${mark},OP_DOWN_${mark}`);
  const [opUpQuery, opDownQuery] = opQueryString
    .match(/"(.*?)"/g)
    .map((x: string) => x.replace(/"/g, ''));

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
  new Promise((rev, rej) => {
    jsonp(
      'http://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionService.getStockName',
      (err, data) => {
        if (err) {
          rej(err);
        } else {
          rev(data);
        }
      }
    );
  }).then((res: any) =>
    Array.from<string>(new Set(res?.result?.data?.contractMonth)).map((val) =>
      val.replace(/-/g, '').slice(-4)
    )
  );

export const fetchEtfOpPrimaryDatas = async (etfInfo: StockInfo) => {
  const months = await fetchOpMonths();
  const codeMonthArr: Array<StockInfo & { month: string }> = [];
  months.forEach((month) => {
    codeMonthArr.push({ ...etfInfo, month });
  });
  const result: OptionPnCData[] = await Promise.all(
    codeMonthArr.map(({ code, month, name, price }) =>
      fetchEtfOpByMonth({ code, yearMonth: month }).then(
        ({ opUpDatas = [], opDownDatas = [] }) => {
          let primaryUpIndex = 0;
          let primaryDownIndex = 0;
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
          const primaryUp = opUpDatas[primaryUpIndex];
          const primaryDown = opDownDatas[primaryDownIndex];
          return {
            code,
            name,
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
          };
        }
      )
    )
  );
  return result;
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

const fetchIndexOpByMonth = async (params: { op: string; month: string }) =>
  new Promise((rev, rej) => {
    const { op, month } = params;
    jsonp(
      `https://stock.finance.sina.com.cn/futures/api/openapi.php/OptionService.getOptionData?type=futures&product=${op}&exchange=cffex&pinzhong=${
        op + month
      }`,
      (err, data) => {
        if (err) {
          rej(err);
        } else {
          rev(data);
        }
      }
    );
  }).then((res: any) => {
    const { up, down } = res?.result?.data ?? {};
    return formatIndexOpDatas(up, down);
  });

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
  const result: OptionPnCData[] = await Promise.all(
    codeMonthArr.map(({ month, name, price }, i) =>
      fetchIndexOpByMonth({ op, month }).then((opArr) => {
        let primaryIndex = 0;
        let abs = Infinity;
        opArr.forEach((opData, index) => {
          const _abs = Math.abs(opData.strikePrice - Number(price));
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

export const fetchFeatureDealDates = () =>
axios
  .get<ProdDealDateKV>('http://api.1to10.zldlwq.top/api/cffex')
  .then((res) => res.data);