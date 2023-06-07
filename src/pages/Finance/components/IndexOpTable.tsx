import React, { useEffect, useState } from 'react';
import { Checkbox, Col, Row, Table, Typography } from 'antd';
import type { ProdDealDateKV, StockInfo, OptionPnCData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, INDEX_OP_INFOS } from '../constants';
import { flattenDeep } from 'lodash-es';
import { fetchIndexOpPrimaryDatas } from '../services';
import { filterDealDates } from '../utils';

const { Title, Text } = Typography;

const columns: ColumnType<OptionPnCData>[] = [
  {
    title: '名称 | 代码',
    dataIndex: 'code',
    key: 'code',
    width: 150,
    fixed: 'left',
    align:'center',
    filters: Object.values(INDEX_OP_INFOS).map((info) => ({
      text: info.op,
      value: info.op,
    })),
    onFilter: (value, r) => r.code.startsWith(value as string),
    render: (code, r) => (
      <Row>
        <Col span={12} style={{ textAlign: 'right' }}>
          {r.name}
        </Col>
        <Col span={12}>{code}</Col>
      </Row>
    ),
  },
  {
    title: '日均打折|打折率',
    align: 'right',
    width: 170,
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays -
      (b.timeValueP - b.timeValueC) / b.remainDays,
    render: (text, r) => (
      <Row>
        <Col span={12}>
          ¥
          {(
            ((r.timeValueP - r.timeValueC) * 100) /
            r.remainDays
          ).toFixed(2)}
        </Col>
        <Col span={12} style={{ color: '#f00' }}>
          (
          {(
            ((r.timeValueP - r.timeValueC) /
              r.strikePrice /
              r.remainDays) *
            36500
          ).toFixed(2)}
          %)
        </Col>
      </Row>
    ),
  },
  {
    title: '1 手打折|剩余',
    align: 'right',
    width: 160,
    sorter: (a, b) => a.timeValueP - a.timeValueC - b.timeValueP + b.timeValueC,
    render: (text, r) => (
      <Row>
        <Col span={12}>
          ¥{((r.timeValueP - r.timeValueC) * 100).toFixed(0)}
        </Col>
        <Col span={12} style={{ color: '#f00' }}>
          ({r.remainDays} 天)
        </Col>
      </Row>
    ),
  },
  {
    title: '行权价',
    dataIndex: 'strikePrice',
    key: 'strikePrice',
    align: 'center',
  },
  {
    title: '时间价值(P|C)',
    dataIndex: 'timeValueP',
    key: 'timeValueP',
    align: 'center',
    width: 160,
    sorter: (a, b) => a.timeValueP - b.timeValueP,
    render: (price,r) => <Row>
    <Col span={12}>¥{price.toFixed(2)}</Col>
    <Col span={12} style={{ color: '#f00' }}>
      ¥{r.timeValueC.toFixed(2)}
    </Col>
  </Row>,
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
