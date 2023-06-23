import React from 'react';
import { Typography, Divider, Row, Col } from 'antd';
import Pay5 from './QRPay5/pay5.png';
import Pay10 from './QRPay10/pay10.png';
import PayAny from './QRPayAny/payany.png';
const { Paragraph } = Typography;

const PayQR: React.FC = () => (
  <>
    <Divider>请我喝杯🥤？</Divider>
    <div style={{ textAlign: 'center' }}>
      <Paragraph>如果这个🔧帮你赚（省）💰了，就请我喝杯🥤吧~</Paragraph>
      <Row justify="center" gutter={8}>
        <Col lg={4} xs={8}>
          <img src={Pay5} alt="pay5" style={{ width: '100%' }} />
        </Col>
        <Col lg={4} xs={8}>
          <img src={Pay10} alt="pay10" style={{ width: '100%' }} />
        </Col>
        <Col lg={4} xs={8}>
          <img src={PayAny} alt="payany" style={{ width: '100%' }} />
        </Col>
      </Row>
    </div>
    <Divider>祝大家早日💰自由</Divider>
  </>
);

export default PayQR;
