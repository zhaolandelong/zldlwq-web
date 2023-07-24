import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Table, Typography } from 'antd';
import type { StockInfo, IndexOpPnCData, IndexInfo } from '../types';
import type { ColumnType } from 'antd/es/table';
import { DEFAULT_CODES, INDEX_INFOS } from '../constants';
import { fetchIndexOpLastData, fetchIndexOpPrimaryDatas } from '../services';
import { calculateIndexOpMargin } from '../utils';
import { renderCell, renderTitle } from '../../../components/CellRender';

const { Title, Text } = Typography;

const INDEX_OP_INFOS = INDEX_INFOS.filter(
  ({ op }) => op
) as Required<IndexInfo>[];

interface OpRecord extends IndexOpPnCData, StockInfo, Required<IndexInfo> {
  margin: number;
}

const baseColumns: ColumnType<OpRecord>[] = [
  {
    title: renderTitle('日均打折', '打折率'),
    width: 110,
    align: 'right',
    sorter: (a, b) =>
      (a.timeValueP - a.timeValueC) / a.remainDays -
      (b.timeValueP - b.timeValueC) / b.remainDays,
    render: (text, r) =>
      renderCell(
        // `¥${r.margin.toFixed(2)}`,
        `¥${(((r.timeValueP - r.timeValueC) * 100) / r.remainDays).toFixed(2)}`,
        `${(
          ((r.timeValueP - r.timeValueC) / r.stockPrice / r.remainDays) *
          36500
        ).toFixed(2)}
    %`
      ),
  },
  {
    title: renderTitle('1手打折', '剩余天数'),
    align: 'right',
    render: (text, r) =>
      renderCell(
        `¥${((r.timeValueP - r.timeValueC) * 100).toFixed(0)}`,
        `${r.remainDays}天`
      ),
  },
  {
    title: renderTitle('行权价', '股指点数'),
    dataIndex: 'strikePrice',
    key: 'strikePrice',
    align: 'center',
    render: (price, r) => renderCell(price, r.stockPrice),
  },
  {
    title: '时间价值(P|C)',
    dataIndex: 'timeValueP',
    key: 'timeValueP',
    align: 'center',
    render: (price, r) =>
      renderCell(`¥${price.toFixed(2)}`, `¥${r.timeValueC.toFixed(2)}`),
  },
];

const IndexOpTable: React.FC<{
  stockInfos: StockInfo[];
  dealDates: string[];
}> = (props) => {
  const { stockInfos, dealDates = [] } = props;

  const [dataSource, setDataSource] = useState<OpRecord[]>([]);
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

  const columns: ColumnType<OpRecord>[] = [
    {
      title: renderTitle('名称', '代码'),
      dataIndex: 'opCode',
      key: 'opCode',
      fixed: 'left',
      align: 'center',
      filters,
      onFilter: (value, r) => value === r.opCode.substring(2, 6),
      render: (opCode, r) => renderCell(r.name, opCode),
    },
    ...baseColumns,
  ];

  useEffect(() => {
    if (dealDates.length && Array.isArray(stockInfos) && stockInfos.length) {
      setLoading(true);

      const stockOpInfos: (StockInfo & Required<IndexInfo>)[] =
        INDEX_OP_INFOS.filter(({ code }) => codes.includes(code)).map(
          (opInfo) => ({
            ...(stockInfos.find(
              ({ code }) => code === opInfo.code
            ) as StockInfo),
            ...opInfo,
          })
        );

      Promise.all(
        stockOpInfos.map((info) =>
          fetchIndexOpPrimaryDatas({
            indexInfo: info,
            op: info.op,
            dealDates,
          })
        )
      )
        .then(async (indexOpArr) => {
          const result: OpRecord[] = [];
          indexOpArr.forEach((opArr, i) => {
            const stockOpInfo = stockOpInfos[i];
            opArr.forEach((opData) => {
              result.push({
                ...opData,
                ...stockOpInfo,
                margin: 0,
              });
            });
          });
          await Promise.all(
            result.map((data, i) =>
              fetchIndexOpLastData(
                data.opCode.toLowerCase(),
                'P',
                data.strikePrice
              ).then((res) => {
                const margin = calculateIndexOpMargin({
                  settlePrice: res.lastClosePrice,
                  lastClosePrice: data.lastClosePrice,
                  strikePrice: data.strikePrice,
                  type: 'P',
                });
                result[i].margin = margin;
                return res;
              })
            )
          );
          setDataSource(result);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [stockInfos, dealDates]);

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
        rowKey="opCode"
        bordered
        loading={loading}
        pagination={false}
      />
      <Text type="secondary">
        <ul>
          {/* <li>
            「1手保证金」值为<Text mark>估算</Text>
            ，仅作参考，因暂时无法取到股指期权的结算价，故先用收盘价来计算
          </li>
          <li>
            1手保证金 = [结算价 + max(收盘价 * 调整系数 - 虚值额，最低保障系数 *
            行权价 * 调整系数)] * 100
          </li> */}
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
