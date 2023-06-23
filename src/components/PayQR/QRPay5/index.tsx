import React from 'react';
import { QRCode } from 'antd';
import icon from './icon.svg';

const QR: React.FC = () => (
  <QRCode
    value="wxp://f2f1m6Y9KjqKUO4HJ_vCd8ZmMTQE0ze1EBMmHjqaeDW1yy6lh26zH7FgsPWFoT6TU40A"
    errorLevel="H"
    icon={icon}
    size={110}
    iconSize={30}
  />
);

export default QR;
