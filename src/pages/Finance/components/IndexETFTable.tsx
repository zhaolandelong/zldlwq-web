import React from 'react';
import { Table, Typography } from 'antd';
import type { StockInfo } from '../types';
import type { ColumnType } from 'antd/es/table';

const { Title } = Typography;

interface StockData {
  index: StockInfo;
  etf: StockInfo;
}

const columns: ColumnType<StockData>[] = [
  {
    title: '名称',
    key: 'name',
    render: (_, r) => r.index.name,
  },
  {
    title: '股指点数',
    key: 'point',
    align: 'center',
    render: (_, r) => r.index.price.toFixed(2),
  },
  {
    title: 'ETF 价格',
    key: 'etfPrice',
    align: 'center',
    render: (_, r) => `¥${r.etf.price.toFixed(3)}`,
  },
  {
    title: '股指/ETF比值',
    key: 'rate',
    align: 'center',
    render: (_, r) => Math.round(r.index.price / r.etf.price),
  },
];

const IndexETFTable: React.FC<{
  indexData: StockInfo[];
  etfData: StockInfo[];
}> = (props) => {
  const { indexData, etfData } = props;

  const dataSource: StockData[] = [];
  indexData.forEach((item) => {
    const etf = etfData.find((i) => i.name === item.name) as StockInfo;
    dataSource.push({
      index: item,
      etf,
    });
  });

  return (
    <>
      <Title level={2}>股指/ETF 信息</Title>
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        rowKey={(r) => r.index.code}
        pagination={false}
      />
    </>
  );
};

export default IndexETFTable;
