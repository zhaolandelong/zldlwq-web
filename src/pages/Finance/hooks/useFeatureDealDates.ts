import { useEffect, useState } from 'react';
import axios from 'axios';
import { FeatureDealDate } from '../types';

const fetchFeatureDealDates = () =>
  axios
    .get<FeatureDealDate>('http://api.1to10.zldlwq.top/api/cffex')
    .then((res) => res.data);

const useFeatureDealDates = (fetchTime: string) => {
  const [feautreDealDates, setFeatureDealDates] =
    useState<FeatureDealDate>();

  useEffect(() => {
    fetchFeatureDealDates().then(setFeatureDealDates);
  }, [fetchTime]);
  return feautreDealDates; // { MO2309: 20230915 }
};

export default useFeatureDealDates;
