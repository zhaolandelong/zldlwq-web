import { jsonpPromise } from '../../request';
import { fetchXueqiu } from '../../services';

export interface HKStaggingItem {
  actissqty: number; // 招股数
  allotment_result_date?: any;
  apply_begin_date: number; // 招股开始
  apply_end_date: number; // 招股结束
  bottom_content?: any;
  business: string; // 业务
  comunic: number;
  currency: string;
  ind_name?: any;
  info_switch: number;
  ipo_id?: any;
  is_check: number;
  issprice_max: number; // 招股价 max
  issprice_min: number; // 招股价 min
  issue_price?: any;
  list_date: number; // 上市日期
  lot_size: number; // 每股股数
  lot_winning_rate?: any;
  lotwin_amount: number;
  margin_rate?: any;
  name: string; // 股票名称
  numshispub: number; // 招股数
  numshpcm: number;
  parv: number;
  profile?: any;
  prospectus_url?: string;
  raise_funds?: any;
  src: string;
  subscribe_switch: number;
  symbol: string; // 股票代码
  temp_code: number;
  top_content?: any;
}

// https://xueqiu.com/hq#exchange=HK&industry=2_2&firstName=2
export const fetchHKStagging = () =>
  fetchXueqiu<{
    items: HKStaggingItem[];
    items_size: number;
  }>('/v5/stock/preipo/hk/query.json', {
    // page: 1,
    // size: 30,
    order_by: 'percent',
    type: 'unlisted',
    is_delay: true,
  });

interface CNStaggingItem {
  actissqty: number; // 预计发行量(万)
  acttotraiseamt?: any;
  actual_issue_total_vol?: any;
  affonleffsub_date?: any;
  bottom_content?: any;
  code?: any;
  current?: any;
  eps_dilutedaft?: any;
  exchange?: any;
  first_close_price?: any;
  first_open_price?: any;
  first_percent?: any;
  first_turnrate?: any;
  has_follow: boolean;
  info_switch?: any;
  iss_price?: number; // 发行价
  issueid?: any;
  leaduwer: string; // 保荐机构
  limitup_days?: any;
  list_date?: any;
  list_recomer?: any;
  listed_percent?: any;
  name: string; // 名称
  napsaft?: any;
  offl_effsubqty?: any;
  offl_lotwinrt?: any;
  offl_oversubrt?: any;
  offl_pla_num?: any;
  onl_actissqty?: number; // 网上发行量(万)
  onl_distr_date: number; // 申购日期
  onl_drawlots_date?: number;
  onl_effsub_num?: any;
  onl_effsubqty?: any;
  onl_frozen_amt?: any;
  onl_lorwin_code: string;
  onl_lotwin_amount?: any;
  onl_lotwin_rtpub_date?: any;
  onl_lotwiner_stpub_date: number; // 中签号公布日
  onl_lotwinrt?: any;
  onl_onversubrt?: any;
  onl_planissmaxqty: number;
  onl_rdshow_web?: any;
  onl_rdshowbeg_date: number;
  onl_refund_date?: any;
  onl_sub_maxqty: number;
  onl_subbeg_date: number;
  onl_subcode: string; // 申购代码
  onl_unfrozen_date?: any;
  onlissue_date?: any;
  orig_holders_place_code?: any;
  pb?: any;
  pe_ttm?: any;
  peaft?: any;
  percent?: any;
  plan_issue_total_vol?: any;
  planissmaxqty: number;
  plantotraiseamt?: any;
  quantity_unit?: any;
  stock_income?: any;
  subscribe_switch?: any;
  symbol: string; // 股票代码
  temp_code?: any;
  top_content?: any;
  totqty_aft?: any;
  type?: any;
}
// https://xueqiu.com/hq#xgss
export const fetchCNStagging = () =>
  fetchXueqiu<{
    items: CNStaggingItem[];
    count: number;
  }>('/v5/stock/preipo/cn/query.json', {
    // page: 1,
    // size: 10,
    order_by: 'onl_subbeg_date',
    order: 'asc',
    type: 'subscribe',
  });

const DEFAULT_LIST_QUERY = {
  pageNumber: 1,
  pageSize: 50,
  sortTypes: -1, // -1 desc; 1 asc
  columns: 'ALL',
  client: 'WEB',
  source: 'WEB',
};

export enum StaggingType {
  STOCK,
  BOND,
  REITs,
  BEI_JING,
}

const staggingQuery: Record<StaggingType, any> = {
  [StaggingType.BEI_JING]: {
    sortColumns: 'APPLY_DATE',
    reportName: 'RPT_NEEQ_ISSUEINFO_LIST',
    quoteColumns:
      'f14~01~SECURITY_CODE~SECURITY_NAME_ABBR,f2~01~SECURITY_CODE,f3~01~SECURITY_CODE,NEW_CHANGE_RATE~01~SECURITY_CODE',
    quoteType: '0',
    source: 'NEEQSELECT',
  },
  [StaggingType.STOCK]: {
    sortColumns: 'APPLY_DATE,SECURITY_CODE',
    sortTypes: '-1,-1',
    reportName: 'RPTA_APP_IPOAPPLY',
    columns:
      'SECURITY_CODE,SECURITY_NAME,TRADE_MARKET_CODE,APPLY_CODE,TRADE_MARKET,MARKET_TYPE,ORG_TYPE,ISSUE_NUM,ONLINE_ISSUE_NUM,OFFLINE_PLACING_NUM,TOP_APPLY_MARKETCAP,PREDICT_ONFUND_UPPER,ONLINE_APPLY_UPPER,PREDICT_ONAPPLY_UPPER,ISSUE_PRICE,LATELY_PRICE,CLOSE_PRICE,APPLY_DATE,BALLOT_NUM_DATE,BALLOT_PAY_DATE,LISTING_DATE,AFTER_ISSUE_PE,ONLINE_ISSUE_LWR,INITIAL_MULTIPLE,INDUSTRY_PE_NEW,OFFLINE_EP_OBJECT,CONTINUOUS_1WORD_NUM,TOTAL_CHANGE,PROFIT,LIMIT_UP_PRICE,INFO_CODE,OPEN_PRICE,LD_OPEN_PREMIUM,LD_CLOSE_CHANGE,TURNOVERRATE,LD_HIGH_CHANG,LD_AVERAGE_PRICE,OPEN_DATE,OPEN_AVERAGE_PRICE,PREDICT_PE,PREDICT_ISSUE_PRICE2,PREDICT_ISSUE_PRICE,PREDICT_ISSUE_PRICE1,PREDICT_ISSUE_PE,PREDICT_PE_THREE,ONLINE_APPLY_PRICE,MAIN_BUSINESS,PAGE_PREDICT_PRICE1,PAGE_PREDICT_PRICE2,PAGE_PREDICT_PRICE3,PAGE_PREDICT_PE1,PAGE_PREDICT_PE2,PAGE_PREDICT_PE3,SELECT_LISTING_DATE,IS_BEIJING,INDUSTRY_PE_RATIO,INDUSTRY_PE,IS_REGISTRATION',
    quoteColumns: 'f2~01~SECURITY_CODE~NEWEST_PRICE',
    quoteType: '0',
    filter: "(APPLY_DATE>'2010-01-01')",
  },
  [StaggingType.BOND]: {
    sortColumns: 'PUBLIC_START_DATE',
    reportName: 'RPT_BOND_CB_LIST',
    quoteColumns:
      'f2~01~CONVERT_STOCK_CODE~CONVERT_STOCK_PRICE,f235~10~SECURITY_CODE~TRANSFER_PRICE,f236~10~SECURITY_CODE~TRANSFER_VALUE,f2~10~SECURITY_CODE~CURRENT_BOND_PRICE,f237~10~SECURITY_CODE~TRANSFER_PREMIUM_RATIO,f239~10~SECURITY_CODE~RESALE_TRIG_PRICE,f240~10~SECURITY_CODE~REDEEM_TRIG_PRICE,f23~01~CONVERT_STOCK_CODE~PBV_RATIO',
    quoteType: '0',
  },
  [StaggingType.REITs]: {
    sortColumns: 'SUBSCRIBE_START_DATE',
    reportName: 'RPT_CUSTOM_REITS_APPLY_LIST_MARKET',
    quoteColumns:
      'f14~09~SECURITY_CODE~LTD_SECURITY_NAME,f2~09~SECURITY_CODE~f2,NEW_DISCOUNT_RATIO~09~SECURITY_CODE,NEW_CHANGE_RATE~09~SECURITY_CODE,NEW_DIVIDEND_RATE_TTM~09~SECURITY_CODE',
  },
};
// https://data.eastmoney.com/xg/xg/default.html
const listQueryStrigify = (
  type: StaggingType,
  params?: Record<string, any>
): string =>
  new URLSearchParams(
    Object.assign(
      {},
      DEFAULT_LIST_QUERY,
      staggingQuery[type],
      params
    ) as unknown as Record<string, string>
  ).toString();

export interface DongFangStaggingData {
  SECURITY_CODE: string;
  SECURITY_NAME: string;
  TRADE_MARKET_CODE: string;
  APPLY_CODE: string;
  TRADE_MARKET: string;
  MARKET_TYPE: string;
  ORG_TYPE?: string;
  ISSUE_NUM: number;
  ONLINE_ISSUE_NUM: number;
  OFFLINE_PLACING_NUM?: number;
  TOP_APPLY_MARKETCAP: number;
  PREDICT_ONFUND_UPPER?: number;
  ONLINE_APPLY_UPPER: number;
  PREDICT_ONAPPLY_UPPER?: number;
  ISSUE_PRICE?: number;
  LATELY_PRICE?: number;
  CLOSE_PRICE?: number;
  APPLY_DATE: string;
  BALLOT_NUM_DATE?: string;
  BALLOT_PAY_DATE?: string;
  LISTING_DATE?: string;
  AFTER_ISSUE_PE?: number;
  ONLINE_ISSUE_LWR?: number;
  INITIAL_MULTIPLE?: number;
  INDUSTRY_PE_NEW: number;
  OFFLINE_EP_OBJECT?: number;
  CONTINUOUS_1WORD_NUM?: string;
  TOTAL_CHANGE?: number;
  PROFIT?: number;
  LIMIT_UP_PRICE?: number;
  INFO_CODE: string;
  OPEN_PRICE?: number;
  LD_OPEN_PREMIUM?: number;
  LD_CLOSE_CHANGE?: number;
  TURNOVERRATE?: number;
  LD_HIGH_CHANG?: number;
  LD_AVERAGE_PRICE?: number;
  OPEN_DATE?: any;
  OPEN_AVERAGE_PRICE?: any;
  PREDICT_PE?: any;
  PREDICT_ISSUE_PRICE2?: number;
  PREDICT_ISSUE_PRICE?: number;
  PREDICT_ISSUE_PRICE1?: number;
  PREDICT_ISSUE_PE?: any;
  PREDICT_PE_THREE?: number;
  ONLINE_APPLY_PRICE?: any;
  MAIN_BUSINESS: string;
  PAGE_PREDICT_PRICE1?: any;
  PAGE_PREDICT_PRICE2?: any;
  PAGE_PREDICT_PRICE3?: any;
  PAGE_PREDICT_PE1?: any;
  PAGE_PREDICT_PE2?: any;
  PAGE_PREDICT_PE3?: any;
  SELECT_LISTING_DATE?: string;
  IS_BEIJING: number;
  INDUSTRY_PE_RATIO?: number;
  INDUSTRY_PE?: number;
  IS_REGISTRATION: string;
  NEWEST_PRICE?: number | string;
}

export interface BeiJingStaggingData extends DongFangStaggingData {
  SECURITY_NAME_ABBR: string;
  APPLY_AMT_100: number;
}

export const fetchNewStagging = (
  type: StaggingType,
  params?: Record<string, any>
) =>
  jsonpPromise<{
    version: string;
    result: {
      pages: number;
      data: BeiJingStaggingData[];
      count: number;
    };
    success: boolean;
    message: string;
    code: number;
  }>(
    `https://datacenter-web.eastmoney.com/api/data/v1/get?${listQueryStrigify(
      type,
      params
    )}`
  );
