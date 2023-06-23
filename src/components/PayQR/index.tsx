import React from 'react';
import { Space, Typography, Divider } from 'antd';
import QRPay5 from './QRPay5';
import QRPay10 from './QRPay10';
import QRPayAny from './QRPayAny';
const { Paragraph } = Typography;

const PayQR: React.FC = () => (
  <>
    <Divider>请我喝杯🥤？</Divider>
    <div style={{ textAlign: 'center' }}>
      <Paragraph>如果这个🔧帮你赚（省）💰了，就请我喝杯🥤吧~</Paragraph>
      <Space wrap align='center'>
        <QRPay5 />
        <QRPay10 />
        <QRPayAny />
      </Space>
    </div>
    <Divider>祝大家早日💰自由</Divider>
  </>
);

export default PayQR;
