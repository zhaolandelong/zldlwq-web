import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import { Button, Typography, Col, Row } from 'antd';
import { fetchOpDealDate } from './utils';
import { etfPosInfos } from './constants';
import ETFTable from './components/ETFTable';
import ETFOpTable from './components/ETFOpTable';
import PositionTable from './components/PositionTable';
import InvestTable from './components/InvestTable';
import IndexTable from './components/IndexTable';
import IndexOpTable from './components/IndexOpTable';
// import PositionFormList from './components/PositionFormList';
import useEtfPriceInfos from './hooks/useEtfPriceInfos';
import useIndexPriceInfos from './hooks/useIndexPriceInfos';
import useFeatureDealDates from './hooks/useFeatureDealDates';
import { DealDate } from './types';

const { Title } = Typography;

const Finance: React.FC = () => {
  const [fetchTime, setfetchTime] = useState(moment().format('HH:mm:ss'));
  const [dealDate, setDealDate] = useState<DealDate>();

  const etfPriceInfos = useEtfPriceInfos(fetchTime);
  const indexPriceInfos = useIndexPriceInfos(fetchTime);
  const featureDealDates = useFeatureDealDates(fetchTime);

  const firstFeature = useMemo(() => {
    if (typeof featureDealDates === 'undefined') return void 0;
    return Object.values(featureDealDates)[0];
  }, [featureDealDates]);

  useEffect(() => {
    fetchOpDealDate(moment().format('YYYY-MM')).then(setDealDate);
  }, []);

  return (
    <>
      <Title level={3}>
        Today is {moment().format('YYYY-MM-DD dddd')}. <br />
        ETF Option Deal Date: {dealDate?.expireDay} (
        <span style={{ color: 'red' }}>{dealDate?.remainderDays}</span> Days).
        <br />
        Index Option Deal Date: {moment(firstFeature).format('YYYY-MM-DD')} (
        <span style={{ color: 'red' }}>
          {moment(firstFeature).diff(moment(), 'days')}
        </span>{' '}
        Days).
      </Title>
      <Button
        type="primary"
        onClick={() => setfetchTime(moment().format('HH:mm:ss'))}
      >
        REFRESH
      </Button>
      {/* <PositionFormList /> */}
      <Row gutter={16}>
        <Col span={12}>
          <ETFTable dataSource={etfPriceInfos} fetchTime={fetchTime} />
        </Col>
        <Col span={12}>
          <IndexTable dataSource={indexPriceInfos} fetchTime={fetchTime} />
        </Col>
      </Row>
      <ETFOpTable priceInfos={etfPriceInfos} fetchTime={fetchTime} />
      <IndexOpTable
        priceInfos={indexPriceInfos}
        featureDealDates={featureDealDates}
        fetchTime={fetchTime}
      />
      <PositionTable etfPosInfos={etfPosInfos} />
      <InvestTable etfPriceInfos={etfPriceInfos} etfPosInfos={etfPosInfos} />
    </>
  );
};

export default Finance;
