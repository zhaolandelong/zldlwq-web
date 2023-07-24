import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Table, Typography } from 'antd';
import type { StockInfo, EtfOpPnCData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, ETF_INFOS } from '../constants';
import { flattenDeep } from 'lodash-es';
import { fetchEtfOpPrimaryDatas } from '../services';
import { calculateEtfOpMargin } from '../utils';
import { renderCell, renderTitle } from '../../../components/CellRender';

const { Title, Text } = Typography;

const baseColumns: ColumnType<EtfOpPnCData>[] = [
  {
    title: renderTitle('1手保证金', '打折率'),
    align: 'right',
    width: 105,
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays / a.strikePrice -
      (b.timeValueP - b.timeValueC) / b.remainDays / b.strikePrice,
    render: (text, r) =>
      renderCell(
        `
          ¥
          ${calculateEtfOpMargin({
            settlePrice: r.settlePriceP,
            lastClosePrice: r.stockLastClosePrice,
            strikePrice: r.strikePrice,
            type: 'P',
          }).toFixed(2)}
        `,
        `
          ${(
            ((r.timeValueP - r.timeValueC) / r.stockPrice / r.remainDays) *
            36500
          ).toFixed(2)}
          %`
      ),
  },
  {
    title: renderTitle('1手打折', '日均打折'),
    align: 'right',
    render: (text, r) =>
      renderCell(
        `¥${((r.timeValueP - r.timeValueC) * 10000).toFixed(0)}`,
        `
          ¥${(((r.timeValueP - r.timeValueC) * 10000) / r.remainDays).toFixed(
            2
          )}`
      ),
  },
  {
    title: renderTitle('行权价', '现价'),
    dataIndex: 'strikePrice',
    key: 'strikePrice',
    align: 'center',
    render: (price, r) =>
      renderCell(`¥${price.toFixed(3)}`, `¥${r.stockPrice.toFixed(3)}`),
  },
  {
    title: '时间价值(P|C)',
    dataIndex: 'timeValueP',
    key: 'timeValueP',
    align: 'center',
    render: (price, r) =>
      renderCell(`¥${price.toFixed(4)}`, `¥${r.timeValueC.toFixed(4)}`),
  },
];

const ETFOpTable: React.FC<{
  stockInfos: StockInfo[];
}> = (props) => {
  const { stockInfos } = props;
  const [dataSource, setDataSource] = useState<EtfOpPnCData[]>([]);
  const [codes, setCodes] = useState<string[]>(DEFAULT_CODES);
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
      title: renderTitle('名称', '月份'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      align: 'center',
      width: 110,
      filters,
      onFilter: (value, r) => value === r.month,
      render: (name, r) => renderCell(name, `${r.month}(${r.remainDays}天)`),
    },
    ...baseColumns,
  ];

  useEffect(() => {
    if (Array.isArray(stockInfos) && stockInfos.length) {
      setLoading(true);
      Promise.all(
        stockInfos
          .filter((info) => codes.includes(info.code))
          .map(fetchEtfOpPrimaryDatas)
      )
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
      <Title level={2}>ETF 期权</Title>
      <Checkbox.Group
        options={ETF_INFOS.filter(({ hasOp }) => hasOp).map((info) => ({
          label: info.name,
          value: info.code,
        }))}
        value={codes}
        onChange={(vals) => setCodes(vals as string[])}
      />
      <Table
        size="small"
        columns={columns}
        scroll={{ x: 500 }}
        dataSource={dataSource}
        rowKey={(r) => `${r.code}-${r.month}-${r.strikePrice}`}
        loading={loading}
        pagination={false}
        bordered
      />
      <Text type="secondary">
        <ul>
          <li>1手保证金 = 1手卖出认沽的保证金（买入认购无需保证金）</li>
          <li>打折（1 手）= ( 时间价值(P) - 时间价值(C) ) * 10000</li>
          <li>日均打折 = 打折（1 手） / 剩余天数</li>
          <li>
            打折率 = 日均打折 / 10000 / 现价 * 365。用于跨品种对比打折程度
          </li>
        </ul>
      </Text>
    </>
  );
};

export default ETFOpTable;
