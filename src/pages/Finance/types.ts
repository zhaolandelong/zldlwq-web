export interface StockInfo {
  code: string;
  name: string;
  sCode: string;
  price: number;
}

export interface IndexOpInfo {
  code: string;
  name: string;
  op: string;
}

export interface IndexFeatInfo {
  code: string;
  name: string;
  feat: string;
  pointPrice: number;
}

export interface OptionNestData {
  currPrice: number;
  strikePrice: number;
  PorC: 'C' | 'P';
  dealDate: string;
  remainDays: number;
  innerValue: number;
  timeValue: number;
}

export interface OptionPnCData {
  code: string;
  name: string;
  month: string;
  isPrimary: boolean;
  stockPrice: number;
  strikePrice: number;
  dealDate: string;
  remainDays: number;
  currPriceP: number;
  currPriceC: number;
  innerValueP: number;
  innerValueC: number;
  timeValueP: number;
  timeValueC: number;
}

export interface DealDate {
  expireDay: string | null;
  remainderDays: number;
}

export type ProdDealDateKV = Record<string, string>; // { MO2309: 20230915 }

export interface FeatureData extends IndexFeatInfo {
  featCode: string; // IF2306
  point: number;
  discount: number;
  remainDays: number;
}

export interface InvestBaseInfo {
  sCode: string;
  startDate: string;
  expectedReturnRate: number;
  monthlyAmount: number;
  additionMutiple: number;
}