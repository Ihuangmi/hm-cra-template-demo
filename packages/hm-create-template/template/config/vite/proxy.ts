import { ProxyOptions } from 'vite';

type ProxyTargetList = Record<string, ProxyOptions>;

export function createProxy() {
  const ProxyList: ProxyTargetList = {
    '/api/custom/yzPlatform/oss': {
      target: 'http://test.api.newrank.cn',
      changeOrigin: true,
    },
    '/xdnphb/ade/v1/api/market': {
      target: 'http://test.a.newrank.cn',
      changeOrigin: true,
    },
    '/nr/user/login/': {
      target: 'http://test.a.newrank.cn',
      changeOrigin: true,
    },
    '/xdnphb/indent/create/pay': {
      target: 'http://test.pay.newrank.cn',
      changeOrigin: true,
    },
  };

  return ProxyList;
}
