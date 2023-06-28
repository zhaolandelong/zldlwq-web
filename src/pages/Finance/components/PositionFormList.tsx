import React, { useState } from 'react';
import { EditableProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Typography } from 'antd';
import ga from 'react-ga';
import { InvestBaseInfo } from '../types';
import { ETF_INFOS } from '../constants';

const { Title } = Typography;

const columns: ProColumns<InvestBaseInfo>[] = [
  {
    title: 'ETF',
    dataIndex: 'sCode',
    valueType: 'select',
    fieldProps: {
      allowClear: false,
    },
    valueEnum: ETF_INFOS.reduce((acc, item) => {
      acc[item.sCode] = item.name;
      return acc;
    }, {} as Record<string, string>),
  },
  {
    title: '起投日期',
    dataIndex: 'startDate',
    valueType: 'text',
    width: 140,
    fieldProps: {
      allowClear: false,
    },
  },
  {
    title: '月定投额',
    dataIndex: 'monthlyAmount',
    valueType: 'money',
    fieldProps: {
      step: 1000,
    },
  },
  {
    title: '预期收益率%',
    dataIndex: 'expectedReturnRate',
    valueType: () => ({
      type: 'percent',
      precision: 0,
    }),
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
  const [dataSource, setDataSource] = useState<readonly InvestBaseInfo[]>(() =>
    defaultValues.map((val, i) => {
      if (!val.id) {
        val.id = String(Date.now() + i);
      }
      return val;
    })
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
        rowKey="id"
        maxLength={ETF_INFOS.length}
        bordered
        scroll={{
          x: 570,
        }}
        toolBarRender={() => {
          return [
            <Button
              key="reset"
              onClick={() => {
                ga.event({
                  category: 'Event',
                  action: 'Click',
                  label: 'Clear',
                });
                setDataSource([]);
              }}
            >
              清空
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={() => {
                ga.event({ category: 'Event', action: 'Click', label: 'Save' });
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
            id: String(Date.now()),
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
          editableKeys: dataSource.map(({ id }) => id as string),
          actionRender: (row, config, defaultDoms) => {
            return [defaultDoms.delete];
          },
          onValuesChange: (record, recordList) => {
            setDataSource(recordList);
          },
        }}
      />
    </>
  );
};

export default PositionFormList;
