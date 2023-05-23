import React, { useEffect, useState, useMemo } from 'react';
import './App.css';
import moment from 'moment';
import { Checkbox, Button } from 'antd';
import { fetchETFPrice, getOptionDealDate } from './utils';
import type { ETFPriceInfo } from './types';
import { DEFAULT_CODES, ETF_INFOS } from './constants';
import ETFTable from './ETFTable';
import ETFOpTable from './ETFOpTable';
import PositionTable from './PosInvestTable';
import InvestTable from './InvestTable';

function App() {
  const checkboxOptions = useMemo(
    () =>
      Object.values(ETF_INFOS).map((info) => ({
        label: info.name,
        value: info.code,
      })),
    []
  );
  const [etfCodes, setEtfCodes] = useState<string[]>(DEFAULT_CODES);
  const [etfDataSource, setEtfDataSource] = useState<ETFPriceInfo[]>([]);
  const [fetchTime, setfetchTime] = useState(moment().format('HH:mm:ss'));

  const optionDealDate = useMemo(() => getOptionDealDate(), []);

  useEffect(() => {
    const etfInfos = etfCodes.map((code) => ETF_INFOS[code]);
    const etfOpCodes = etfInfos.map((info) => info.opCode);
    fetchETFPrice(etfOpCodes).then((etfArr) => {
      setEtfDataSource(
        etfArr.map((info, i) => ({
          ...etfInfos[i],
          price: info.price,
        }))
      );
    });
  }, [fetchTime]);

  return (
    <div className="App">
      <h1>Today is {moment().format('YYYY-MM-DD dddd')}</h1>
      <h2>
        Nearest Deal Date: {optionDealDate.format('YYYY-MM-DD')}. Remain{' '}
        <span className="red">{optionDealDate.diff(moment(), 'days') + 1}</span>{' '}
        Days.
      </h2>
      <Checkbox.Group
        options={checkboxOptions}
        defaultValue={DEFAULT_CODES}
        value={etfCodes}
        onChange={(vals) => setEtfCodes(vals as string[])}
      />
      <Button
        type="primary"
        onClick={() => setfetchTime(moment().format('HH:mm:ss'))}
      >
        REFRESH
      </Button>
      <ETFTable dataSource={etfDataSource} fetchTime={fetchTime} />
      <ETFOpTable etfPriceInfos={etfDataSource} fetchTime={fetchTime} />
      <PositionTable />
      <InvestTable etfPriceInfos={etfDataSource} />
    </div>
  );
}

export default App;
