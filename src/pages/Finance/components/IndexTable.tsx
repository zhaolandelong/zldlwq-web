import React from 'react';
import { Table, Typography } from 'antd';
import type { FinanceInfo } from '../types';
import type { ColumnType } from 'antd/es/table';

const { Title } = Typography;

const columns: ColumnType<FinanceInfo>[] = [
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
    title: 'Point',
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    render: (price) => price.toFixed(2),
  },
];

const IndexTable: React.FC<{ dataSource: FinanceInfo[]; fetchTime: string }> = (
  props
) => {
  const { dataSource, fetchTime } = props;

  return (
    <>
      <Title level={2}>股指信息 ({fetchTime})</Title>
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