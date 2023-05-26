import React, { useEffect } from 'react';
import { fetchCffex } from './Finance/utils';

const Test: React.FC = () => {
  useEffect(() => {
    // fetchOpDealDate('2023-07', 'io2306').then((res) => {
    //   console.log(res);
    // });
    fetchCffex(2).then(console.log);
  }, []);
  return <h1>Test</h1>;
};

export default Test;
