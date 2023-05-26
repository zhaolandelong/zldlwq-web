import React, { useEffect, useState } from 'react';
import { Table, Typography } from 'antd';
import type { ETFPosInfo, FinanceInfo, InvestInfo } from '../types';
import type { ColumnType } from 'antd/es/table';
import { ETF_INFOS } from '../constants';
import { getEtfOpCount } from '../utils';

const { Title } = Typography;

const columns: ColumnType<InvestInfo>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Current Price',
    dataIndex: 'price',
    key: 'price',
    render: (price) => `¥ ${price}`,
  },
  {
    title: 'Monthly Amount',
    dataIndex: 'monthlyAmount',
    key: 'monthlyAmount',
    render: (price) => `¥ ${price}`,
  },
  {
    title: 'Option Hands',
    dataIndex: 'optionCount',
    key: 'optionCount',
    render: (count) => `${count} OR (${count + 1})`,
  },
  {
    title: 'ETF Count',
    dataIndex: 'etfCount',
    key: 'etfCount',
    render: (count) => `${count} OR (${count - 10000})`,
  },
  {
    title: 'Scaling Option Hands',
    key: 'scalingOptionCount',
    dataIndex: 'scalingOptionCount',
    render: (count) => `${count} OR (${count + 1})`,
  },
  {
    title: 'Scaling ETF Count',
    key: 'scalingEtfCount',
    dataIndex: 'scalingEtfCount',
    render: (count) => `${count} OR (${count - 10000})`,
  },
];

const InvestTable: React.FC<{
  etfPriceInfos: FinanceInfo[];
  etfPosInfos: ETFPosInfo[];
}> = (props) => {
  const { etfPriceInfos, etfPosInfos } = props;
  const [dataSource, setDataSource] = useState<InvestInfo[]>([]);

  useEffect(() => {
    const investDataSource: InvestInfo[] = etfPosInfos.map((info) => {
      const price =
        etfPriceInfos.find((priceInfo) => priceInfo.code === info.code)
          ?.price ?? 0;
      const monthlyCount = getEtfOpCount(info.monthlyAmount, price);
      const scalingCount = getEtfOpCount(
        info.monthlyAmount * info.scalingMutiple,
        price
      );
      return {
        code: info.code,
        price,
        name: ETF_INFOS.find((item) => item.code === info.code)?.name ?? '-',
        monthlyAmount: info.monthlyAmount,
        ...monthlyCount,
        scalingOptionCount: scalingCount.optionCount,
        scalingEtfCount: scalingCount.etfCount,
      };
    });
    setDataSource(investDataSource);
  }, [etfPriceInfos, etfPosInfos]);

  return (
    <>
      <Title level={2}>Invest Info</Title>
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        rowKey="code"
        pagination={false}
      />
    </>
  );
};

export default InvestTable;
