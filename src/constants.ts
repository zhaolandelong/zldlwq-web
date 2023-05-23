import type { ETFPriceInfo, ETFPosInfo } from './types';

export const DEFAULT_CODES = ['510300', '159915'];

export const ETF_INFOS: Record<string, Omit<ETFPriceInfo, 'price'>> = {
  '510300': {
    code: '510300',
    opCode: 'sh510300',
    name: '沪深300 ETF',
  },
  '159915': {
    code: '159915',
    opCode: 'sz159915',
    name: '创业板 ETF',
  },
  '510050': {
    code: '510050',
    opCode: 'sh510050',
    name: '上证50 ETF',
  },
  '510500': {
    code: '510500',
    opCode: 'sh510500',
    name: '中证500 ETF',
  },
};

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
