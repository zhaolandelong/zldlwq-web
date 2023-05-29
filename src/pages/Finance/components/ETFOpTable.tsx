import React, { useEffect, useState } from 'react';
import { Checkbox, Table, Typography } from 'antd';
import type { StockInfo, OptionPnCData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, ETF_INFOS } from '../constants';
import { flattenDeep } from 'lodash-es';
import { fetchEtfOpPrimaryDatas } from '../utils';

const { Title, Text } = Typography;

const columns: ColumnType<OptionPnCData>[] = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 95,
  },
  {
    title: '月份',
    dataIndex: 'month',
    key: 'month',
    fixed: 'left',
    width: 50,
    sorter: (a, b) => Number(a.month) - Number(b.month),
  },
  {
    title: '日均打折',
    align: 'right',
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
    title: '打折（1 手）',
    align: 'right',
    sorter: (a, b) => a.timeValueP - a.timeValueC - b.timeValueP + b.timeValueC,
    render: (text, record) =>
      `¥ ${((record.timeValueP - record.timeValueC) * 10000).toFixed(2)}`,
  },
  {
    title: '年化打折率',
    align: 'right',
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays -
      (b.timeValueP - b.timeValueC) / b.remainDays,
    render: (text, record) =>
      `${(
        ((record.timeValueP - record.timeValueC) /
          record.strikePrice /
          record.remainDays) *
        36500
      ).toFixed(2)}%`,
  },
  {
    title: '行权价',
    dataIndex: 'strikePrice',
    key: 'strikePrice',
    align: 'right',
    sorter: (a, b) => a.strikePrice - b.strikePrice,
    render: (price) => `¥ ${price.toFixed(3)}`,
  },
  {
    title: '时间价值(P)',
    dataIndex: 'timeValueP',
    key: 'timeValueP',
    align: 'right',
    sorter: (a, b) => a.timeValueP - b.timeValueP,
    render: (price) => `¥ ${price.toFixed(4)}`,
  },
  {
    title: '时间价值(C)',
    dataIndex: 'timeValueC',
    key: 'timeValueC',
    align: 'right',
    sorter: (a, b) => a.timeValueC - b.timeValueC,
    render: (price) => `¥ ${price.toFixed(4)}`,
  },
  {
    title: '剩余天数',
    dataIndex: 'remainDays',
    key: 'remainDays',
    align: 'right',
    width: 75,
    sorter: (a, b) => a.remainDays - b.remainDays,
    render: (d) => `${d} days`,
  },
];

const ETFOpTable: React.FC<{
  stockInfos: StockInfo[];
}> = (props) => {
  const { stockInfos } = props;
  const [dataSource, setDataSource] = useState<OptionPnCData[]>([]);
  const [codes, setCodes] = useState<string[]>(DEFAULT_CODES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [stockInfos]);

  return (
    <>
      <Title level={2}>ETF 期权</Title>
      <Checkbox.Group
        options={ETF_INFOS.map((info) => ({
          label: info.name,
          value: info.code,
          disabled: DEFAULT_CODES.includes(info.code),
        }))}
        value={codes}
        onChange={(vals) => setCodes(vals as string[])}
      />
      <Table
        size="small"
        columns={columns}
        scroll={{ x: 720 }}
        dataSource={dataSource}
        rowKey={(r) => `${r.code}-${r.month}-${r.strikePrice}`}
        loading={loading}
        pagination={false}
        bordered
      />
      <Text type="secondary">
        <ul>
          <li>打折（1 手）= ( 时间价值(P) - 时间价值(C) ) * 10000</li>
          <li>日均打折 = 打折（1 手） / 剩余天数</li>
          <li>年化打折率 = 日均打折 / 行权价 * 365</li>
        </ul>
      </Text>
    </>
  );
};

export default ETFOpTable;
