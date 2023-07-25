import React from 'react';
import { Divider, Typography } from 'antd';
import img from './instructions.png';

const { Paragraph, Text } = Typography;

const Instructions: React.FC = () => (
  <>
    <Divider>使用说明</Divider>
    <div style={{ textAlign: 'center' }}>
      <Paragraph>如果看了备注还不会用，看看这个说明书吧。</Paragraph>
      {/* <QRCode
        value="https://mp.weixin.qq.com/s/gNQeioR7n70sxON8N1W2rg"
        errorLevel="H"
        icon={icon}
      /> */}
      <img style={{ width: 100 }} src={img} alt="pay article" />
      <br />
      <Text type="secondary">长按识别二维码</Text>
    </div>
    <Divider>看懂了的话记得请我喝杯🥤哦~</Divider>
  </>
);

export default Instructions;
