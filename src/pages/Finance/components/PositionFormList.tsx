import React, { useState } from 'react';
import { EditableProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Typography } from 'antd';
import { InvestBaseInfo } from '../types';
import { ETF_INFOS } from '../constants';

const { Title } = Typography;

const columns: ProColumns<InvestBaseInfo>[] = [
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
    title: '预期收益率%',
    dataIndex: 'expectedReturnRate',
    valueType: 'percent',
  },
  {
    title: '操作',
    width: 50,
    valueType: 'option',
  },
];

const PositionFormList: React.FC<{
  defaultValues: InvestBaseInfo[];
  onChange: (values: InvestBaseInfo[]) => void;
}> = (props) => {
  const { defaultValues, onChange } = props;
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(
    defaultValues.map((item) => item.sCode)
  );
  const [dataSource, setDataSource] = useState<readonly InvestBaseInfo[]>(
    () => defaultValues
  );

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

  return (
    <>
      <Title level={2}>参数</Title>
      <EditableProTable<InvestBaseInfo>
        rowKey="sCode"
        maxLength={ETF_INFOS.length}
        bordered
        scroll={{
          x: 570,
        }}
        toolBarRender={() => {
          return [
            <Button
              key="save"
              type='primary'
              onClick={() => {
                onChange(dataSource as InvestBaseInfo[]);
              }}
            >
              保存并计算
            </Button>,
          ];
        }}
        recordCreatorProps={{
          newRecordType: 'dataSource',
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
        onChange={setDataSource}
        editable={{
          type: 'multiple',
          editableKeys,
          actionRender: (row, config, defaultDoms) => {
            return [defaultDoms.delete];
          },
          onChange: setEditableRowKeys,
          onValuesChange: (record, recordList) => {
            setDataSource(recordList);
          },
        }}
      />
    </>
  );
};

export default PositionFormList;
