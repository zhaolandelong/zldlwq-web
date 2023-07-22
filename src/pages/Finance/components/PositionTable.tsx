import React from 'react';
import { Table, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { ETFPosInfo } from '../types';
import { getEtfOpCount, getRealInvestment } from '../utils';
import { renderCell, renderTitle } from '../../../components/CellRender';

const { Title, Text } = Typography;

const columns: ColumnType<ETFPosInfo>[] = [
  {
    title: 'ETF',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 110,
    render: (name, r) => renderCell(name, `¥${r.price}`),
  },
  {
    title: '收益率',
    dataIndex: 'actualReturnRate',
    key: 'actualReturnRate',
    align: 'center',
    render: (rate, r) =>
      renderCell(`${rate.toFixed(2)}%`, `${r.investMonths}个月`),
  },
  {
    title: renderTitle('估算卖价', '估算成本'),
    dataIndex: 'avgCost',
    key: 'avgCost',
    align: 'center',
    render: (cost, r) =>
      renderCell(
        `¥${((1 + r.actualReturnRate / 100) * cost).toFixed(3)}`,
        `¥${cost.toFixed(3)}`
      ),
  },
  {
    title: renderTitle('定投期权数', 'ETF 调整'),
    key: 'fixedOpCount',
    align: 'right',
    render: (_, r) => {
      const { optionCount, etfCount } = getEtfOpCount(
        r.monthlyAmount,
        r.price,
        r.etfCount
      );
      return renderCell(`${optionCount} OP`, `${etfCount} ETF`);
    },
  },
  {
    title: '理论持仓',
    key: 'realCount',
    align: 'right',
    render: (_, r) => {
      const { count } = getRealInvestment(r);
      return renderCell(
        `${Math.floor(count / 10000)} OP`,
        `${count % 10000} ETF`
      );
    },
  },
  {
    title: renderTitle('下次加仓价', '已加仓卖购价'),
    key: 'additionTimes',
    align: 'center',
    render: (_, r) => {
      let sellCallPrice;
      if (r.additionTimes <= 0) {
        sellCallPrice = 0;
      } else {
        sellCallPrice =
          r.firstAdditionPrice * (1 - 0.1 * (r.additionTimes - 2));
      }
      return renderCell(
        `¥${r.additionPrice.toFixed(3)}`,
        `¥${sellCallPrice.toFixed(3)}`
      );
    },
  },
  {
    title: renderTitle('加仓期权数', 'ETF 调整'),
    key: 'additionOpCount',
    align: 'right',
    render: (_, r) => {
      const { optionCount, etfCount } = getEtfOpCount(
        r.monthlyAmount * r.additionMutiple,
        r.additionPrice,
        r.etfCount
      );
      return renderCell(`${optionCount} OP`, `${etfCount} ETF`);
    },
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
      scroll={{ x: 700 }}
      loading={props.loading}
      bordered
      pagination={false}
    />
    <Text type="secondary">
      <ul>
        <li>估算成本：上个月 n 月均线价格</li>
        <li>
          理论持仓：
          <ul>
            <li>
              先取 n 个月，每月首个交易日的开盘价，计算出每月买入 ETF 数量；
            </li>
            <li>再根据加仓次数和首次加仓价格，计算出加仓买入 ETF 的数量；</li>
            <li>二者相加即为理论持仓数量；</li>
            <li>
              特别说明，<Text mark>若有打底仓的情况，数据会出现偏差</Text>
              ，故仅供参考；
            </li>
          </ul>
        </li>
        <li>下次加仓价格：若已加仓 2 次，这里就会显示第 3 次加仓的价格；</li>
        <li>
          已加仓卖购价：此次加仓价上浮 10%。若已加仓 2 次，这里就会显示第 1
          次加仓的价格；
        </li>
      </ul>
    </Text>
  </>
);

export default PositionTable;
