import axios from 'axios';
import moment, { type Moment } from 'moment';
import { set } from 'lodash';
import type { ETFPriceInfo, OptionInfo, OptionNestData } from './types';
import jsonp from 'jsonp';
import { etfInfos } from './constants';

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

const fetchSinaFinance = (query: string) =>
  axios
    .get(
      // `https://a28c74f8c23a43c8a36364498baae175.apig.cn-north-1.huaweicloudapis.com/?query=${query}`
      `http://api.1to10.zldlwq.top/api?query=${query}`
    )
    .then((res) => res.data);

const formatOpDatas = (data: string, etfPrice: number) =>
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
      isPrimary: Math.abs(etfPrice - Number(arr[7])) <= 0.05,
      PorC: arr[45] as OptionNestData['PorC'],
      dealDate: arr[46],
      remainDays: Number(arr[47]),
      innerValue: Number(arr[49]),
      timeValue: Number(arr[50]),
    };
    return result;
  });

export const fetchOpDataByMonth = async (payload: {
  code: string;
  etfPrice: number;
  yearMonth: string;
}) => {
  const { code, yearMonth, etfPrice } = payload;
  const mark = code.slice(-6) + yearMonth;
  const opQueryString = await fetchSinaFinance(`OP_UP_${mark},OP_DOWN_${mark}`);
  const [opUpQuery, opDownQuery] = opQueryString
    .match(/"(.*?)"/g)
    .map((x: string) => x.replace(/"/g, ''));

  const [upRes, downRes] = await Promise.all([
    fetchSinaFinance(opUpQuery),
    fetchSinaFinance(opDownQuery),
  ]);

  return {
    opUpDatas: formatOpDatas(upRes, etfPrice),
    opDownDatas: formatOpDatas(downRes, etfPrice),
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

export const fetchOpAllPrimaryDatas = async (etfInfos: ETFPriceInfo[]) => {
  const months = await fetchOpMonths();
  const codeMonthArr: Array<ETFPriceInfo & { month: string }> = [];
  const result: OptionInfo[] = [];
  etfInfos.forEach((data) => {
    months.forEach((month) => {
      codeMonthArr.push({ ...data, month });
    });
  });
  await Promise.all(
    codeMonthArr.map(({ code, month, name, price }) =>
      fetchOpDataByMonth({ code, yearMonth: month, etfPrice: price }).then(
        ({ opUpDatas = [], opDownDatas = [] }) => {
          const primaryUpDatas = opUpDatas.filter((data) => data.isPrimary);
          primaryUpDatas.forEach((up) => {
            const down = opDownDatas.find(
              (data) => data.strikePrice === up.strikePrice
            );
            result.push({
              code,
              name,
              month,
              strikePrice: up.strikePrice,
              timeValueP: Number(down?.timeValue),
              timeValueC: up.timeValue,
              remainDays: up.remainDays,
            });
          });
        }
      )
    )
  );
  // console.log('🚀 ~ file: App.tsx:53 ~ Promise.all ~ resArr:', resArr);
  return result;
};
