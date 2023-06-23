import React from 'react';
import { QRCode } from 'antd';
import icon from './icon.svg';

const QR: React.FC = () => (
  <QRCode
    value="wxp://f2f17TYn7AFbNAuB0ERs_mjizQOqccmEuvyJgliyJayrODLRSRpzQ_4wR5RRb6lQPweq"
    errorLevel="H"
    icon={icon}
    size={110}
    iconSize={30}
  />
);

export default QR;
