import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import { FloatButton, Typography, Col, Row } from 'antd';
import { fetchFeatureDealDates, fetchOpDealDate } from './services';
import ETFTable from './components/ETFTable';
import ETFOpTable from './components/ETFOpTable';
import PositionTable from './components/PositionTable';
import IndexTable from './components/IndexTable';
import IndexOpTable from './components/IndexOpTable';
import IndexFeatTable from './components/IndexFeatTable';
// import PositionFormList from './components/PositionFormList';
import useEtfPriceInfos from './hooks/useEtfPriceInfos';
import useIndexPriceInfos from './hooks/useIndexPriceInfos';
import { DealDate, InvestBaseInfo, ProdDealDateKV } from './types';

const { Title } = Typography;

const investInfos: InvestBaseInfo[] = [
  {
    sCode: 'sh510300',
    startDate: '2021-11-01',
    monthlyAmount: 25000,
    expectedReturnRate: 0.1,
    additionMutiple: 3,
  },
  {
    sCode: 'sz159915',
    startDate: '2021-11-01',
    monthlyAmount: 25000,
    expectedReturnRate: 0.15,
    additionMutiple: 3,
  },
];

const Finance: React.FC = () => {
  const [fetchTime, setfetchTime] = useState(moment().format('HH:mm:ss'));
  const [dealDate, setDealDate] = useState<DealDate>();
  const [featureDealDates, setFeatureDealDates] = useState<ProdDealDateKV>();

  const etfPriceInfos = useEtfPriceInfos(fetchTime);
  const indexPriceInfos = useIndexPriceInfos(fetchTime);

  const firstFeature = useMemo(() => {
    if (typeof featureDealDates === 'undefined') return void 0;
    return Object.values(featureDealDates)[0];
  }, [featureDealDates]);

  useEffect(() => {
    fetchOpDealDate(moment().format('YYYY-MM')).then(setDealDate);
    fetchFeatureDealDates().then(setFeatureDealDates);
  }, []);

  return (
    <>
      <Title level={3}>
        Today is {moment().format('YYYY-MM-DD dddd')}. <br />
        ETF 期权到期日： {dealDate?.expireDay} (
        <span style={{ color: 'red' }}>{dealDate?.remainderDays}</span> Days).
        <br />
        股指期权到期日： {moment(firstFeature).format('YYYY-MM-DD')} (
        <span style={{ color: 'red' }}>
          {moment(firstFeature).diff(moment(), 'days')}
        </span>{' '}
        Days).
      </Title>
      <FloatButton
        description={`刷新\n${fetchTime}`}
        type="primary"
        shape="square"
        style={{ width: 60, bottom: 20 }}
        onClick={() => setfetchTime(moment().format('HH:mm:ss'))}
      />
      {/* <PositionFormList /> */}
      <Row gutter={16}>
        <Col span={24} md={12}>
          <ETFTable dataSource={etfPriceInfos} />
        </Col>
        <Col span={24} md={12}>
          <IndexTable dataSource={indexPriceInfos} />
        </Col>
      </Row>
      <ETFOpTable stockInfos={etfPriceInfos} />
      <IndexOpTable
        stockInfos={indexPriceInfos}
        featureDealDates={featureDealDates}
      />
      <IndexFeatTable
        stockInfos={indexPriceInfos}
        featureDealDates={featureDealDates}
      />
      <PositionTable investInfos={investInfos} eftPriceInfos={etfPriceInfos} />
    </>
  );
};

export default Finance;
