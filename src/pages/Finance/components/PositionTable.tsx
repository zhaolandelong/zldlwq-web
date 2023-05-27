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
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '开始日期',
    dataIndex: 'startDate',
    key: 'startDate',
  },
  {
    title: '已投（月）',
    dataIndex: 'investMonths',
    key: 'investMonths',
  },
  {
    title: '平均成本',
    dataIndex: 'avgCost',
    key: 'avgCost',
    render: (avgCost) => `¥ ${avgCost.toFixed(3)}`,
  },
  {
    title: '预期收益率',
    dataIndex: 'expectedReturnRate',
    key: 'expectedReturnRate',
    render: (rate) => `${rate * 100}%`,
  },
  {
    title: '年化收益率',
    dataIndex: 'actualReturnRate',
    key: 'actualReturnRate',
    render: (rate) => `${rate * 100}%`,
  },
  {
    title: '收益价格',
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
      etfPosInfos.map((info) => fetchAvgPrice(info.sCode, info.startDate))
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
