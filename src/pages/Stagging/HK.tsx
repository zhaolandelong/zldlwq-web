import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Table, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { fetchHKStagging, type HKStaggingItem } from './services';
import { renderCell, renderTitle } from '../../components/CellRender';

const { Title } = Typography;

const columns: ColumnType<HKStaggingItem>[] = [
  {
    title: renderTitle('名称', '代码'),
    key: 'name',
    render: (_, r) => renderCell(r.name, r.symbol),
    width: 90,
  },
  {
    title: renderTitle('招股时间', '招股价格'),
    key: 'apply_begin_date',
    render: (_, r) =>
      renderCell(
        moment(r.apply_begin_date).format('MMDD') +
          ' ~ ' +
          moment(r.apply_end_date).format('MMDD'),
        `¥${r.issprice_min.toFixed(2)} / ¥${r.issprice_max.toFixed(2)}`
      ),
    align: 'right',
    width: 150,
  },
  {
    title: renderTitle('上市日期', '招股数(万)'),
    key: 'actissqty',
    render: (_, r) =>
      renderCell(
        moment(r.list_date).format('MM-DD'),
        Math.round(r.actissqty / 10000)
      ),
    align: 'right',
    width: 100,
  },
  {
    title: '业务',
    dataIndex: 'business',
    key: 'business',
  },
];

const HK: React.FC = () => {
  const [dataSource, setDataSource] = useState<HKStaggingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchHKStagging()
      .then((res) => {
        setDataSource(res.data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Title level={2}>港股打新</Title>
      <Table
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        rowKey="symbol"
        pagination={false}
        scroll={{ x: 550 }}
        size="small"
        bordered
      />
    </>
  );
};

export default HK;
