export interface FinanceInfo {
  code: string;
  name: string;
  opCode: string;
  price: number;
}

export interface IndexOpInfo extends FinanceInfo {
  op: string;
  feat: string;
}

export interface ETFPosInfo {
  code: string; // ETF 代码
  opCode: string; // 完整代码
  name?: string; // ETF 名称
  startDate: string; // 开始定投日期（打底仓的月份要折算进去）
  investMonths?: number; // 投资月数
  avgCost?: number; // 平均成本
  expectedReturnRate: number; // 预期年化收益率
  actualReturnRate?: number; // 实际年化收益率
  expectedReturnPrice?: number; // 预期收益价格
  monthlyAmount: number; // 月定投额
  scalingMutiple: number; // 加仓额是月定投额的倍数
}

export interface InvestInfo {
  code: string;
  name: string;
  price: number;
  monthlyAmount: number;
  optionCount: number;
  etfCount: number;
  scalingOptionCount: number;
  scalingEtfCount: number;
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

export type FeatureDealDate = Record<string, string>; // { MO2309: 20230915 }