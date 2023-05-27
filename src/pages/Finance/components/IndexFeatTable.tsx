import React, { useEffect, useState } from 'react';
import { Checkbox, Table, Typography } from 'antd';
import type { ProdDealDateKV, StockInfo, FeatureData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, INDEX_FEAT_INFOS } from '../constants';
import { fetchFeatPointByMonths, filterDealDates } from '../utils';
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

const featCodes = INDEX_FEAT_INFOS.map((info) => info.feat);

const IndexFeatTable: React.FC<{
  stockInfos: StockInfo[];
  featureDealDates?: ProdDealDateKV;
}> = (props) => {
  const { stockInfos, featureDealDates } = props;

  const [dataSource, setDataSource] = useState<FeatureData[]>([]);
  const [codes, setCodes] = useState<string[]>(DEFAULT_CODES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const monthDealDates = filterDealDates(featCodes, featureDealDates);
    if (monthDealDates) {
      setLoading(true);
      Promise.all(
        INDEX_FEAT_INFOS.filter(({ code }) => codes.includes(code)).map(
          ({ feat, code }) =>
            fetchFeatPointByMonths(feat, monthDealDates[feat].months).then(
              (pointArr) =>
                pointArr.map((point, i) => {
                  const indexInfo = stockInfos.find(
                    (info) => info.code === code
                  ) as StockInfo;
                  const month = monthDealDates[feat].months[i];
                  const result: FeatureData = {
                    ...indexInfo,
                    point,
                    month,
                    discount: indexInfo.price - point,
                    featCode: feat + month,
                    remainDays: moment(monthDealDates[feat].dealDates[i]).diff(
                      moment(),
                      'days'
                    ),
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
  }, [stockInfos, featureDealDates]);

  return (
    <>
      <Title level={2}>股指期货</Title>
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
