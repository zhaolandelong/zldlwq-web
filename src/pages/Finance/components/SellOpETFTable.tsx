import React, { useEffect, useMemo, useState } from 'react';
import { Table, Typography } from 'antd';
import type { StockInfo, OptionPnCData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { flattenDeep } from 'lodash-es';
import { fetchEtfOpPrimaryDatas } from '../services';

const { Title } = Typography;

const SellOpETFTable: React.FC<{
  type: 'C' | 'P';
  stockInfos: StockInfo[];
}> = (props) => {
  const { type, stockInfos } = props;
  const title = `卖${type === 'C' ? '购' : '沽'}权利金`;
  const dataIndex = type === 'C' ? 'currPriceC' : 'currPriceP';
  const priceName = type === 'C' ? '清仓价' : '加仓价';

  const [dataSource, setDataSource] = useState<OptionPnCData[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = useMemo(() => {
    const months = Array.from(new Set(dataSource.map((info) => info.month)));
    return months.map((month) => ({
      text: month,
      value: month,
    }));
  }, [dataSource]);

  const columns: ColumnType<OptionPnCData>[] = [
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
          1手卖购
          <br />
          日均
        </div>
      ),
      dataIndex,
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
  ];

  useEffect(() => {
    if (Array.isArray(stockInfos) && stockInfos.length) {
      setLoading(true);
      Promise.all(stockInfos.map(fetchEtfOpPrimaryDatas))
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
    </>
  );
};

export default SellOpETFTable;
