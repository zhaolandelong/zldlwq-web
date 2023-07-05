import { axiosGet } from './request';

export const fetchSinaFinance = (query: string, cached: boolean = false) =>
  axiosGet(
    // `https://a28c74f8c23a43c8a36364498baae175.apig.cn-north-1.huaweicloudapis.com/?query=${query}`
    `http://api.1to10.zldlwq.top/api/sina?query=${query}`,
    cached
  );

export const fetchXueqiu = <T>(
  pathname: string,
  query?: any,
  cached = false
): Promise<{
  data: T;
  error_code: number;
  error_description: string;
}> =>
  axiosGet(
    `http://api.1to10.zldlwq.top/api/xueqiu${pathname}?${new URLSearchParams(
      query
    ).toString()}`,
    cached
  );
