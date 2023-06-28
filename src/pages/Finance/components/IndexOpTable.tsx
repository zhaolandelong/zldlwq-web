import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Table, Typography } from 'antd';
import type {
  ProdDealDateKV,
  StockInfo,
  OptionPnCData,
  IndexInfo,
} from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, INDEX_INFOS } from '../constants';
import { flattenDeep } from 'lodash-es';
import { fetchIndexOpPrimaryDatas } from '../services';
import { filterDealDates } from '../utils';

const { Title, Text } = Typography;

const INDEX_OP_INFOS = INDEX_INFOS.filter(
  ({ op }) => op
) as Required<IndexInfo>[];

const baseColumns: ColumnType<OptionPnCData>[] = [
  {
    title: (
      <div>
        日均打折
        <br />
        打折率
      </div>
    ),
    width: 95,
    align: 'right',
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays -
      (b.timeValueP - b.timeValueC) / b.remainDays,
    render: (text, r) => (
      <>
        <div>
          ¥{(((r.timeValueP - r.timeValueC) * 100) / r.remainDays).toFixed(2)}
        </div>
        <div style={{ color: '#f00' }}>
          {(
            ((r.timeValueP - r.timeValueC) / r.stockPrice / r.remainDays) *
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
    align: 'right',
    render: (text, r) => (
      <>
        <div>¥{((r.timeValueP - r.timeValueC) * 100).toFixed(0)}</div>
        <div style={{ color: '#f00' }}>{r.remainDays}天</div>
      </>
    ),
  },
  {
    title: (
      <div>
        行权价
        <br />
        股指点数
      </div>
    ),
    dataIndex: 'strikePrice',
    key: 'strikePrice',
    align: 'center',
    render: (price, r) => (
      <>
        <div>{price}</div>
        <div style={{ color: '#f00' }}>{r.stockPrice}</div>
      </>
    ),
  },
  {
    title: '时间价值(P|C)',
    dataIndex: 'timeValueP',
    key: 'timeValueP',
    align: 'center',
    render: (price, r) => (
      <>
        <div>¥{price.toFixed(2)}</div>
        <div style={{ color: '#f00' }}>¥{r.timeValueC.toFixed(2)}</div>
      </>
    ),
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

  const filters = useMemo(() => {
    const months = Array.from(
      new Set(dataSource.map(({ code }) => code.substring(2, 6)))
    );
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
          代码
        </div>
      ),
      dataIndex: 'code',
      key: 'code',
      fixed: 'left',
      align: 'center',
      filters,
      onFilter: (value, r) => value === r.code.substring(2, 6),
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
    const monthDealDates = filterDealDates(opCodes, featureDealDates);
    if (monthDealDates && Array.isArray(stockInfos) && stockInfos.length) {
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
        .then((indexOpArr) => {
          setDataSource(flattenDeep(indexOpArr));
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
        }))}
        value={codes}
        onChange={(vals) => setCodes(vals as string[])}
      />
      <Table
        size="small"
        columns={columns}
        scroll={{ x: 450 }}
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
          <li>
            年化打折率 = 日均打折 / 100 / 股指点数 * 365。用于跨品种对比打折程度
          </li>
        </ul>
      </Text>
    </>
  );
};

export default IndexOpTable;
