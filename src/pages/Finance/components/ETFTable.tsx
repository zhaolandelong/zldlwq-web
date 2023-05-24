import React from 'react';
import { Table, Typography } from 'antd';
import type { ETFPriceInfo } from '../types';
import type { ColumnType } from 'antd/es/table';

const { Title } = Typography;

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
    render: (price) => `¥ ${price.toFixed(3)}`,
  },
];

const ETFTable: React.FC<{ dataSource: ETFPriceInfo[]; fetchTime: string }> = (
  props
) => (
  <>
    <Title level={2}>ETF Info ({props.fetchTime})</Title>
    <Table
      size="small"
      columns={columns}
      dataSource={props.dataSource}
      rowKey="code"
      pagination={false}
    />
  </>
);

export default ETFTable;
