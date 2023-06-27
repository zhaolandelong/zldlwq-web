import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Table, Typography } from 'antd';
import type {
  ProdDealDateKV,
  StockInfo,
  FeatureData,
  IndexInfo,
} from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, INDEX_INFOS } from '../constants';
import { fetchFeatPointByMonths } from '../services';
import { flatten } from 'lodash-es';
import moment from 'moment';
import { filterDealDates } from '../utils';

const { Title, Text } = Typography;

const INDEX_FEAT_INFOS = INDEX_INFOS.filter(
  ({ feat }) => feat
) as Required<IndexInfo>[];

const baseColumns: ColumnType<FeatureData>[] = [
  {
    title: (
      <div>
        日均打折
        <br />
        打折率
      </div>
    ),
    align: 'right',
    width: 95,
    sorter: (a, b) => a.discount / a.remainDays - b.discount / b.remainDays,
    render: (text, r) => (
      <>
        <div>
          ¥{((r.discount * r.featPointPrice) / r.remainDays).toFixed(2)}
        </div>
        <div style={{ color: '#f00' }}>
          {(
            (r.discount / (r.point + r.discount) / r.remainDays) *
            36500
          ).toFixed(2)}
          %
        </div>
      </>
    ),
  },
  {
    title: (
      <div>
        1手打折
        <br />
        剩余天数
      </div>
    ),
    dataIndex: 'discount',
    key: 'discount',
    align: 'right',
    render: (discount, r) => (
      <>
        <div>¥{(discount * r.featPointPrice).toFixed(0)}</div>
        <div style={{ color: '#f00' }}>{r.remainDays}天</div>
      </>
    ),
  },
  {
    title: (
      <div>
        点数
        <br />
        单价
      </div>
    ),
    dataIndex: 'point',
    key: 'point',
    align: 'right',
    sorter: (a, b) => a.point - b.point,
    render: (point, r) => (
      <>
        <div>{point.toFixed(2)}</div>
        <div style={{ color: '#f00' }}>¥{r.featPointPrice}</div>
      </>
    ),
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
  
  const filters = useMemo(() => {
    const months = Array.from(
      new Set(dataSource.map((info) => info.featCode.substring(2, 6)))
    );
    return months.map((month) => ({
      text: month,
      value: month,
    }));
  }, [dataSource]);

  const columns: ColumnType<FeatureData>[] = [
    {
      title: (
        <div>
          名称
          <br />
          代码
        </div>
      ),
      dataIndex: 'featCode',
      key: 'featCode',
      fixed: 'left',
      align: 'center',
      filters,
      onFilter: (value, r) => value === r.featCode.substring(2, 6),
      render: (code, r) => (
        <>
          <div>{r.name}</div>
          <div style={{ color: '#f00' }}>{code}</div>
        </>
      ),
    },
    ...baseColumns,
  ];

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
        scroll={{ x: 320 }}
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
          <li>年化打折率 = 日均打折 / 点数价格 / 股指点数 * 365</li>
        </ul>
      </Text>
    </>
  );
};

export default IndexFeatTable;
