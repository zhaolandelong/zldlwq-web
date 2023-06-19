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
import PositionFormList from './components/PositionFormList';
import useEtfPriceInfos from './hooks/useEtfPriceInfos';
import useIndexPriceInfos from './hooks/useIndexPriceInfos';
import { DealDate, InvestBaseInfo, ProdDealDateKV } from './types';
import { DEFAULT_INVEST_INFOS, STORAGE_KEY } from './constants';

const { Title } = Typography;

const getDefaultInvestInfos = (): InvestBaseInfo[] => {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    return JSON.parse(storage);
  }
  return DEFAULT_INVEST_INFOS;
};

const Finance: React.FC = () => {
  const defaultInvestInfos = getDefaultInvestInfos();
  const [fetchTime, setfetchTime] = useState(moment().format('HH:mm:ss'));
  const [dealDate, setDealDate] = useState<DealDate>();
  const [featureDealDates, setFeatureDealDates] = useState<ProdDealDateKV>();
  const [investInfos, setInvestInfos] =
    useState<InvestBaseInfo[]>(defaultInvestInfos);

  const etfPriceInfos = useEtfPriceInfos(fetchTime);
  const indexPriceInfos = useIndexPriceInfos(fetchTime);

  const firstFeature = useMemo(() => {
    if (typeof featureDealDates === 'undefined') return void 0;
    return Object.values(featureDealDates)[0];
  }, [featureDealDates]);

  useEffect(() => {
    const nowMoment = moment();
    fetchOpDealDate(nowMoment.format('YYYY-MM')).then(setDealDate);
    fetchFeatureDealDates().then((res) => {
      const result: typeof res = {};
      Object.entries(res).forEach(([key, val]) => {
        if (nowMoment.isBefore(moment(val))) {
          result[key] = val;
        }
      });
      setFeatureDealDates(result);
    });
  }, []);

  const handleInvestChange = (vals: InvestBaseInfo[]) => {
    setInvestInfos(vals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vals));
  };

  return (
    <>
      <Title level={4}>
        Today is {moment().format('YYYY-MM-DD dddd')}. <br />
        ETF 期权到期日： {dealDate?.expireDay} (
        <span style={{ color: 'red' }}>{dealDate?.remainderDays}</span> 天)
        <br />
        股指期权到期日： {moment(firstFeature).format('YYYY-MM-DD')} (
        <span style={{ color: 'red' }}>
          {moment(firstFeature).diff(moment(), 'days')}
        </span>{' '}
        天)
      </Title>
      <FloatButton
        description={`刷新\n${fetchTime}`}
        type="primary"
        shape="square"
        style={{ width: 60, bottom: 20 }}
        onClick={() => setfetchTime(moment().format('HH:mm:ss'))}
      />
      <Row gutter={16}>
        <Col span={24} md={12}>
          <ETFTable dataSource={etfPriceInfos} />
        </Col>
        <Col span={24} md={12}>
          <IndexTable dataSource={indexPriceInfos} />
        </Col>
      </Row>
      <ETFOpTable stockInfos={etfPriceInfos} />
      <Row gutter={16}>
        <Col span={24} md={12}>
          <IndexOpTable
            stockInfos={indexPriceInfos}
            featureDealDates={featureDealDates}
          />
        </Col>
        <Col span={24} md={12}>
          <IndexFeatTable
            stockInfos={indexPriceInfos}
            featureDealDates={featureDealDates}
          />
        </Col>
      </Row>

      <PositionTable investInfos={investInfos} eftPriceInfos={etfPriceInfos} />
      <PositionFormList
        defaultValues={defaultInvestInfos}
        onChange={handleInvestChange}
      />
    </>
  );
};

export default Finance;
