import type {
  StockInfo,
  IndexInfo,
  InvestBaseInfo,
} from './types';

export const ETF_INFOS: (Omit<StockInfo, 'price'> & { hasOp: boolean })[] = [
  {
    code: '510300',
    sCode: 'sh510300',
    name: '沪深300',
    hasOp: true,
  },
  {
    code: '159915',
    sCode: 'sz159915',
    name: '创业板',
    hasOp: true,
  },
  {
    code: '510050',
    sCode: 'sh510050',
    name: '上证50',
    hasOp: true,
  },
  {
    code: '510500',
    sCode: 'sh510500',
    name: '中证500',
    hasOp: true,
  },
  {
    code: '512100',
    sCode: 'sh512100',
    name: '中证1000',
    hasOp: false,
  },
];

export const INDEX_INFOS: IndexInfo[] = [
  {
    code: '000300',
    sCode: 'sh000300',
    name: '沪深300',
    op: 'IO',
    feat: 'IF',
    featPointPrice: 300,
  },
  {
    code: '399006',
    sCode: 'sz399006',
    name: '创业板',
  },
  {
    code: '000016',
    sCode: 'sh000016',
    name: '上证50',
    op: 'HO',
    feat: 'IH',
    featPointPrice: 300,
  },
  {
    code: '000905',
    sCode: 'sh000905',
    name: '中证500',
    feat: 'IC',
    featPointPrice: 200,
  },
  {
    code: '000852',
    sCode: 'sh000852',
    name: '中证1000',
    op: 'MO',
    feat: 'IM',
    featPointPrice: 200,
  },
];

export const DEFAULT_CODES = ['510300', '159915', '000300'];

export const STORAGE_KEY = '1to10-local-storage';

export const DEFAULT_INVEST_INFOS: InvestBaseInfo[] = [
  {
    sCode: 'sh510300',
    startDate: '2021-11-01',
    monthlyAmount: 25000,
    expectedReturnRate: 10,
    additionMutiple: 3,
  },
  {
    sCode: 'sz159915',
    startDate: '2021-11-01',
    monthlyAmount: 25000,
    expectedReturnRate: 15,
    additionMutiple: 3,
  },
];
