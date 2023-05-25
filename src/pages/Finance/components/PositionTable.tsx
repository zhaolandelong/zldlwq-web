import React, { useEffect, useState } from 'react';
import { Table, Typography } from 'antd';
import type { ETFPosInfo } from '../types';
import type { ColumnType } from 'antd/es/table';
import { ETF_INFOS } from '../constants';
import { fetchAvgPrice, getAnualReturnRate } from '../utils';
import moment from 'moment';

const { Title } = Typography;

const columns: ColumnType<ETFPosInfo>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
  },
  {
    title: 'Invest Months',
    dataIndex: 'investMonths',
    key: 'investMonths',
  },
  {
    title: 'Avg Cost',
    dataIndex: 'avgCost',
    key: 'avgCost',
    render: (avgCost) => `¥ ${avgCost.toFixed(3)}`,
  },
  {
    title: 'Expected Rate',
    dataIndex: 'expectedReturnRate',
    key: 'expectedReturnRate',
    render: (rate) => `${rate * 100}%`,
  },
  {
    title: 'Actual Rate',
    dataIndex: 'actualReturnRate',
    key: 'actualReturnRate',
    render: (rate) => `${rate * 100}%`,
  },
  {
    title: 'Expected Return Price',
    dataIndex: 'expectedReturnPrice',
    key: 'expectedReturnPrice',
    render: (price) => `¥ ${price.toFixed(3)}`,
  },
];

const PositionTable: React.FC<{ etfPosInfos: ETFPosInfo[] }> = (props) => {
  const { etfPosInfos } = props;
  const [dataSource, setDataSource] = useState<ETFPosInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all(
      etfPosInfos.map((info) => fetchAvgPrice(info.opCode, info.startDate))
    )
      .then((avgPriceArr) => {
        const posDataSource: ETFPosInfo[] = etfPosInfos.map((info, index) => {
          const investMonths = moment().diff(info.startDate, 'month') + 1;
          const actualReturnRate = getAnualReturnRate(
            info.expectedReturnRate,
            investMonths
          );
          return {
            ...info,
            name: ETF_INFOS.find((item) => item.code === info.code)?.name,
            investMonths,
            avgCost: avgPriceArr[index],
            actualReturnRate: actualReturnRate,
            expectedReturnPrice: avgPriceArr[index] * (1 + actualReturnRate),
          };
        });
        setDataSource(posDataSource);
      })
      .finally(() => setLoading(false));
  }, [etfPosInfos]);

  return (
    <>
      <Title level={2}>Position Info</Title>
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        rowKey="code"
        loading={loading}
        pagination={false}
      />
    </>
  );
};

export default PositionTable;
