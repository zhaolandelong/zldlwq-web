import React, { useEffect } from 'react';
import HK from './HK';
import BeiJing from './BeiJing';
import { Typography } from 'antd';
import moment from 'moment';
import { fetchNewStagging, StaggingType } from './services';
const { Title } = Typography;

const Stagging: React.FC = () => {
  useEffect(() => {
    fetchNewStagging(StaggingType.BEI_JING, {
      filter: `(APPLY_DATE>='${moment().add(-30, 'days').format('YYYY-MM-DD')}')`,
    }).then(console.log);
    // fetchNewStagging(StaggingType.BOND).then(console.log);
    // fetchNewStagging(StaggingType.REITs).then(console.log);
  }, []);
  return (
    <>
      <Title level={1}>日期： {moment().format('YYYY-MM-DD dddd')}</Title>
      <HK />
      <BeiJing />
    </>
  );
};

export default Stagging;
