import React, { useEffect, useState, useMemo } from 'react';
import './style.css';
import moment from 'moment';
import { Checkbox, Button, Layout, Space } from 'antd';
import { fetchETFPrice, getOptionDealDate } from './utils';
import type { ETFPriceInfo } from './types';
import { ETF_INFOS, etfPosInfos } from './constants';
import ETFTable from './components/ETFTable';
import ETFOpTable from './components/ETFOpTable';
import PositionTable from './components/PositionTable';
import InvestTable from './components/InvestTable';
import PositionFormList from './components/PositionFormList';

const { Header, Footer, Sider, Content } = Layout;

const App: React.FC = () => {
  const defaultCodes = etfPosInfos.map((info) => info.code);
  const checkboxOptions = useMemo(
    () =>
      Object.values(ETF_INFOS).map((info) => ({
        label: info.name,
        value: info.code,
        disabled: defaultCodes.includes(info.code),
      })),
    []
  );
  const [etfCodes, setEtfCodes] = useState<string[]>(defaultCodes);
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
    <Layout>
      <Content>
        <h1>Today is {moment().format('YYYY-MM-DD dddd')}</h1>
        <h2>
          Nearest Deal Date: {optionDealDate.format('YYYY-MM-DD')}. Remain{' '}
          <span className="red">
            {optionDealDate.diff(moment(), 'days') + 1}
          </span>{' '}
          Days.
        </h2>
        <Checkbox.Group
          options={checkboxOptions}
          value={etfCodes}
          onChange={(vals) => setEtfCodes(vals as string[])}
        />
        <Button
          type="primary"
          onClick={() => setfetchTime(moment().format('HH:mm:ss'))}
        >
          REFRESH
        </Button>
        {/* <PositionFormList /> */}
        <ETFTable dataSource={etfDataSource} fetchTime={fetchTime} />
        <ETFOpTable etfPriceInfos={etfDataSource} fetchTime={fetchTime} />
        <PositionTable etfPosInfos={etfPosInfos} />
        <InvestTable etfPriceInfos={etfDataSource} etfPosInfos={etfPosInfos} />
      </Content>
    </Layout>
  );
};

export default App;
