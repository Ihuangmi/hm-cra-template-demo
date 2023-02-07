import { MenuDataItem } from '@/type';
import { InitialStateType } from '../GlobalContext';

// eslint-disable-next-line import/no-anonymous-default-export
export default function (initialState: InitialStateType) {
  const { accessInfo } = initialState || {};
  return {
    isRoles: (route: MenuDataItem) => {
      return accessInfo?.includes(route.path || '');
    },
    workOrderAdd: accessInfo?.includes('workOrder:add'), // 账户 - 全部工单 - 添加工单
    workOrderEdit: accessInfo?.includes('workOrder:edit'), // 账户 - 全部工单 - 修改工单 & 驳回工单
    portManager: accessInfo?.includes('port:manager'), // 账户 - 服务商管理 - 端口管理
    serviceProviderManager: accessInfo?.includes('serviceProvider:manager'), // 账户 - 服务商管理 - 服务商管理
  };
}
