import React, { useState } from 'react';
import { EditableProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Typography } from 'antd';
import { InvestBaseInfo } from '../types';
import { ETF_INFOS } from '../constants';

const { Title } = Typography;

const baseColumns: ProColumns<InvestBaseInfo>[] = [
  {
    title: 'ETF',
    dataIndex: 'sCode',
    valueType: 'select',
    valueEnum: ETF_INFOS.reduce((acc, item) => {
      acc[item.sCode] = item.name;
      return acc;
    }, {} as Record<string, string>),
  },
  {
    title: '起投日期',
    dataIndex: 'startDate',
    valueType: 'date',
  },
  {
    title: '月定投额',
    dataIndex: 'monthlyAmount',
    valueType: 'money',
  },
  {
    title: '预期收益率',
    dataIndex: 'expectedReturnRate',
    valueType: 'percent',
  },
];

const PositionFormList: React.FC<{
  defaultValues: InvestBaseInfo[];
  onChange: (values: InvestBaseInfo[]) => void;
}> = (props) => {
  const { defaultValues, onChange } = props;
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<readonly InvestBaseInfo[]>(defaultValues);
  const columns: ProColumns<InvestBaseInfo>[] = [
    ...baseColumns,
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      align: 'center',
      render: (text, r, _, action) => [
        <Button
          key="editable"
          type="link"
          onClick={() => {
            action?.startEditable?.(r.sCode);
          }}
        >
          编辑
        </Button>,
        <Button
          type="link"
          key="delete"
          onClick={() => {
            const result = dataSource.filter(
              (item) => item.sCode !== r.sCode
            );
            setDataSource(result);
            onChange(result);
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  const getOtherKey = () => {
    const alreadyKeys = dataSource.map((item) => item.sCode);
    for (let i = 0; i < ETF_INFOS.length; i++) {
      const sCode = ETF_INFOS[i].sCode;
      if (!alreadyKeys.includes(sCode)) {
        return sCode;
      }
    }
    return '';
  };

  const handleChange = (value: readonly InvestBaseInfo[]) => {
    setDataSource(value);
    onChange(value as InvestBaseInfo[]);
  };
  return (
    <>
      <Title level={2}>参数</Title>
      <EditableProTable<InvestBaseInfo>
        rowKey="sCode"
        className='position-form-list'
        maxLength={ETF_INFOS.length}
        bordered
        scroll={{
          x: 570,
        }}
        recordCreatorProps={{
          record: () => ({
            sCode: getOtherKey(),
            startDate: '2021-11-01',
            monthlyAmount: 25000,
            expectedReturnRate: 10,
            additionMutiple: 3,
          }),
        }}
        columns={columns}
        value={dataSource}
        onChange={handleChange}
        editable={{
          type: 'single',
          editableKeys,
          onChange: setEditableRowKeys,
        }}
      />
    </>
  );
};

export default PositionFormList;
