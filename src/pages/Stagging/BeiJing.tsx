import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Table, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  fetchNewStagging,
  StaggingType,
  type BeiJingStaggingData,
} from './services';
import { renderCell, renderTitle } from '../../components/CellRender';

const { Title } = Typography;

const columns: ColumnType<BeiJingStaggingData>[] = [
  {
    title: renderTitle('名称', '代码'),
    key: 'name',
    render: (_, r) => renderCell(r.SECURITY_NAME_ABBR, r.SECURITY_CODE),
    width: 90,
  },
  {
    title: renderTitle('申购日期', '申购代码'),
    key: 'type',
    render: (_, r) =>
      renderCell(moment(r.APPLY_DATE).format('MM-DD'), r.APPLY_CODE),
    width: 90,
  },
  {
    title: renderTitle('中签率', '稳获百股所需资金(万元)'),
    key: 'rate',
    render: (_, r) =>
      renderCell(`${r.ONLINE_ISSUE_LWR ?? '-'}%`, `￥${(r.APPLY_AMT_100 / 10000).toFixed(2)}`),
    align: 'right',
    width: 150,
  },
  {
    title: renderTitle('发行价格', '网上发行(万股)'),
    key: 'actissqty',
    render: (_, r) =>
      renderCell(
        `￥${r.ISSUE_PRICE ?? '-'}`,
        Math.round(r.ONLINE_ISSUE_NUM / 10000)
      ),
    align: 'right',
    width: 100,
  },
  {
    title: '业务',
    dataIndex: 'MAIN_BUSINESS',
    key: 'business',
  },
];

const BeiJing: React.FC = () => {
  const [dataSource, setDataSource] = useState<BeiJingStaggingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchNewStagging(StaggingType.BEI_JING, {
      filter: `(APPLY_DATE>='${moment()
        .add(-30, 'days')
        .format('YYYY-MM-DD')}')`,
    })
      .then((res) => {
        setDataSource(res.result.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Title level={2}>北交所打新</Title>
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

export default BeiJing;
