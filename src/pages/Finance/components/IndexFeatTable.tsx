import React, { useEffect, useState, useMemo } from 'react';
import { Checkbox, Table, Typography } from 'antd';
import type { FeatureDealDate, IndexOpInfo, FeatureData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, INDEX_FEAT_INFOS } from '../constants';
import { fetchFeatPointByMonths } from '../utils';
import { flatten } from 'lodash-es';
import moment from 'moment';

const { Title, Text } = Typography;

const columns: ColumnType<FeatureData>[] = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
  },
  {
    title: '代码',
    dataIndex: 'featCode',
    key: 'featCode',
    sorter: (a, b) => Number(a.month) - Number(b.month),
    filters: Object.values(INDEX_FEAT_INFOS).map((info) => ({
      text: info.feat,
      value: info.feat,
    })),
    onFilter: (value, record) => record.featCode.startsWith(value as string),
  },
  {
    title: '日均打折',
    align: 'right',
    fixed: 'left',
    sorter: (a, b) => a.discount / a.remainDays - b.discount / b.remainDays,
    render: (text, record) =>
      `¥ ${((record.discount * 200) / record.remainDays).toFixed(2)}`,
  },
  {
    title: '打折（1 手）',
    dataIndex: 'discount',
    key: 'discount',
    align: 'right',
    sorter: (a, b) => a.discount - b.discount,
    render: (discount) => `¥ ${(discount * 200).toFixed(2)}`,
  },
  {
    title: '年化打折率',
    align: 'right',
    sorter: (a, b) => a.discount / a.remainDays - b.discount / b.remainDays,
    render: (text, record) =>
      `${((record.discount / record.point / record.remainDays) * 36500).toFixed(
        2
      )}%`,
  },
  {
    title: '点数',
    dataIndex: 'point',
    key: 'point',
    align: 'right',
    sorter: (a, b) => a.point - b.point,
    render: (point) => point.toFixed(2),
  },
  {
    title: '剩余天数',
    dataIndex: 'remainDays',
    key: 'remainDays',
    align: 'right',
    sorter: (a, b) => a.remainDays - b.remainDays,
    render: (d) => `${d} days`,
  },
];

const featCodes: string[] = [];
for (const info of INDEX_FEAT_INFOS) {
  featCodes.push(info.feat);
}

const IndexFeatTable: React.FC<{
  priceInfos: IndexOpInfo[];
  featureDealDates?: FeatureDealDate;
  fetchTime: string;
}> = (props) => {
  const { priceInfos, fetchTime, featureDealDates } = props;

  const filteredDealDates = useMemo(() => {
    if (typeof featureDealDates === 'undefined') {
      return null;
    }
    const result: Record<string, { months: string[]; dealDates: string[] }> =
      {};

    for (let key in featureDealDates) {
      const prod = key.slice(0, 2);
      if (!featCodes.includes(prod)) {
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

  const [dataSource, setDataSource] = useState<FeatureData[]>([]);
  const [codes, setCodes] = useState<string[]>(DEFAULT_CODES);
  const [loading, setLoading] = useState(true);

  const filteredInfos = useMemo(
    () => priceInfos.filter((info) => codes.includes(info.code)),
    [priceInfos, codes]
  );

  useEffect(() => {
    if (
      typeof filteredDealDates !== 'undefined' &&
      filteredDealDates !== null
    ) {
      setLoading(true);
      Promise.all(
        filteredInfos.map((info) =>
          fetchFeatPointByMonths(
            info.feat,
            filteredDealDates[info.feat].months
          ).then((pointArr) =>
            pointArr.map((point, i) => {
              const month = filteredDealDates[info.feat].months[i];
              const result: FeatureData = {
                ...info,
                point,
                month,
                discount: info.price - point,
                featCode: info.feat + month,
                remainDays: moment(
                  filteredDealDates[info.feat].dealDates[i]
                ).diff(moment(), 'days'),
              };
              return result;
            })
          )
        )
      )
        .then((pointArr) => {
          setDataSource(flatten(pointArr));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [priceInfos, filteredDealDates]);

  return (
    <>
      <Title level={2}>股指期货 ({fetchTime})</Title>
      <Checkbox.Group
        options={INDEX_FEAT_INFOS.map((info) => ({
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
        rowKey={(r) => `${r.code}-${r.month}-${r.point}`}
        loading={loading}
        pagination={false}
      />
      <Text type="secondary">
        <ul>
          <li>打折（1 手）= ( 股指 - 点数 ) * 200</li>
          <li>日均打折 = 打折（1 手） / 剩余天数</li>
          <li>年化打折率 = 日均打折 / 点数 * 365</li>
        </ul>
      </Text>
    </>
  );
};

export default IndexFeatTable;
