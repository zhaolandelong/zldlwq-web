import React, { useEffect, useState } from 'react';
import { Table, Typography } from 'antd';
import type { ETFPosInfo, StockInfo, InvestInfo } from '../types';
import type { ColumnType } from 'antd/es/table';
import { ETF_INFOS } from '../constants';
import { getEtfOpCount } from '../utils';

const { Title } = Typography;

const columns: ColumnType<InvestInfo>[] = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 100,
    fixed: 'left',
  },
  {
    title: '月定投',
    dataIndex: 'monthlyAmount',
    key: 'monthlyAmount',
    width: 100,
    render: (price) => `¥ ${price}`,
  },
  {
    title: '当前价',
    dataIndex: 'price',
    key: 'price',
    width: 80,
    render: (price) => `¥ ${price}`,
  },

  {
    title: '期权（手）',
    dataIndex: 'optionCount',
    key: 'optionCount',
    render: (count) => `${count} OR (${count + 1})`,
  },
  {
    title: 'ETF 补充',
    dataIndex: 'etfCount',
    key: 'etfCount',
    render: (count) => `${count} OR (${count - 10000})`,
  },
  {
    title: '加仓期权（手）',
    key: 'additionOptionCount',
    dataIndex: 'additionOptionCount',
    render: (count) => `${count} OR (${count + 1})`,
  },
  {
    title: '加仓 ETF 补充',
    key: 'additionEtfCount',
    dataIndex: 'additionEtfCount',
    render: (count) => `${count} OR (${count - 10000})`,
  },
];

const InvestTable: React.FC<{
  etfPriceInfos: StockInfo[];
  etfPosInfos: ETFPosInfo[];
}> = (props) => {
  const { etfPriceInfos, etfPosInfos } = props;
  const [dataSource, setDataSource] = useState<InvestInfo[]>([]);

  useEffect(() => {
    const investDataSource: InvestInfo[] = etfPosInfos.map((info) => {
      const price =
        etfPriceInfos.find((priceInfo) => priceInfo.code === info.code)
          ?.price ?? 0;
      const monthlyCount = getEtfOpCount(info.monthlyAmount, price);
      const additionCount = getEtfOpCount(
        info.monthlyAmount * info.additionMutiple,
        price
      );
      return {
        code: info.code,
        price,
        name: ETF_INFOS.find((item) => item.code === info.code)?.name ?? '-',
        monthlyAmount: info.monthlyAmount,
        ...monthlyCount,
        additionOptionCount: additionCount.optionCount,
        additionEtfCount: additionCount.etfCount,
      };
    });
    setDataSource(investDataSource);
  }, [etfPriceInfos, etfPosInfos]);

  return (
    <>
      <Title level={2}>Invest Info</Title>
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 810 }}
        bordered
        rowKey="code"
        pagination={false}
      />
    </>
  );
};

export default InvestTable;
