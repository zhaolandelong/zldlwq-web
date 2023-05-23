import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { ETFPriceInfo, InvestInfo } from './types';
import type { ColumnType } from 'antd/es/table';
import { ETF_INFOS, etfPosInfos } from './constants';
import { getCount } from './utils';

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

const InvestTable = (props: { etfPriceInfos: ETFPriceInfo[] }) => {
  const { etfPriceInfos } = props;
  const [dataSource, setDataSource] = useState<InvestInfo[]>([]);

  useEffect(() => {
    const investDataSource: InvestInfo[] = etfPosInfos.map((info) => {
      const price =
        etfPriceInfos.find((priceInfo) => priceInfo.code === info.code)
          ?.price ?? 0;
      const monthlyCount = getCount(info.monthlyAmount, price);
      const scalingCount = getCount(
        info.monthlyAmount * info.scalingMutiple,
        price
      );
      return {
        code: info.code,
        price,
        name: ETF_INFOS[info.code].name,
        monthlyAmount: info.monthlyAmount,
        ...monthlyCount,
        scalingOptionCount: scalingCount.optionCount,
        scalingEtfCount: scalingCount.etfCount,
      };
    });
    setDataSource(investDataSource);
  }, [etfPriceInfos]);

  return (
    <>
      <h2>Invest Info</h2>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="code"
        pagination={false}
      />
    </>
  );
};

export default InvestTable;
