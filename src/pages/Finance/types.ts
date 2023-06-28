export interface StockInfo {
  code: string;
  name: string;
  sCode: string;
  price: number;
}
export interface IndexInfo {
  code: string;
  name: string;
  sCode: string;
  // price: number;
  op?: string;
  feat?: string;
  featPointPrice?: number;
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

export interface FeatureData extends Required<IndexInfo> {
  featCode: string; // IF2306
  point: number;
  discount: number;
  remainDays: number;
}

export interface InvestBaseInfo {
  id?: string;
  sCode: string;
  startDate: string;
  expectedReturnRate: number;
  monthlyAmount: number;
  additionMutiple: number;
  additionTime: number;
}

export interface ETFPosInfo extends InvestBaseInfo {
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
  additionPrice: number;
}