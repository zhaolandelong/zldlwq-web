import React from 'react';
import { Divider, Typography } from 'antd';
import ImgPayArticle from './pay-article.png';
const { Paragraph, Text } = Typography;

const QR: React.FC = () => (
  <>
    <Divider>请我喝杯🥤？</Divider>
    <div style={{ textAlign: 'center' }}>
      <Paragraph>如果这个🔧帮你赚（省）💰了，就请我喝杯🥤吧~</Paragraph>
      {/* <QRCode
        value="https://mp.weixin.qq.com/s/c9h0B3pqCuRpOO1BjXhQiA"
        errorLevel="H"
        icon={icon}
      /> */}
      <img style={{ width: 100 }} src={ImgPayArticle} alt="pay article" />
      <br />
      <Text type="secondary">因为不能放收款码，所以只能用文章打赏了</Text>
    </div>
    <Divider>祝大家早日💰自由</Divider>
  </>
);

export default QR;
