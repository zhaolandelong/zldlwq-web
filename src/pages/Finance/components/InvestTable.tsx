import React, { useEffect, useState } from 'react';
import { Table, Typography } from 'antd';
import type { ETFPosInfo, FinanceInfo, InvestInfo } from '../types';
import type { ColumnType } from 'antd/es/table';
import { ETF_INFOS } from '../constants';
import { getEtfOpCount } from '../utils';

const { Title } = Typography;

const columns: ColumnType<InvestInfo>[] = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '当前价',
    dataIndex: 'price',
    key: 'price',
    render: (price) => `¥ ${price}`,
  },
  {
    title: '月定投',
    dataIndex: 'monthlyAmount',
    key: 'monthlyAmount',
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
    key: 'scalingOptionCount',
    dataIndex: 'scalingOptionCount',
    render: (count) => `${count} OR (${count + 1})`,
  },
  {
    title: '加仓 ETF 补充',
    key: 'scalingEtfCount',
    dataIndex: 'scalingEtfCount',
    render: (count) => `${count} OR (${count - 10000})`,
  },
];

const InvestTable: React.FC<{
  etfPriceInfos: FinanceInfo[];
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
      const scalingCount = getEtfOpCount(
        info.monthlyAmount * info.scalingMutiple,
        price
      );
      return {
        code: info.code,
        price,
        name: ETF_INFOS.find((item) => item.code === info.code)?.name ?? '-',
        monthlyAmount: info.monthlyAmount,
        ...monthlyCount,
        scalingOptionCount: scalingCount.optionCount,
        scalingEtfCount: scalingCount.etfCount,
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
        rowKey="code"
        pagination={false}
      />
    </>
  );
};

export default InvestTable;
