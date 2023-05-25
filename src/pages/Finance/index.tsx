import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { Button, Typography, Col, Row } from 'antd';
import { getOptionDealDate } from './utils';
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

const { Title } = Typography;

const Finance: React.FC = () => {
  const [fetchTime, setfetchTime] = useState(moment().format('HH:mm:ss'));
  const etfPriceInfos = useEtfPriceInfos(fetchTime);
  const indexPriceInfos = useIndexPriceInfos(fetchTime);

  const optionDealDate = useMemo(() => getOptionDealDate(), []);

  return (
    <>
      <Title level={3}>
        Today is {moment().format('YYYY-MM-DD dddd')}. <br />
        Nearest Deal Date: {optionDealDate.format('YYYY-MM-DD')} (
        <span style={{ color: 'red' }}>
          {optionDealDate.diff(moment(), 'days')}
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
      <IndexOpTable priceInfos={indexPriceInfos} fetchTime={fetchTime} />
      <PositionTable etfPosInfos={etfPosInfos} />
      <InvestTable etfPriceInfos={etfPriceInfos} etfPosInfos={etfPosInfos} />
    </>
  );
};

export default Finance;
