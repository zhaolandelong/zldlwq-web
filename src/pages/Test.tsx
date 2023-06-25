import React, { useEffect } from 'react';
import PayArticle from '../components/PayArticle';
// import { fetchFeatureDealDates } from './Finance/utils';

const Test: React.FC = () => {
  useEffect(() => {
    // fetchOpDealDate('2023-07', 'io2306').then((res) => {
    //   console.log(res);
    // });
    // fetchFeatureDealDates().then(console.log);
  }, []);
  return <PayArticle />;
};

export default Test;
