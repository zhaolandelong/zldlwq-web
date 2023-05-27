import type { FinanceInfo, ETFPosInfo, IndexOpInfo } from './types';

export const ETF_INFOS: Omit<FinanceInfo, 'price'>[] = [
  {
    code: '510300',
    sCode: 'sh510300',
    name: '沪深300 ETF',
  },
  {
    code: '159915',
    sCode: 'sz159915',
    name: '创业板 ETF',
  },
  {
    code: '510050',
    sCode: 'sh510050',
    name: '上证50 ETF',
  },
  {
    code: '510500',
    sCode: 'sh510500',
    name: '中证500 ETF',
  },
];

export const INDEX_INFOS: Omit<IndexOpInfo, 'price'>[] = [
  {
    code: '000300',
    sCode: 'sh000300',
    name: '沪深300',
    op: 'IO',
    feat: 'IF',
  },
  {
    code: '000016',
    sCode: 'sh000016',
    name: '上证50',
    op: 'HO',
    feat: 'IH',
  },
  {
    code: '000852',
    sCode: 'sh000852',
    name: '中证1000',
    op: 'MO',
    feat: 'IM',
  },
];

export const INDEX_OP_INFOS = [
  {
    code: '000300',
    sCode: 'sh000300',
    name: '沪深300',
    op: 'IO',
  },
  {
    code: '000016',
    sCode: 'sh000016',
    name: '上证50',
    op: 'HO',
  },
  {
    code: '000852',
    sCode: 'sh000852',
    name: '中证1000',
    op: 'MO',
  },
];

export const INDEX_FEAT_INFOS = [
  {
    code: '000300',
    sCode: 'sh000300',
    name: '沪深300',
    feat: 'IF',
  },
  {
    code: '000016',
    sCode: 'sh000016',
    name: '上证50',
    feat: 'IH',
  },
  {
    code: '510500',
    sCode: 'sh510500',
    name: '中证500',
    feat: 'IC',
  },
  {
    code: '000852',
    sCode: 'sh000852',
    name: '中证1000',
    feat: 'IM',
  },
];

export const DEFAULT_CODES = ['510300', '159915', '000300'];

export const etfPosInfos: ETFPosInfo[] = [
  {
    code: '510300',
    sCode: 'sh510300',
    startDate: '2021-11-01',
    monthlyAmount: 25000,
    expectedReturnRate: 0.1,
    scalingMutiple: 3,
  },
  {
    code: '159915',
    sCode: 'sz159915',
    startDate: '2021-11-01',
    monthlyAmount: 25000,
    expectedReturnRate: 0.15,
    scalingMutiple: 3,
  },
];
