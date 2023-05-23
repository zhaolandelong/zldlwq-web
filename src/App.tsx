import React, { useEffect, useState, useMemo } from 'react';
import './App.css';
import moment from 'moment';
import { Table } from 'antd';
import {
  fetchETFPrice,
  fetchAvgPrice,
  getAnualReturnRate,
  getOptionDealDate,
  getCount,
  fetchOpAllPrimaryDatas,
} from './utils';
import type { ETFPosInfo, ETFPriceInfo, InvestInfo, OptionInfo } from './types';
import {
  etfInfos,
  etfColumns,
  positionCloumns,
  investColumns,
  getOptionColumns,
} from './constants';

function App() {
  const [etfDataSource, setEtfDataSource] = useState<ETFPriceInfo[]>([]);
  const [optionDataSource, setOptionDataSource] = useState<OptionInfo[]>([]);
  const [posDataSource, setPosDataSource] = useState<ETFPosInfo[]>([]);
  const [investDataSource, setinvestDataSource] = useState<InvestInfo[]>([]);
  const [dataTime, setDataTime] = useState(moment().format('HH:mm:ss'));

  const optionDealDate = useMemo(() => getOptionDealDate(), []);

  useEffect(() => {
    fetchETFPrice(etfInfos.map((info) => info.code)).then(async (etfArr) => {
      setDataTime(moment().format('HH:mm:ss'));
      // ETF
      setEtfDataSource(etfArr);

      // Option
      fetchOpAllPrimaryDatas(etfArr).then(setOptionDataSource);

      // Postion
      const avgPriceArr = await Promise.all(
        etfInfos.map((info) => fetchAvgPrice(info.code, info.startDate))
      );
      const posDataSource: ETFPosInfo[] = etfInfos.map((info, index) => {
        const investMonths = moment().diff(info.startDate, 'month') + 1;
        const actualReturnRate = getAnualReturnRate(
          info.expectedReturnRate,
          investMonths
        );
        return {
          ...info,
          name: etfArr[index].name,
          investMonths,
          avgCost: avgPriceArr[index],
          actualReturnRate: actualReturnRate,
          expectedReturnPrice: avgPriceArr[index] * (1 + actualReturnRate),
        };
      });
      setPosDataSource(posDataSource);

      // Invest
      const investDataSource: InvestInfo[] = etfInfos.map((info, index) => {
        const monthlyCount = getCount(info.monthlyAmount, etfArr[index].price);
        const scalingCount = getCount(
          info.monthlyAmount * info.scalingMutiple,
          etfArr[index].price
        );
        return {
          code: info.code,
          price: etfArr[index].price,
          name: etfArr[index].name,
          monthlyAmount: info.monthlyAmount,
          ...monthlyCount,
          scalingOptionCount: scalingCount.optionCount,
          scalingEtfCount: scalingCount.etfCount,
        };
      });
      setinvestDataSource(investDataSource);
    });
  }, []);

  return (
    <div className="App">
      <h1>Today is {moment().format('YYYY-MM-DD dddd')}</h1>
      <h2>
        Nearest Deal Date: {optionDealDate.format('YYYY-MM-DD')}. Remain{' '}
        <span className="red">{optionDealDate.diff(moment(), 'days') + 1}</span>{' '}
        Days.
      </h2>
      <h2>ETF Info ({dataTime})</h2>
      <Table
        columns={etfColumns}
        dataSource={etfDataSource}
        rowKey="code"
        pagination={false}
      />
      <h2>Option Info ({dataTime})</h2>
      <Table
        columns={getOptionColumns(
          etfInfos.map(({ code }) => {
            const value = code.slice(-6);
            return {
              text: value,
              value,
            };
          })
        )}
        dataSource={optionDataSource}
        rowKey={(record) =>
          `${record.code}-${record.month}-${record.strikePrice}`
        }
        pagination={false}
      />
      <h2>Position Info</h2>
      <Table
        columns={positionCloumns}
        dataSource={posDataSource}
        rowKey="code"
        pagination={false}
      />
      <h2>Invest Info</h2>
      <Table
        columns={investColumns}
        dataSource={investDataSource}
        rowKey="code"
        pagination={false}
      />
    </div>
  );
}

export default App;
