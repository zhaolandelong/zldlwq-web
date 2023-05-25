import type { FinanceInfo, ETFPosInfo } from './types';

export const ETF_INFOS: Omit<FinanceInfo, 'price'>[] = [
  {
    code: '510300',
    opCode: 'sh510300',
    name: '沪深300 ETF',
  },
  {
    code: '159915',
    opCode: 'sz159915',
    name: '创业板 ETF',
  },
  {
    code: '510050',
    opCode: 'sh510050',
    name: '上证50 ETF',
  },
  {
    code: '510500',
    opCode: 'sh510500',
    name: '中证500 ETF',
  },
];

export const INDEX_INFOS: Omit<Required<FinanceInfo>, 'price'>[] = [
  {
    code: '000300',
    opCode: 'sh000300',
    name: '沪深300',
    op: 'io',
  },
  // {
  //   code: '399006',
  //   opCode: 'sz399006',
  //   name: '创业板指',
  // },
  {
    code: '000016',
    opCode: 'sh000016',
    name: '上证50',
    op: 'ho',
  },
  // {
  //   code: '000905',
  //   opCode: 'sh000905',
  //   name: '中证500',
  // },
  {
    code: '000852',
    opCode: 'sh000852',
    name: '中证1000',
    op: 'mo',
  },
];

export const DEFAULT_ETF_CODES = ['510300', '159915'];

export const etfPosInfos: ETFPosInfo[] = [
  {
    code: '510300',
    opCode: 'sh510300',
    startDate: '2021-11-01',
    monthlyAmount: 25000,
    expectedReturnRate: 0.1,
    scalingMutiple: 3,
  },
  {
    code: '159915',
    opCode: 'sz159915',
    startDate: '2021-11-01',
    monthlyAmount: 25000,
    expectedReturnRate: 0.15,
    scalingMutiple: 3,
  },
];
