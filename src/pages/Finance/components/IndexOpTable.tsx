import React, { useEffect, useState } from 'react';
import { Checkbox, Table, Typography } from 'antd';
import type { ProdDealDateKV, StockInfo, OptionPnCData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, INDEX_OP_INFOS } from '../constants';
import { flattenDeep } from 'lodash-es';
import { fetchIndexOpPrimaryDatas, filterDealDates } from '../utils';

const { Title, Text } = Typography;

const columns: ColumnType<OptionPnCData>[] = [
  {
    title: '代码',
    dataIndex: 'code',
    key: 'code',
    width: 72,
    fixed: 'left',
    sorter: (a, b) => Number(a.month) - Number(b.month),
    filters: Object.values(INDEX_OP_INFOS).map((info) => ({
      text: info.op,
      value: info.op,
    })),
    onFilter: (value, record) => record.code.startsWith(value as string),
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 75,
  },
  {
    title: '日均打折',
    align: 'right',
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays -
      (b.timeValueP - b.timeValueC) / b.remainDays,
    render: (text, record) =>
      `¥ ${(
        ((record.timeValueP - record.timeValueC) * 100) /
        record.remainDays
      ).toFixed(2)}`,
  },
  {
    title: '打折（1 手）',
    align: 'right',
    sorter: (a, b) => a.timeValueP - a.timeValueC - b.timeValueP + b.timeValueC,
    render: (text, record) =>
      `¥ ${((record.timeValueP - record.timeValueC) * 100).toFixed(2)}`,
  },
  {
    title: '年化打折率',
    align: 'right',
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays / a.strikePrice -
      (b.timeValueP - b.timeValueC) / b.remainDays / b.strikePrice,
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
  },
  {
    title: '时间价值(P)',
    dataIndex: 'timeValueP',
    key: 'timeValueP',
    align: 'right',
    sorter: (a, b) => a.timeValueP - b.timeValueP,
    render: (price) => `¥ ${price.toFixed(2)}`,
  },
  {
    title: '时间价值(C)',
    dataIndex: 'timeValueC',
    key: 'timeValueC',
    align: 'right',
    sorter: (a, b) => a.timeValueC - b.timeValueC,
    render: (price) => `¥ ${price.toFixed(2)}`,
  },
  {
    title: '剩余天数',
    dataIndex: 'remainDays',
    key: 'remainDays',
    align: 'right',
    width: 72,
    sorter: (a, b) => a.remainDays - b.remainDays,
    render: (d) => `${d} days`,
  },
];

const opCodes = INDEX_OP_INFOS.map((info) => info.op);

const IndexOpTable: React.FC<{
  stockInfos: StockInfo[];
  featureDealDates?: ProdDealDateKV;
}> = (props) => {
  const { stockInfos, featureDealDates } = props;

  const [dataSource, setDataSource] = useState<OptionPnCData[]>([]);
  const [codes, setCodes] = useState<string[]>(DEFAULT_CODES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const monthDealDates = filterDealDates(opCodes, featureDealDates);
    if (monthDealDates) {
      setLoading(true);
      Promise.all(
        INDEX_OP_INFOS.filter(({ code }) => codes.includes(code)).map(
          ({ code, op }) =>
            fetchIndexOpPrimaryDatas({
              indexInfo: stockInfos.find(
                (info) => info.code === code
              ) as StockInfo,
              op,
              ...monthDealDates[op],
            })
        )
      )
        .then((etfOpArr) => {
          setDataSource(flattenDeep(etfOpArr));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [stockInfos, featureDealDates]);

  return (
    <>
      <Title level={2}>股指期权</Title>
      <Checkbox.Group
        options={INDEX_OP_INFOS.map((info) => ({
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
        scroll={{ x: 730 }}
        dataSource={dataSource}
        rowKey="code"
        bordered
        loading={loading}
        pagination={false}
      />
      <Text type="secondary">
        <ul>
          <li>打折（1 手）= ( 时间价值(P) - 时间价值(C) ) * 100</li>
          <li>日均打折 = 打折（1 手） / 剩余天数</li>
          <li>年化打折率 = 日均打折 / 100 / 行权价 * 365</li>
        </ul>
      </Text>
    </>
  );
};

export default IndexOpTable;
