import type { ColumnType } from 'antd/es/table';
import type { ETFPriceInfo, ETFPosInfo, InvestInfo, OptionInfo } from './types';
import { ColumnFilterItem } from 'antd/es/table/interface';

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

export const getOptionColumns = (
  codeFilters: ColumnFilterItem[]
): ColumnType<OptionInfo>[] => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
    filters: codeFilters,
    onFilter: (value, record) => value === record.code,
  },
  {
    title: 'Month',
    dataIndex: 'month',
    key: 'month',
    sorter: (a, b) => Number(a.month) - Number(b.month),
  },
  {
    title: 'Strike Price',
    dataIndex: 'strikePrice',
    key: 'strikePrice',
    sorter: (a, b) => a.strikePrice - b.strikePrice,
    render: (price) => `¥ ${price.toFixed(3)}`,
  },
  {
    title: 'Time Value (P)',
    dataIndex: 'timeValueP',
    key: 'timeValueP',
    sorter: (a, b) => a.timeValueP - b.timeValueP,
    render: (price) => `¥ ${price.toFixed(3)}`,
  },
  {
    title: 'Time Value (C)',
    dataIndex: 'timeValueC',
    key: 'timeValueC',
    sorter: (a, b) => a.timeValueC - b.timeValueC,
    render: (price) => `¥ ${price.toFixed(3)}`,
  },
  {
    title: 'Value Diff (1 hand)',
    sorter: (a, b) => a.timeValueP - a.timeValueC - b.timeValueP + b.timeValueC,
    render: (text, record) =>
      `¥ ${((record.timeValueP - record.timeValueC) * 10000).toFixed(2)}`,
  },
  {
    title: 'Remain Days',
    dataIndex: 'remainDays',
    key: 'remainDays',
    sorter: (a, b) => a.remainDays - b.remainDays,
    render: (d) => `${d} days`,
  },
  {
    title: 'Diff / Days',
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays -
      (b.timeValueP - b.timeValueC) / b.remainDays,
    render: (text, record) =>
      `¥ ${(
        ((record.timeValueP - record.timeValueC) * 10000) /
        record.remainDays
      ).toFixed(2)}`,
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
    render: (price) => `¥ ${price}`,
  },
  {
    title: 'Option Hands',
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
    title: 'Scaling Option Hands',
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
