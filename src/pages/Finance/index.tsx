import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { FloatButton, Typography, Col, Row } from 'antd';
import ga from 'react-ga';
import IndexETFTable from './components/IndexETFTable';
import ETFOpTable from './components/ETFOpTable';
import PositionTable from './components/PositionTable';
import PositionReference from './components/PositionReference';
import IndexOpTable from './components/IndexOpTable';
import IndexFeatTable from './components/IndexFeatTable';
import PositionFormList from './components/PositionFormList';
import SellOpETFTable from './components/SellOpETFTable';
import PayArticle from '../../components/PayArticle';
import Instructions from '../../components/Instructions';
import useEtfPriceInfos from './hooks/useEtfPriceInfos';
import useIndexPriceInfos from './hooks/useIndexPriceInfos';
import useFetchPosition from './hooks/useFetchPosition';
import { InvestBaseInfo, StockInfo } from './types';
import { DEFAULT_INVEST_INFOS, STORAGE_KEY } from './constants';
import { getNthDayOfMonths, getOpDealMonths } from './utils';

const { Title, Text } = Typography;

const getDefaultInvestInfos = (): InvestBaseInfo[] => {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    return JSON.parse(storage);
  }
  return DEFAULT_INVEST_INFOS;
};

const defaultInvestInfos = getDefaultInvestInfos();
const opDealMonths = getOpDealMonths();
const etfOpDealDates = getNthDayOfMonths(opDealMonths, 4, 3).filter((ym) =>
  moment(ym).isSameOrAfter(moment().startOf('D'))
);
// const etfOpDealDates = ['2023-07-24', '2023-08-16'].filter(ym => !moment(ym).isSameOrBefore(moment()));
const indexOpDealDates = getNthDayOfMonths(opDealMonths, 3, 5).filter((ym) =>
  moment(ym).isSameOrAfter(moment().startOf('D'))
);

const Finance: React.FC = () => {
  const [fetchTime, setfetchTime] = useState(moment().format('HH:mm:ss'));
  const [investInfos, setInvestInfos] =
    useState<InvestBaseInfo[]>(defaultInvestInfos);

  const etfPriceInfos = useEtfPriceInfos(fetchTime);
  const indexPriceInfos = useIndexPriceInfos(fetchTime);
  const { loading: posLoading, dataSource: posData } = useFetchPosition(
    investInfos,
    etfPriceInfos
  );
  const sellCallStokInfos: StockInfo[] = useMemo(() => {
    return posData.map((data) => {
      const base = etfPriceInfos.find(
        ({ sCode }) => data.sCode === sCode
      ) as unknown as StockInfo;
      return {
        ...base,
        price: data.avgCost * (1 + data.actualReturnRate / 100),
      };
    });
  }, [posData, etfPriceInfos]);

  const sellPutStokInfos: StockInfo[] = useMemo(() => {
    return posData.map((data) => {
      const base = etfPriceInfos.find(
        ({ sCode }) => data.sCode === sCode
      ) as unknown as StockInfo;
      return {
        ...base,
        price: data.additionPrice,
      };
    });
  }, [etfPriceInfos, posData]);

  const handleInvestChange = (vals: InvestBaseInfo[]) => {
    setInvestInfos(vals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vals));
  };

  const handleRefresh = () => {
    ga.event({ category: 'Event', action: 'Click', label: 'Refresh' });
    setfetchTime(moment().format('HH:mm:ss'));
  };

  return (
    <>
      <Title level={4}>
        Today is {moment().format('YYYY-MM-DD dddd')}. <br />
        ETF 期权到期日： {etfOpDealDates[0]} (
        <span style={{ color: 'red' }}>
          {moment(etfOpDealDates[0]).diff(moment(), 'days') + 1}
        </span>{' '}
        天)
        <br />
        股指期权到期日： {indexOpDealDates[0]} (
        <span style={{ color: 'red' }}>
          {moment(indexOpDealDates[0]).diff(moment(), 'days') + 1}
        </span>{' '}
        天)
      </Title>
      <Text type="warning">注意：以下内容只是基于个人理解，仅供参考。</Text>
      <FloatButton
        description={`更新\n${fetchTime}`}
        type="primary"
        shape="square"
        style={{ width: 60, bottom: 20 }}
        onClick={handleRefresh}
      />
      <Row gutter={16}>
        <Col span={24} md={12}>
          <IndexETFTable indexData={indexPriceInfos} etfData={etfPriceInfos} />
        </Col>
        <Col span={24} md={12}>
          <Instructions />
        </Col>
      </Row>
      <ETFOpTable stockInfos={etfPriceInfos} />
      <Row gutter={16}>
        <Col span={24} lg={14}>
          <IndexOpTable
            stockInfos={indexPriceInfos}
            dealDates={indexOpDealDates}
          />
        </Col>
        <Col span={24} lg={10}>
          <IndexFeatTable
            stockInfos={indexPriceInfos}
            dealDates={indexOpDealDates}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24} lg={16}>
          <PositionFormList
            defaultValues={defaultInvestInfos}
            onChange={handleInvestChange}
          />
          <PayArticle />
        </Col>
        <Col span={24} lg={8}>
          <PositionReference
            loading={posLoading}
            dataSource={posData}
            stockInfos={etfPriceInfos}
          />
        </Col>
      </Row>
      <PositionTable loading={posLoading} dataSource={posData} />
      <Row gutter={16}>
        <Col span={24} md={12}>
          <SellOpETFTable type="C" stockInfos={sellCallStokInfos} />
        </Col>
        <Col span={24} md={12}>
          <SellOpETFTable type="P" stockInfos={sellPutStokInfos} />
        </Col>
      </Row>
    </>
  );
};

export default Finance;
