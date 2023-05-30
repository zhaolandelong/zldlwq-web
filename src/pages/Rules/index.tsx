import React, { useEffect } from 'react';
import AdditionTable from './AdditionTable';
import ActionTable from './ActionTable';

const Rules: React.FC = () => {
  useEffect(() => {
    // fetchOpDealDate('2023-07', 'io2306').then((res) => {
    //   console.log(res);
    // });
    // fetchFeatureDealDates().then(console.log);
  }, []);
  return (
    <>
      <ActionTable />
      <AdditionTable />
    </>
  );
};

export default Rules;
