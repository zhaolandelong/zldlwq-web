import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { List, Typography, Col, Row } from 'antd';
import type { ETFPosInfo, EtfOpPnCData, StockInfo } from '../types';
import { getRealInvestment, calculateEtfOpMargin } from '../utils';
import { fetchEtfOpPrimaryDatas } from '../services';
import moment from 'moment';
import { flattenDeep } from 'lodash-es';

const { Title, Text } = Typography;

// 合约名称：义300ETF购9月4400，权300ETF沽9月3900
// 持仓/可用：8

interface Reference {
  name: string;
  margin: number;
  count: number;
}

const PostiionReference: React.FC<{
  loading: boolean;
  dataSource: ETFPosInfo[];
  stockInfos: StockInfo[];
}> = (props) => {
  const { loading: propsLoading, dataSource, stockInfos } = props;
  const [loading, setLoading] = useState(false);
  const [etfInfos, setEtfInfos] = useState<EtfOpPnCData[]>([]);
  const month = new Date().getMonth() + 2;

  useEffect(() => {
    if (Array.isArray(stockInfos) && stockInfos.length) {
      const fetchStockInfos: StockInfo[] = [];
      dataSource.forEach((ds) => {
        const info = stockInfos.find((si) => si.sCode === ds.sCode);
        if (info) {
          fetchStockInfos.push({ ...info }); // 多头
          fetchStockInfos.push({
            ...info,
            price: ds.avgCost * (1 + ds.actualReturnRate / 100),
          }); // 卖购
          fetchStockInfos.push({ ...info, price: ds.additionPrice }); // 卖沽
        }
      });
      const months = [moment().add(1, 'M').format('YYMM')];
      setLoading(true);
      Promise.all(
        fetchStockInfos.map((info) => fetchEtfOpPrimaryDatas(info, months))
      )
        .then((etfOpArr) => {
          setEtfInfos(flattenDeep(etfOpArr));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [stockInfos, dataSource]);

  const records = useMemo(() => {
    if (etfInfos.length === 0 || dataSource.length === 0) {
      return [];
    }
    const datas: Reference[] = [];
    let i = -1;
    let etfInfo;
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
        margin: 0,
        count,
      });
      etfInfo = etfInfos[++i];
      datas.push({
        name: `义${name}沽${month}月${Math.round(price * 10) * 100}`,
        margin:
          calculateEtfOpMargin({
            settlePrice: etfInfo.settlePriceP,
            lastClosePrice: etfInfo.stockLastClosePrice,
            strikePrice: etfInfo.strikePrice,
            type: 'P',
          }) * count,
        count,
      });
      // 卖购止盈
      etfInfo = etfInfos[++i];
      datas.push({
        name: `义${name}购${month}月${
          Math.round(avgCost * (1 + actualReturnRate / 100) * 10) * 100
        }`,
        margin:
          calculateEtfOpMargin({
            settlePrice: etfInfo.settlePriceC,
            lastClosePrice: etfInfo.stockLastClosePrice,
            strikePrice: etfInfo.strikePrice,
            type: 'C',
          }) * count,
        count,
      });
      // 卖沽加仓
      etfInfo = etfInfos[++i];
      datas.push({
        name: `义${name}沽${month}月${Math.round(additionPrice * 10) * 100}`,
        margin:
          calculateEtfOpMargin({
            settlePrice: etfInfo.settlePriceP,
            lastClosePrice: etfInfo.stockLastClosePrice,
            strikePrice: etfInfo.strikePrice,
            type: 'P',
          }) * count,
        count: Number(
          ((monthlyAmount * additionMutiple) / additionPrice / 10000).toFixed(1)
        ),
      });
      // ETF
      datas.push({
        name: `${name} ETF基金`,
        margin: price * ((_count % 10000) + da.etfErrorCount),
        count: (_count % 10000) + da.etfErrorCount,
      });
    });
    return datas;
  }, [dataSource, month, etfInfos]);

  return (
    <>
      <Title level={2}>移仓参考表</Title>
      <List
        dataSource={records}
        bordered
        style={{ maxWidth: 500 }}
        loading={loading || propsLoading}
        header={
          <Row style={{ width: '100%' }}>
            <Col span={12}>合约/基金名称</Col>
            <Col span={6} style={{ textAlign: 'center' }}>
              持仓
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              资金占用
            </Col>
          </Row>
        }
        renderItem={({ name, count, margin }) => {
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
            <List.Item>
              <Row style={{ width: '100%' }}>
                <Col span={12}>{left}</Col>
                <Col span={6} style={{ textAlign: 'center' }}>
                  {count}
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  ¥{margin.toFixed(2)}
                </Col>
              </Row>
            </List.Item>
          );
        }}
      />
      <Text type="secondary">
        <ul>
          <li>
            因每个人做卖购和卖沽的<Text mark>日期不一样</Text>
            ，故月份无法明确显示，此处取合成多头相同月份；
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
