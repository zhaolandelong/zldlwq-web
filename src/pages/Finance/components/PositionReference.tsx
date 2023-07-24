import React, { ReactNode, useMemo } from 'react';
import { List, Typography } from 'antd';
import type { ETFPosInfo } from '../types';
import { getRealInvestment } from '../utils';

const { Title, Text } = Typography;

// 合约名称：义300ETF购9月4400，权300ETF沽9月3900
// 持仓/可用：8

interface Reference {
  name: string;
  count: number;
}

const PostiionReference: React.FC<{
  loading: boolean;
  dataSource: ETFPosInfo[];
}> = (props) => {
  const { loading, dataSource } = props;
  const month = new Date().getMonth() + 2;

  const records = useMemo(() => {
    const datas: Reference[] = [];
    dataSource.forEach((da) => {
      const {
        name,
        additionPrice,
        monthlyAmount,
        additionMutiple,
        avgCost,
        actualReturnRate,
        price,
      } = da;
      const _count = getRealInvestment(da).count;
      const count = Math.floor(_count / 10000) + da.opErrorCount;
      // 合成多头
      datas.push({
        name: `权${name}购${month}月${Math.round(price * 10) * 100}`,
        count,
      });
      datas.push({
        name: `义${name}沽${month}月${Math.round(price * 10) * 100}`,
        count,
      });
      // 卖购止盈
      datas.push({
        name: `义${name}购0月${
          Math.round(avgCost * (1 + actualReturnRate / 100) * 10) * 100
        }`,
        count,
      });
      // 卖沽加仓
      datas.push({
        name: `义${name}沽0月${Math.round(additionPrice * 10) * 100}`,
        count: Number(
          ((monthlyAmount * additionMutiple) / additionPrice / 10000).toFixed(1)
        ),
      });
      // ETF
      datas.push({
        name: `${name} ETF基金`,
        count: (_count % 10000) + da.etfErrorCount,
      });
    });
    return datas;
  }, [dataSource, month]);

  return (
    <>
      <Title level={2}>移仓参考表</Title>
      <List
        dataSource={records}
        bordered
        style={{ maxWidth: 500 }}
        loading={loading}
        renderItem={({ name, count }) => {
          const match = name.match(/(.)(.+)(.)(\d+月)(\d{4})/);
          let left: ReactNode = name;
          if (match) {
            const [, callOrPut, op, sellOrBuy, month, price] = match;
            const cpSpan = (
              <span
                style={{
                  fontWeight: 'bold',
                  color: callOrPut === '义' ? '#0b0' : '#f00',
                }}
              >
                {callOrPut}
              </span>
            );
            const sbSpan = (
              <span
                style={{
                  fontWeight: 'bold',
                  color: sellOrBuy === '沽' ? '#0b0' : '#f00',
                }}
              >
                {sellOrBuy}
              </span>
            );
            left = (
              <>
                {cpSpan}
                {op}
                {sbSpan}
                {month}
                <span style={{ fontWeight: 'bold' }}>{price}</span>
              </>
            );
          }
          return (
            <List.Item style={{ display: 'flex', fontSize: 18 }}>
              <div>{left}</div>（{count}）
            </List.Item>
          );
        }}
      />
      <Text type="secondary">
        <ul>
          <li>
            因每个人做卖购和卖沽的<Text mark>日期不一样</Text>
            ，故月份无法明确显示，这里用 0 代替；
          </li>
          <li>若卖出认购价格超过行权价最大值，则忽略该条；</li>
          <li>表中持仓数仅为理论值，可能跟真实数据有差异，仅作参考；</li>
          <li>卖沽数量取小数点后1位，方便判断如何取整。</li>
        </ul>
      </Text>
    </>
  );
};

export default PostiionReference;
