import type {
  StockInfo,
  InvestBaseInfo,
  IndexFeatInfo,
  IndexOpInfo,
} from './types';

export const ETF_INFOS: Omit<StockInfo, 'price'>[] = [
  {
    code: '510300',
    sCode: 'sh510300',
    name: '沪深300',
  },
  {
    code: '159915',
    sCode: 'sz159915',
    name: '创业板',
  },
  {
    code: '510050',
    sCode: 'sh510050',
    name: '上证50',
  },
  {
    code: '510500',
    sCode: 'sh510500',
    name: '中证500',
  },
  // {
  //   code: '512100',
  //   sCode: 'sh512100',
  //   name: '中证1000',
  // },
];

export const INDEX_INFOS: Omit<StockInfo, 'price'>[] = [
  {
    code: '000300',
    sCode: 'sh000300',
    name: '沪深300',
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
  },
  {
    code: '000905',
    sCode: 'sh000905',
    name: '中证500',
  },
  {
    code: '000852',
    sCode: 'sh000852',
    name: '中证1000',
  },
];

export const INDEX_OP_INFOS: IndexOpInfo[] = [
  {
    code: '000300',
    name: '沪深300',
    op: 'IO',
  },
  {
    code: '000016',
    name: '上证50',
    op: 'HO',
  },
  {
    code: '000852',
    name: '中证1000',
    op: 'MO',
  },
];

export const INDEX_FEAT_INFOS: IndexFeatInfo[] = [
  {
    code: '000300',
    name: '沪深300',
    feat: 'IF',
    pointPrice: 300,
  },
  {
    code: '000016',
    name: '上证50',
    feat: 'IH',
    pointPrice: 300,
  },
  {
    code: '000905',
    name: '中证500',
    feat: 'IC',
    pointPrice: 200,
  },
  {
    code: '000852',
    name: '中证1000',
    feat: 'IM',
    pointPrice: 200,
  },
];

export const DEFAULT_CODES = ['510300', '159915', '000300'];

