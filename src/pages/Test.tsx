import React, { useEffect } from 'react';
import bookImg from './book.png';
import moment from 'moment';
import { getDealMonthsAndDates } from './Finance/utils';

const Test: React.FC = () => {
  const start = undefined;
  console.log(
    getDealMonthsAndDates(0, start),
    getDealMonthsAndDates(1, start),
    getDealMonthsAndDates(2, start)
  );

  useEffect(() => {
    // fetchIndexOpLastData('io2307','C',3400).then(console.log);
    // fetchNewStagging(StaggingType.STOCK).then(console.log);
    // fetchNewStagging(StaggingType.BOND).then(console.log);
    // fetchNewStagging(StaggingType.REITs).then(console.log);
  }, []);
  return (
    <div>{/* <img src={bookImg} style={{ width: '100%' }} alt="" /> */}</div>
  );
};

export default Test;
