import React from 'react';
import { QRCode } from 'antd';
import icon from './icon.svg';

const QR: React.FC = () => (
  <QRCode
    value="wxp://f2f0iBgazUszscX4upjT8VaWZP0HGNfdcFgSBp71qgmZ1xs"
    errorLevel="H"
    icon={icon}
    size={110}
    iconSize={30}
  />
);

export default QR;
