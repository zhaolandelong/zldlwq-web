import React, { useEffect, useState } from 'react';
import { Table, Typography } from 'antd';
import type { ETFPriceInfo, OptionPnCData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { ETF_INFOS } from '../constants';
import { flattenDeep } from 'lodash-es';
import { fetchEtfOpPrimaryDatas } from '../utils';

const { Title } = Typography;

const columns: ColumnType<OptionPnCData>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
  },
  {
    title: 'Month',
    dataIndex: 'month',
    key: 'month',
    fixed: 'left',
    sorter: (a, b) => Number(a.month) - Number(b.month),
  },
  {
    title: 'Diff / Days',
    align: 'right',
    fixed: 'left',
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays -
      (b.timeValueP - b.timeValueC) / b.remainDays,
    render: (text, record) =>
      `¥ ${(
        ((record.timeValueP - record.timeValueC) * 10000) /
        record.remainDays
      ).toFixed(2)}`,
  },
  {
    title: 'Value Diff (1 hand)',
    align: 'right',
    sorter: (a, b) => a.timeValueP - a.timeValueC - b.timeValueP + b.timeValueC,
    render: (text, record) =>
      `¥ ${((record.timeValueP - record.timeValueC) * 10000).toFixed(2)}`,
  },
  {
    title: 'Strike Price',
    dataIndex: 'strikePrice',
    key: 'strikePrice',
    align: 'right',
    sorter: (a, b) => a.strikePrice - b.strikePrice,
    render: (price) => `¥ ${price.toFixed(3)}`,
  },
  {
    title: 'Time Value (P)',
    dataIndex: 'timeValueP',
    key: 'timeValueP',
    align: 'right',
    sorter: (a, b) => a.timeValueP - b.timeValueP,
    render: (price) => `¥ ${price.toFixed(4)}`,
  },
  {
    title: 'Time Value (C)',
    dataIndex: 'timeValueC',
    key: 'timeValueC',
    align: 'right',
    sorter: (a, b) => a.timeValueC - b.timeValueC,
    render: (price) => `¥ ${price.toFixed(4)}`,
  },
  {
    title: 'Remain Days',
    dataIndex: 'remainDays',
    key: 'remainDays',
    align: 'right',
    sorter: (a, b) => a.remainDays - b.remainDays,
    render: (d) => `${d} days`,
  },
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
    filters: Object.values(ETF_INFOS).map((info) => ({
      text: info.code,
      value: info.code,
    })),
    onFilter: (value, record) => value === record.code,
  },
];

const ETFOpTable: React.FC<{
  etfPriceInfos: ETFPriceInfo[];
  fetchTime: string;
}> = (props) => {
  const { etfPriceInfos, fetchTime } = props;
  const [dataSource, setDataSource] = useState<OptionPnCData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all(etfPriceInfos.map(fetchEtfOpPrimaryDatas))
      .then((etfOpArr) => {
        setDataSource(flattenDeep(etfOpArr));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [etfPriceInfos]);

  return (
    <>
      <Title level={2}>ETF Option Info ({fetchTime})</Title>
      <Table
        size="small"
        columns={columns}
        scroll={{ x: 800 }}
        dataSource={dataSource}
        rowKey={(r) => `${r.code}-${r.month}-${r.strikePrice}`}
        loading={loading}
        pagination={false}
      />
    </>
  );
};

export default ETFOpTable;
