import React, { useState } from 'react';
import { EditableProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Typography } from 'antd';
import ga from 'react-ga';
import { InvestBaseInfo } from '../types';
import { ETF_INFOS, ETF_PE13_PRICE } from '../constants';

const { Title, Text } = Typography;

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
    title: '首次加仓价',
    dataIndex: 'firstAdditionPrice',
    valueType: 'money',
    fieldProps: {
      step: 0.001,
      precision: 3,
    },
  },
  {
    title: '已加仓次数',
    dataIndex: 'additionTimes',
    valueType: 'digit',
    width: 105,
  },
  {
    title: 'ETF数量',
    dataIndex: 'etfCount',
    valueType: 'digit',
    width: 105,
    fieldProps: {
      step: 100,
    },
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

  const getOtherInfo = () => {
    const alreadyKeys = dataSource.map((item) => item.sCode);
    for (let i = 0; i < ETF_INFOS.length; i++) {
      const sCode = ETF_INFOS[i].sCode;
      if (!alreadyKeys.includes(sCode)) {
        return { sCode, firstAdditionPrice: ETF_PE13_PRICE[sCode] };
      }
    }
    return { sCode: '', firstAdditionPrice: 0 };
  };

  return (
    <>
      <Title level={2}>参数设置</Title>
      <EditableProTable<InvestBaseInfo>
        rowKey="id"
        maxLength={ETF_INFOS.length}
        bordered
        scroll={{
          x: 850,
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
          record: () => {
            const { sCode, firstAdditionPrice } = getOtherInfo();
            return {
              id: String(Date.now()),
              sCode,
              startDate: '2021-11-01',
              monthlyAmount: 25000,
              expectedReturnRate: 10,
              additionMutiple: 3,
              additionTimes: 0,
              firstAdditionPrice,
              etfCount: 0,
            };
          },
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
      <Text type="secondary">
        <ul>
          <li>
            若首次定投时，沪深300指数 PE &lt; 13，则首次加仓价 = 首次定投价 *
            0.9，请自行修改价格
          </li>
          <li>
            若首次定投时，沪深300指数 PE &gt; 13，
            <Text mark>请参考二维码里的彩蛋说明</Text>
            ，默认值取的就是彩蛋里的算法
          </li>
        </ul>
      </Text>
    </>
  );
};

export default PositionFormList;
