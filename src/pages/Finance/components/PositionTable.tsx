import React from 'react';
import { Table, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { ETFPosInfo } from '../types';

const { Title, Text } = Typography;

const columns: ColumnType<ETFPosInfo>[] = [
  {
    title: 'ETF',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 110,
    render: (name, r) => (
      <>
        <div>{name}</div>
        <div style={{ color: '#f00' }}>¥{r.price}</div>
      </>
    ),
  },
  {
    title: '收益率',
    dataIndex: 'actualReturnRate',
    key: 'actualReturnRate',
    align: 'center',
    render: (rate, r) => (
      <>
        <div>{rate.toFixed(2)}%</div>
        <div style={{ color: '#f00' }}>{r.investMonths}个月</div>
      </>
    ),
  },
  {
    title: (
      <div>
        估算卖价
        <br />
        估算成本
      </div>
    ),
    dataIndex: 'avgCost',
    key: 'avgCost',
    align: 'center',
    render: (cost, r) => (
      <>
        <div>¥{((1 + r.actualReturnRate / 100) * cost).toFixed(3)}</div>
        <div style={{ color: '#f00' }}>¥{cost.toFixed(3)}</div>
      </>
    ),
  },
  {
    title: '定投期权/ETF',
    dataIndex: 'fixedOpCount',
    key: 'fixedOpCount',
    width: 140,
    render: (count, r) => (
      <>
        <div>
          {count} OP/{r.fixedEtfCount} ETF
        </div>
        <div style={{ color: '#f00' }}>
          {count + 1} OP/{r.fixedEtfCount - 10000} ETF
        </div>
      </>
    ),
  },
  {
    title: (
      <div>
        加仓价格
        <br />
        加仓次数
      </div>
    ),
    key: 'additionTime',
    align: 'center',
    render: (_, r) => (
      <>
        <div>¥{r.additionPrice.toFixed(3)}</div>
        <div style={{ color: '#f00' }}>{r.additionTime}次</div>
      </>
    ),
  },
  {
    title: '加仓期权/ETF',
    dataIndex: 'additionOpCount',
    key: 'additionOpCount',
    width: 140,
    render: (count, r) => (
      <>
        <div>
          {count} OP/{r.additionEtfCount} ETF
        </div>
        <div style={{ color: '#f00' }}>
          {count + 1} OP/{r.additionEtfCount - 10000} ETF
        </div>
      </>
    ),
  },
  {
    title: (
      <div>
        精算卖价
        <br />
        精算成本
      </div>
    ),
    dataIndex: 'avgCost2',
    key: 'avgCost2',
    align: 'center',
    render: (cost, r) => (
      <>
        <div>¥{((1 + r.actualReturnRate / 100) * cost).toFixed(3)}</div>
        <div style={{ color: '#f00' }}>¥{cost.toFixed(3)}</div>
      </>
    ),
  },
];

const PositionTable: React.FC<{
  loading: boolean;
  dataSource: ETFPosInfo[];
}> = (props) => (
  <>
    <Title level={2}>基础指标</Title>
    <Table
      size="small"
      columns={columns}
      dataSource={props.dataSource}
      rowKey="sCode"
      scroll={{ x: 750 }}
      loading={props.loading}
      bordered
      pagination={false}
    />
    <Text type="secondary">
      <ul>
        <li>估算成本：上个月 n 月均线价格</li>
        <li>
          精算成本：根据月定投额和每月开盘价，算出每月买入份数；求和（每月份数 *
          每月开盘价）；求和（每月买入分数）；二者相除
        </li>
        <li>
          加仓价格：想知道怎么算的？去彩蛋里看看吧
        </li>
      </ul>
    </Text>
  </>
);

export default PositionTable;
