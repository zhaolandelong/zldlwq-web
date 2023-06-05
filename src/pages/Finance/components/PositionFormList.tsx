import React from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Space, Select, InputNumber, Input } from 'antd';
import { ETF_INFOS } from '../constants';

const onFinish = (values: any) => {
  console.log('Received values of form:', values);
};

const PositionFormList: React.FC = () => (
  <Form
    name="dynamic_form_nest_item"
    onFinish={onFinish}
    style={{ maxWidth: 600 }}
    autoComplete="off"
    initialValues={{ posInfos: [] }}
  >
    <Form.List name="posInfos">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space
              key={key}
              style={{ display: 'flex', marginBottom: 8 }}
              align="baseline"
            >
              <Form.Item
                {...restField}
                name={[name, 'code']}
                rules={[{ required: true, message: 'Missing first name' }]}
              >
                <Select
                  placeholder="code"
                  options={Object.values(ETF_INFOS).map((info) => ({
                    label: info.name,
                    value: info.code,
                  }))}
                />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'startDate']}
                rules={[{ required: true, message: 'Missing Start Date' }]}
              >
                <Input placeholder="Start Date" />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'monthlyAmount']}
                rules={[{ required: true, message: 'Missing Monthly Amount' }]}
              >
                <InputNumber placeholder="Monthly Amount" />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'expectedReturnRate']}
                rules={[
                  { required: true, message: 'Missing Expected Return Rate' },
                ]}
              >
                <InputNumber placeholder="Expected Return Rate" />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'additionMutiple']}
                rules={[{ required: true, message: 'Missing Addition Mutiple' }]}
              >
                <InputNumber placeholder="Addition Mutiple" />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
            >
              Add field
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
    <Form.Item>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  </Form>
);

export default PositionFormList;
