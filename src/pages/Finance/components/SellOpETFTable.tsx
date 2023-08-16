import React, { useEffect, useMemo, useState } from 'react';
import { Table, Typography } from 'antd';
import type { StockInfo, EtfOpPnCData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { flattenDeep } from 'lodash-es';
import { fetchEtfOpPrimaryDatas } from '../services';
import { calculateEtfOpMargin } from '../utils';

const { Title, Text } = Typography;

const textMap = {
  C: {
    title: '卖出认购 ETF 期权',
    currPriceIndex: 'currPriceC',
    priceName: '清仓价',
    formulaDesc:
      '参考保证金 = [昨结算价 + Max(12% * 昨收盘价 - 认购期权虚值, 7% * 昨收盘价)] * 10000',
    outOpDesc: '认购期权虚值 = Max(行权价 - 昨收盘价, 0)',
  },
  P: {
    title: '卖出认沽 ETF 期权',
    currPriceIndex: 'currPriceP',
    priceName: '加仓价',
    formulaDesc:
      '参考保证金 = Min{[昨结算价 + Max(12% * 昨收盘价 - 认沽期权虚值, 7% * 行权价格)], 行权价格} * 10000',
    outOpDesc: '认沽期权虚值 = Max(昨收盘价 - 行权价, 0)',
  },
};

const SellOpETFTable: React.FC<{
  type: 'C' | 'P';
  stockInfos: StockInfo[];
}> = (props) => {
  const { type, stockInfos } = props;
  const { title, currPriceIndex, priceName, formulaDesc, outOpDesc } =
    textMap[type];
  const [dataSource, setDataSource] = useState<EtfOpPnCData[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = useMemo(() => {
    const months = Array.from(new Set(dataSource.map((info) => info.month)));
    return months.map((month) => ({
      text: month,
      value: month,
    }));
  }, [dataSource]);

  const columns: ColumnType<EtfOpPnCData>[] = [
    {
      title: (
        <div>
          名称
          <br />
          月份
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      align: 'center',
      filters,
      onFilter: (value, r) => value === r.month,
      render: (name, r) => (
        <>
          <div>{name}</div>
          <div style={{ color: '#f00' }}>
            {r.month}({r.remainDays}天)
          </div>
        </>
      ),
    },
    {
      title: (
        <div>
          行权价
          <br />
          {priceName}
        </div>
      ),
      dataIndex: 'strikePrice',
      key: 'strikePrice',
      align: 'center',
      render: (price, r) => (
        <>
          <div>¥{price.toFixed(3)}</div>
          <div style={{ color: '#f00' }}>¥{r.stockPrice.toFixed(3)}</div>
        </>
      ),
    },
    {
      title: (
        <div>
          1手权利金
          <br />
          日均
        </div>
      ),
      dataIndex: currPriceIndex,
      key: 'currPrice',
      align: 'right',
      render: (price, r) => (
        <>
          <div>¥{(price * 10000).toFixed(0)}</div>
          <div style={{ color: '#f00' }}>
            ¥{((price * 10000) / r.remainDays).toFixed(2)}
          </div>
        </>
      ),
    },
    {
      title: (
        <div>
          参考保证金
          <br />
          年化收益率
        </div>
      ),
      dataIndex: currPriceIndex,
      key: 'margin',
      align: 'right',
      render: (price, r) => (
        <>
          <div>
            ¥
            {calculateEtfOpMargin({
              settlePrice: type === 'C' ? r.settlePriceC : r.settlePriceP,
              lastClosePrice: r.stockLastClosePrice,
              strikePrice: r.strikePrice,
              type,
            }).toFixed(2)}
          </div>
          <div style={{ color: '#f00' }}>
            {(
              (price * 365000000) /
              calculateEtfOpMargin({
                settlePrice: type === 'C' ? r.settlePriceC : r.settlePriceP,
                lastClosePrice: r.stockLastClosePrice,
                strikePrice: r.strikePrice,
                type,
              }) /
              r.remainDays
            ).toFixed(2)}
            %
          </div>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (Array.isArray(stockInfos) && stockInfos.length) {
      setLoading(true);
      Promise.all(stockInfos.map((info) => fetchEtfOpPrimaryDatas(info)))
        .then((etfOpArr) => {
          setDataSource(flattenDeep(etfOpArr));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [stockInfos]);

  return (
    <>
      <Title level={2}>{title}</Title>
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        rowKey={(r) => `${r.code}-${r.month}-${r.strikePrice}`}
        loading={loading}
        pagination={false}
        bordered
      />
      <Text type="secondary">
        <ul>
          {type === 'C' ? (
            <li>
              注意：若「卖出认购价格」 &gt;&gt; 「期权最高行权价」，原则上就
              <Text type="warning">不需要做卖出认购了</Text>，表里的数据仅作参考
            </li>
          ) : null}
          <li>1手权利金 = 期权现价 * 10000</li>
          <li>{formulaDesc}</li>
          <li>{outOpDesc}</li>
          <li>年化收益率 = 1手权利金 / 参考保证金 / 剩余天数 * 365</li>
        </ul>
      </Text>
    </>
  );
};

export default SellOpETFTable;
