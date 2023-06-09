import React from 'react';
import { Table, Typography } from 'antd';
import type { StockInfo } from '../types';
import type { ColumnType } from 'antd/es/table';

const { Title } = Typography;

const columns: ColumnType<StockInfo>[] = [
  {
    title: '股指',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '代码',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '点数',
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    render: (price) => price.toFixed(2),
  },
];

const IndexTable: React.FC<{ dataSource: StockInfo[]; }> = (
  props
) => {
  const { dataSource } = props;

  return (
    <>
      <Title level={2}>股指信息</Title>
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

export default IndexTable;
