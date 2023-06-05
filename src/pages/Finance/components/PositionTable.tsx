import React, { useEffect, useState } from 'react';
import { Table, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { ETF_INFOS } from '../constants';
import { fetchAvgPrice, fetchAvgPrice2 } from '../services';
import moment from 'moment';
import { getAnualReturnRate, getEtfOpCount } from '../utils';
import { InvestBaseInfo, StockInfo } from '../types';

const { Title, Text } = Typography;

interface ETFPosInfo extends InvestBaseInfo {
  name: string;
  investMonths: number; // 投资月数
  avgCost: number; // 平均成本 - 取 n 月均线的收盘价
  avgCost2: number; // 平均成本2 - 较精确计算，总投入 / 总持仓
  actualReturnRate: number; // 实际年化收益率
  price: number;
  fixedOpCount: number;
  fixedEtfCount: number;
  additionOpCount: number;
  additionEtfCount: number;
}

const columns: ColumnType<ETFPosInfo>[] = [
  {
    title: 'ETF',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 110,
    render: (name, record) => (
      <>
        <div>{name}</div>
        <div style={{ color: '#f00' }}>{record.investMonths} 个月</div>
      </>
    ),
  },
  {
    title: '收益率',
    dataIndex: 'actualReturnRate',
    key: 'actualReturnRate',
    render: (rate, record) => (
      <>
        <div>{(rate * 100).toFixed(2)}%</div>
        <div style={{ color: '#f00' }}>
          {(record.expectedReturnRate * 100).toFixed(2)}%
        </div>
      </>
    ),
  },
  {
    title: '估算成本/卖价',
    dataIndex: 'avgCost',
    key: 'avgCost',
    align: 'right',
    render: (cost, record) => (
      <>
        <div>¥ {cost.toFixed(3)}</div>
        <div style={{ color: '#f00' }}>
          ¥ {((1 + record.actualReturnRate) * cost).toFixed(3)}
        </div>
      </>
    ),
  },
  {
    title: '定投期权/ETF',
    dataIndex: 'fixedOpCount',
    key: 'fixedOpCount',
    align: 'center',
    width: 130,
    render: (count, record) => (
      <>
        <div>
          {count} OP / {record.fixedEtfCount} ETF
        </div>
        <div style={{ color: '#f00' }}>
          {count + 1} OP / {record.fixedEtfCount - 10000} ETF
        </div>
      </>
    ),
  },
  {
    title: '精算成本/卖价',
    dataIndex: 'avgCost2',
    key: 'avgCost2',
    align: 'right',
    render: (cost, record) => (
      <>
        <div>¥ {cost.toFixed(3)}</div>
        <div style={{ color: '#f00' }}>
          ¥ {((1 + record.actualReturnRate) * cost).toFixed(3)}
        </div>
      </>
    ),
  },
  {
    title: '加仓期权 / ETF',
    dataIndex: 'additionOpCount',
    key: 'additionOpCount',
    align: 'center',
    width: 130,
    render: (count, record) => (
      <>
        <div>
          {count} OP / {record.additionEtfCount} ETF
        </div>
        <div style={{ color: '#f00' }}>
          {count + 1} OP / {record.additionEtfCount - 10000} ETF
        </div>
      </>
    ),
  },
];

const PositionTable: React.FC<{
  investInfos: InvestBaseInfo[];
  eftPriceInfos: StockInfo[];
}> = (props) => {
  const { investInfos, eftPriceInfos } = props;
  const [dataSource, setDataSource] = useState<ETFPosInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all(
      investInfos.map((info) =>
        Promise.all([
          fetchAvgPrice(info.sCode, info.startDate),
          fetchAvgPrice2(info.sCode, info.startDate, info.monthlyAmount),
        ])
      )
    )
      .then((avgPricesArr) => {
        const posDataSource: ETFPosInfo[] = investInfos.map((info, index) => {
          const investMonths = moment().diff(info.startDate, 'month') + 1;
          const actualReturnRate = getAnualReturnRate(
            info.expectedReturnRate,
            investMonths
          );
          const price =
            eftPriceInfos.find((item) => item.sCode === info.sCode)?.price ?? 0;
          const avgPrices = avgPricesArr[index];
          const monthlyCount = getEtfOpCount(info.monthlyAmount, price);
          const additionCount = getEtfOpCount(
            info.monthlyAmount * info.additionMutiple,
            price
          );
          return {
            ...info,
            name:
              ETF_INFOS.find((item) => item.sCode === info.sCode)?.name ??
              info.sCode,
            investMonths,
            avgCost: avgPrices[0],
            avgCost2: avgPrices[1],
            actualReturnRate,
            price,
            fixedOpCount: monthlyCount.optionCount,
            fixedEtfCount: monthlyCount.etfCount,
            additionOpCount: additionCount.optionCount,
            additionEtfCount: additionCount.etfCount,
          };
        });
        setDataSource(posDataSource);
      })
      .finally(() => setLoading(false));
  }, [investInfos, eftPriceInfos]);

  return (
    <>
      <Title level={2}>Position Info</Title>
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        rowKey="sCode"
        scroll={{ x: 620 }}
        loading={loading}
        bordered
        pagination={false}
      />
       <Text type="secondary">
        <ul>
          <li>估算成本：上个月 n 月均线价格</li>
          <li>精算成本：根据月定投额和每月开盘价，算出每月买入份数；求和（每月份数 * 每月开盘价）；求和（每月买入分数）；二者相除</li>
        </ul>
      </Text>
    </>
  );
};

export default PositionTable;
