import React, { useEffect, useState } from 'react';
import { Checkbox, Table, Typography, Col, Row } from 'antd';
import type { StockInfo, OptionPnCData } from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, ETF_INFOS } from '../constants';
import { flattenDeep } from 'lodash-es';
import { fetchEtfOpPrimaryDatas } from '../services';

const { Title, Text } = Typography;

const columns: ColumnType<OptionPnCData>[] = [
  {
    title: 'ETF 期权|月份',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 120,
    align:'center',
    render: (name, r) => (
      <Row>
        <Col style={{ textAlign: 'right' }} span={14}>
          {name}
        </Col>
        <Col span={10}>{r.month}</Col>
      </Row>
    ),
  },
  {
    title: '日均打折|打折率',
    align: 'right',
    width: 170,
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays / a.strikePrice -
      (b.timeValueP - b.timeValueC) / b.remainDays / b.strikePrice,
    render: (text, r) => (
      <Row>
        <Col span={12}>
          ¥
          {(
            ((r.timeValueP - r.timeValueC) * 10000) /
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
    render: (text, r) => (
      <Row>
        <Col span={12}>
          ¥{((r.timeValueP - r.timeValueC) * 10000).toFixed(0)}
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
    render: (price, r) => `¥${price.toFixed(3)}`,
  },
  {
    title: '时间价值(P|C)',
    dataIndex: 'timeValueP',
    key: 'timeValueP',
    align: 'center',
    width: 180,
    render: (price, r) => (
      <Row>
        <Col span={12}>¥{price.toFixed(4)}</Col>
        <Col span={12} style={{ color: '#f00' }}>
          ¥{r.timeValueC.toFixed(4)}
        </Col>
      </Row>
    ),
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
    if (Array.isArray(stockInfos) && stockInfos.length) {
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
    }
  }, [stockInfos]);

  return (
    <>
      <Title level={2}>ETF 期权</Title>
      <Checkbox.Group
        options={ETF_INFOS.map((info) => ({
          label: info.name,
          value: info.code,
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
          <li>打折率 = 日均打折 / 10000 / 行权价 * 365</li>
        </ul>
      </Text>
    </>
  );
};

export default ETFOpTable;
