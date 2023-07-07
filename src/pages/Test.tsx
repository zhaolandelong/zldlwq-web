import React, { useEffect } from 'react';
import PayArticle from '../components/PayArticle';
import { fetchIndexOpLastData } from './Finance/services';

const Test: React.FC = () => {
  useEffect(() => {
    fetchIndexOpLastData('io2307','C',3400).then(console.log);
    // fetchNewStagging(StaggingType.STOCK).then(console.log);
    // fetchNewStagging(StaggingType.BOND).then(console.log);
    // fetchNewStagging(StaggingType.REITs).then(console.log);
  }, []);
  return <PayArticle />;
};

export default Test;
