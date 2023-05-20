import type { ColumnType } from 'antd/es/table';
import type { ETFPriceInfo, ETFPosInfo, InvestInfo } from './types';

export const etfInfos: ETFPosInfo[] = [
  {
    code: 'sh510300',
    startDate: '2021-11-01',
    monthlyAmount: 25000,
    expectedReturnRate: 0.1,
    scalingMutiple: 3,
  },
  {
    code: 'sz159915',
    startDate: '2021-11-01',
    monthlyAmount: 25000,
    expectedReturnRate: 0.15,
    scalingMutiple: 3,
  },
];

export const etfColumns: ColumnType<ETFPriceInfo>[] = [
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
    render: (price) => `¥ ${price}`,
  },
];

export const positionCloumns: ColumnType<ETFPosInfo>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
  },
  {
    title: 'Invest Months',
    dataIndex: 'investMonths',
    key: 'investMonths',
  },
  {
    title: 'Avg Cost',
    dataIndex: 'avgCost',
    key: 'avgCost',
    render: (avgCost) => `¥ ${avgCost.toFixed(3)}`,
  },
  {
    title: 'Expected Rate',
    dataIndex: 'expectedReturnRate',
    key: 'expectedReturnRate',
    render: (rate) => `${rate * 100}%`,
  },
  {
    title: 'Actual Rate',
    dataIndex: 'actualReturnRate',
    key: 'actualReturnRate',
    render: (rate) => `${rate * 100}%`,
  },
  {
    title: 'Expected Return Price',
    dataIndex: 'expectedReturnPrice',
    key: 'expectedReturnPrice',
    render: (price) => `¥ ${price.toFixed(3)}`,
  },
];

export const investColumns: ColumnType<InvestInfo>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Current Price',
    dataIndex: 'price',
    key: 'price',
    render: (price) => `¥ ${price}`,
  },
  {
    title: 'Monthly Amount',
    dataIndex: 'monthlyAmount',
    key: 'monthlyAmount',
  },
  {
    title: 'Option Count',
    dataIndex: 'optionCount',
    key: 'optionCount',
    render: (count) => `${count} OR (${count + 1})`,
  },
  {
    title: 'ETF Count',
    dataIndex: 'etfCount',
    key: 'etfCount',
    render: (count) => `${count} OR (${count - 10000})`,
  },
  {
    title: 'Scaling Option Count',
    key: 'scalingOptionCount',
    dataIndex: 'scalingOptionCount',
    render: (count) => `${count} OR (${count + 1})`,
  },
  {
    title: 'Scaling ETF Count',
    key: 'scalingEtfCount',
    dataIndex: 'scalingEtfCount',
    render: (count) => `${count} OR (${count - 10000})`,
  },
];
