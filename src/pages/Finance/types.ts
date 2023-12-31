export interface StockInfo {
  code: string;
  name: string;
  sCode: string;
  price: number;
  lastClosePrice: number;
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

export interface IndexOpNestData {
  currPrice: number; // 最新价
  strikePrice: number; // 行权价
  PorC: 'C' | 'P'; // 认购认沽标志
  dealDate: string; // 到期日
  remainDays: number; // 剩余天数
  innerValue: number; // 内在价值
  timeValue: number; // 时间价值
}

export interface EtfOpNestData extends IndexOpNestData {
  settlePrice: number; // 昨结算价
  lastClosePrice: number; // 昨收价
}

export interface IndexOpPnCData {
  code: string;
  opCode: string;
  sCode: string;
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

export interface EtfOpPnCData extends Omit<IndexOpPnCData, 'opCode'> {
  stockLastClosePrice: number;
  settlePriceC: number;
  settlePriceP: number;
}

export interface DealDate {
  expireDay: string | null;
  remainderDays: number;
}

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
  additionTimes: number; // 加仓次数
  firstAdditionPrice: number; // 首次加仓价
  etfErrorCount: number; // ETF 误差调整
  opErrorCount: number; // OP 误差调整
}

export interface ETFPosInfo extends InvestBaseInfo {
  name: string;
  investMonths: number; // 投资月数
  avgCost: number; // 平均成本 - 取 n 月均线的收盘价
  realInvestment: number; // 较精确计算，总投入
  realCount: number; // 较精确计算，总持仓
  actualReturnRate: number; // 实际年化收益率
  price: number;
  additionPrice: number; // 下次加仓价格
}
