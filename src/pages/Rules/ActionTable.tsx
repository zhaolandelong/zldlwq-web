import React from 'react';
import { Table, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';

const { Title, Text } = Typography;

interface Record {
  type: string;
  moment: string;
  date?: string;
  actions: string[];
  remarks: string;
}

const columns: ColumnType<Record>[] = [
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 90,
  },
  {
    title: '时机',
    dataIndex: 'moment',
    key: 'moment',
    width: 170,
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions',
    width: 330,
    render: (actions: string[]) => (
      <ol style={{ margin: 0 }}>
        {actions.map((action, i) => (
          <li key={i}>{action}</li>
        ))}
      </ol>
    ),
  },
  {
    title: '备注',
    dataIndex: 'remarks',
    key: 'remarks',
    width: 200,
  },
];

const dataSource: Record[] = [
  {
    type: '定投',
    moment: '每月第 1 个交易日',
    actions: ['合成多头开仓（30天，主力）', '调整 ETF'],
    remarks: '如果是用合成多头置换 ETF，买购开仓可以等卖 1',
  },
  {
    type: '加仓',
    date: ``,
    moment: '卖沽到期前 5 日，现价 < 行权价 5% 左右',
    actions: [
      '卖沽买1平仓',
      '合成多头开仓（30 天，主力）',
      '调整 ETF',
      '卖购开仓（90 天，卖沽行权价*1.1）',
      '卖沽开仓（90 天，卖沽行权价*0.9）',
    ],
    remarks: '金额为 3 个月定投额',
  },
  {
    type: '减仓',
    date: ``,
    moment: '现价 > 卖购行权价',
    actions: ['买购卖1平仓', '卖沽平仓', '卖购平仓'],
    remarks: '也可能是清仓操作',
  },
  {
    type: '多头置换',
    date: ``,
    moment: '合成多头到期前 5~7 天',
    actions: [
      '原买购卖1平仓',
      '新买购开仓（30 天，主力）',
      '原卖沽买1平仓',
      '新卖沽开仓（30 天，主力）',
    ],
    remarks: '',
  },
  {
    type: '卖购置换',
    date: ``,
    moment: '卖购到期',
    actions: [
      '等过期',
      '汇总合成多头，计算成本及预期收益价格',
      '卖购开仓（90 天，预期收益价格）',
    ],
    remarks: '若没有相应的行权价，则放弃开仓',
  },
  {
    type: '卖沽置换',
    date: ``,
    moment: '卖沽到期',
    actions: ['等过期，重开（90 天，原行权价）'],
    remarks: '参考加仓表',
  },
];

const ActionTable: React.FC = () => {
  return (
    <>
      <Title level={2}>操作规则</Title>
      <Text type="warning">注意：以下内容只是基于个人理解，仅供参考。</Text>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="code"
        pagination={false}
        scroll={{ x: 800 }}
        size="small"
        bordered
      />
    </>
  );
};

export default ActionTable;
