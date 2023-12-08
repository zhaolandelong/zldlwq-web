import React, { useEffect } from 'react';
import bookImg from './book.png';
import PayArticle from '../components/PayArticle';
import { fetchIndexOpLastData } from './Finance/services';
import moment from 'moment';
import { getOpDealMonths, getNthDayOfMonths } from './Finance/utils';

const Test: React.FC = () => {
  console.log(
    ['2023-07-24', '2023-08-16'].filter((ym) =>
      moment(ym).isSameOrAfter(moment().startOf('D'))
    )
  );

  useEffect(() => {
    // fetchIndexOpLastData('io2307','C',3400).then(console.log);
    // fetchNewStagging(StaggingType.STOCK).then(console.log);
    // fetchNewStagging(StaggingType.BOND).then(console.log);
    // fetchNewStagging(StaggingType.REITs).then(console.log);
  }, []);
  return (
    <div>
      <img src={bookImg} style={{ width: '100%' }} alt="" />
    </div>
  );
};

export default Test;
