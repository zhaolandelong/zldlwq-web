import React, { useEffect } from 'react';
import PayArticle from '../components/PayArticle';

const Test: React.FC = () => {
  useEffect(() => {
    // fetchNewStagging(StaggingType.STOCK).then(console.log);
    // fetchNewStagging(StaggingType.BOND).then(console.log);
    // fetchNewStagging(StaggingType.REITs).then(console.log);
  }, []);
  return <PayArticle />;
};

export default Test;
