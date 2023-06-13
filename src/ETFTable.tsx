import React from 'react';
import { Table } from 'antd';
import type { ETFPriceInfo } from './types';
import type { ColumnType } from 'antd/es/table';

const columns: ColumnType<ETFPriceInfo>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Current Price',
    dataIndex: 'price',
    key: 'price',
    render: (price) => `¥ ${price}`,
  },
];

const ETFTable: React.FC<{ dataSource: ETFPriceInfo[]; fetchTime: string }> = (
  props
) => (
  <>
    <h2>ETF Info ({props.fetchTime})</h2>
    <Table
      columns={columns}
      dataSource={props.dataSource}
      rowKey="code"
      pagination={false}
    />
  </>
);

export default ETFTable;
