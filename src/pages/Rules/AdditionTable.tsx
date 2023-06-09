import React from 'react';
import { Table, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';

const { Text, Title } = Typography;

// 2023-04-09 Data
const rate = 13 / 12.21; // 000300 PE 12.21
const etfInfos = [
  {
    name: '沪深300',
    code: '510300',
    price: 4.117,
  },
  {
    name: '上证50',
    code: '510050',
    price: 2.689,
  },
  {
    name: '红利',
    code: '510880',
    price: 2.912,
  },
  {
    name: '中证500',
    code: '510500',
    price: 6.475,
  },
  {
    name: '创业板',
    code: '159915',
    price: 2.369,
  },
];

interface Record {
  name: string;
  code: string;
  price: number;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  p5: number;
  p6: number;
}

const columns: ColumnType<Record>[] = [
  {
    title: 'ETF',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 80,
  },
  {
    title: '第 1 次',
    dataIndex: 'p1',
    key: 'p1',
    align: 'right',
    render: (p1) => `¥ ${p1.toFixed(3)}`,
  },
  {
    title: '第 2 次',
    dataIndex: 'p2',
    key: 'p2',
    align: 'right',
    render: (p2) => `¥ ${p2.toFixed(3)}`,
  },
  {
    title: '第 3 次',
    dataIndex: 'p3',
    key: 'p3',
    align: 'right',
    render: (p3) => `¥ ${p3.toFixed(3)}`,
  },
  {
    title: '第 4 次',
    dataIndex: 'p4',
    key: 'p4',
    align: 'right',
    render: (p4) => `¥ ${p4.toFixed(3)}`,
  },
  {
    title: '第 5 次',
    dataIndex: 'p5',
    key: 'p5',
    align: 'right',
    render: (p5) => `¥ ${p5.toFixed(3)}`,
  },
  {
    title: '第 6 次',
    dataIndex: 'p6',
    key: 'p6',
    align: 'right',
    render: (p6) => `¥ ${p6.toFixed(3)}`,
  },
  {
    title: '基准价',
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    render: (price) => `¥ ${price.toFixed(3)}`,
  },
  {
    title: '代码',
    dataIndex: 'code',
    key: 'code',
  },
];

const dataSource = etfInfos.map(({ name, code, price }) => ({
  name: name,
  code: code,
  price,
  p1: price * rate,
  p2: price * rate * 0.9,
  p3: price * rate * 0.8,
  p4: price * rate * 0.7,
  p5: price * rate * 0.6,
  p6: price * rate * 0.5,
}));

const AdditionTable: React.FC = () => {
  return (
    <>
      <Title level={2} style={{ marginTop: 16 }}>加仓表</Title>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="code"
        pagination={false}
        scroll={{ x: 700 }}
        size="small"
        bordered
      />
      <Text type="secondary">
        <ul>
          <li>2023-04-09 华宝里沪深 300 指数 PE = 12.21</li>
          <li>「基准价」为各 ETF 4.9 号的价格</li>
          <li>第 n 次 = 基准价 / 12.21 * 13 * (1 - 0.1 * (n - 1))</li>
        </ul>
      </Text>
    </>
  );
};

export default AdditionTable;
