import React, { useEffect, useState, useMemo } from 'react';
import { Checkbox, Table, Typography } from 'antd';
import type { FeatureDealDate, IndexOpInfo, OptionPnCData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, INDEX_INFOS } from '../constants';
import { flattenDeep } from 'lodash-es';
import { fetchIndexOpPrimaryDatas } from '../utils';

const { Title } = Typography;

const columns: ColumnType<OptionPnCData>[] = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
  },
  {
    title: '月份',
    dataIndex: 'month',
    key: 'month',
    fixed: 'left',
    sorter: (a, b) => Number(a.month) - Number(b.month),
  },
  {
    title: '日均打折',
    align: 'right',
    fixed: 'left',
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays -
      (b.timeValueP - b.timeValueC) / b.remainDays,
    render: (text, record) =>
      `¥ ${(
        ((record.timeValueP - record.timeValueC) * 10) /
        record.remainDays
      ).toFixed(2)}`,
  },
  {
    title: '打折（1 手）',
    align: 'right',
    sorter: (a, b) => a.timeValueP - a.timeValueC - b.timeValueP + b.timeValueC,
    render: (text, record) =>
      `¥ ${((record.timeValueP - record.timeValueC) * 10).toFixed(2)}`,
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
    sorter: (a, b) => a.remainDays - b.remainDays,
    render: (d) => `${d} days`,
  },
  {
    title: '代码',
    dataIndex: 'code',
    key: 'code',
    filters: Object.values(INDEX_INFOS).map((info) => ({
      text: info.op,
      value: info.op,
    })),
    onFilter: (value, record) => record.code.startsWith(value as string),
  },
];

const IndexOpTable: React.FC<{
  priceInfos: IndexOpInfo[];
  featureDealDates?: FeatureDealDate;
  fetchTime: string;
}> = (props) => {
  const { priceInfos, fetchTime, featureDealDates } = props;

  const indexCodes: string[] = [];
  const opCodes: string[] = [];
  for (const info of INDEX_INFOS) {
    opCodes.push(info.op);
    indexCodes.push(info.code);
  }

  const filteredDealDates = useMemo(() => {
    if (typeof featureDealDates === 'undefined') {
      return null;
    }
    const result: Record<string, { months: string[]; dealDates: string[] }> =
      {};

    for (let key in featureDealDates) {
      const prod = key.slice(0, 2);
      if (!opCodes.includes(prod)) {
        continue;
      }
      if (!result[prod]) {
        result[prod] = { months: [], dealDates: [] };
      }
      result[prod].months.push(key.slice(-4));
      result[prod].dealDates.push(featureDealDates[key]);
    }
    return result;
  }, [featureDealDates]);

  const [dataSource, setDataSource] = useState<OptionPnCData[]>([]);
  const [codes, setCodes] = useState<string[]>(DEFAULT_CODES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      typeof filteredDealDates !== 'undefined' &&
      filteredDealDates !== null
    ) {
      setLoading(true);
      Promise.all(
        priceInfos
          .filter((info) => codes.includes(info.code))
          .map((indexInfo) =>
            fetchIndexOpPrimaryDatas({
              indexInfo,
              ...filteredDealDates[indexInfo.op],
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
  }, [priceInfos, filteredDealDates]);

  return (
    <>
      <Title level={2}>股指期权 ({fetchTime})</Title>
      <Checkbox.Group
        options={INDEX_INFOS.map((info) => ({
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
        // scroll={{ x: 800 }}
        dataSource={dataSource}
        rowKey={(r) => `${r.code}-${r.month}-${r.strikePrice}`}
        loading={loading}
        pagination={false}
      />
    </>
  );
};

export default IndexOpTable;
