import { requestGW, requestXYZ } from '@/service';

// 退出登录
export async function loginOut() {
  return requestXYZ.post({
    url: '/nr/user/login/loginOut',
  });
}

// 获取用户信息以及相关信息同步
export async function getUser() {
  return requestGW.get({
    url: '/api/nr-trade-security/xdnphb/adinsight/security/user/getUserInfo',
  });
}

// 素材审核-详情
export async function reqAuditingDetail(params) {
  return requestGW.get({
    url: '/api/adinsight/adinsight/xdnphb/adinsight/material/auditing/detail',
    params,
  });
}

// 素材审核--批注添加
export async function reqAuditingAddRemark(data) {
  return requestGW.post({
    url: '/api/adinsight/adinsight/xdnphb/adinsight/material/auditing/addRemark',
    data,
  });
}
// 素材审核-通过/驳回
export async function reqAuditingAudit(params) {
  return requestGW.get({
    url: '/api/adinsight/adinsight/xdnphb/adinsight/material/auditing/audit',
    params,
  });
}

// 素材审核-历史版本
export async function reqAuditingHistory(params) {
  return requestGW.get({
    url: '/api/adinsight/adinsight/xdnphb/adinsight/material/auditing/history',
    params,
  });
}
