import React, { useEffect, useState } from 'react';
import { Checkbox, Table, Typography } from 'antd';
import type { ProdDealDateKV, StockInfo, FeatureData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, INDEX_FEAT_INFOS } from '../constants';
import { fetchFeatPointByMonths } from '../services';
import { flatten } from 'lodash-es';
import moment from 'moment';
import { filterDealDates } from '../utils';

const { Title, Text } = Typography;

const columns: ColumnType<FeatureData>[] = [
  {
    title: '代码',
    dataIndex: 'featCode',
    key: 'featCode',
    width: 75,
    fixed: 'left',
    filters: Object.values(INDEX_FEAT_INFOS).map((info) => ({
      text: info.feat,
      value: info.feat,
    })),
    onFilter: (value, r) => r.featCode.startsWith(value as string),
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 78,
  },
  {
    title: '日均打折',
    align: 'right',
    sorter: (a, b) => a.discount / a.remainDays - b.discount / b.remainDays,
    render: (text, r) =>
      `¥ ${((r.discount * r.pointPrice) / r.remainDays).toFixed(2)}`,
  },
  {
    title: '打折（1 手）',
    dataIndex: 'discount',
    key: 'discount',
    align: 'right',
    sorter: (a, b) => a.discount - b.discount,
    render: (discount, r) => `¥ ${(discount * r.pointPrice).toFixed(0)}`,
  },
  {
    title: '年化打折率',
    align: 'right',
    sorter: (a, b) =>
      a.discount / a.remainDays / a.point - b.discount / b.remainDays / b.point,
    render: (text, r) =>
      `${((r.discount / r.point / r.remainDays) * 36500).toFixed(2)}%`,
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
    title: '点数价格',
    dataIndex: 'pointPrice',
    key: 'pointPrice',
    align: 'right',
    render: (pointPrice) => `¥ ${pointPrice}`,
  },
  {
    title: '剩余',
    dataIndex: 'remainDays',
    key: 'remainDays',
    align: 'right',
    width: 70,
    sorter: (a, b) => a.remainDays - b.remainDays,
    render: (d) => `${d} 天`,
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
    if (monthDealDates && Array.isArray(stockInfos) && stockInfos.length) {
      setLoading(true);
      Promise.all(
        INDEX_FEAT_INFOS.filter(({ code }) => codes.includes(code)).map(
          (info) => {
            const { feat, code } = info;
            return fetchFeatPointByMonths(
              feat,
              monthDealDates[feat].months
            ).then((pointArr) =>
              pointArr.map((point, i) => {
                const indexInfo = stockInfos.find(
                  (info) => info.code === code
                ) as StockInfo;
                const month = monthDealDates[feat].months[i];
                const result: FeatureData = {
                  ...info,
                  point,
                  discount: indexInfo.price - point,
                  featCode: feat + month,
                  remainDays: moment(monthDealDates[feat].dealDates[i]).diff(
                    moment(),
                    'days'
                  ),
                };
                return result;
              })
            );
          }
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
        }))}
        value={codes}
        onChange={(vals) => setCodes(vals as string[])}
      />
      <Table
        size="small"
        columns={columns}
        scroll={{ x: 690 }}
        dataSource={dataSource}
        rowKey="featCode"
        loading={loading}
        bordered
        pagination={false}
      />
      <Text type="secondary">
        <ul>
          <li>打折（1 手）= ( 股指 - 点数 ) * 点数价格</li>
          <li>日均打折 = 打折（1 手） / 剩余天数</li>
          <li>年化打折率 = 日均打折 / 点数价格 / 点数 * 365</li>
        </ul>
      </Text>
    </>
  );
};

export default IndexFeatTable;
