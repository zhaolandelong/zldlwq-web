import React from 'react';
import { Table, Typography } from 'antd';
import type { FinanceInfo } from '../types';
import type { ColumnType } from 'antd/es/table';

const { Title } = Typography;

const columns: ColumnType<FinanceInfo>[] = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '代码',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '价格',
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    render: (price) => `¥ ${price.toFixed(3)}`,
  },
];

const ETFTable: React.FC<{ dataSource: FinanceInfo[]; fetchTime: string }> = (
  props
) => {
  const { dataSource, fetchTime } = props;

  return (
    <>
      <Title level={2}>ETF 信息({fetchTime})</Title>
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

export default ETFTable;
