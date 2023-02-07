import { useEffect, useState } from 'react';
import { getUser } from '@/api';
import { getBreadcrumbNameMap } from '@/routes/utils';
import { createContainer } from 'unstated-next';
import { MenuDataItem } from '@/type';

export type InitialStateType = {
  loading: boolean;
  userInfo?: Record<string, any>;
  accessInfo?: string[];
};

/**
 * 判断是否需要登陆
 * @param routes
 * @returns
 */
const checkAuth = (routes: MenuDataItem[]) => {
  const breadcrumbMap = getBreadcrumbNameMap(routes);

  // 需要将location.pathname的/mobile 删除  否则没法与正确的路由配置匹配
  if (!breadcrumbMap?.get(location.pathname.split('/mobile')[1])?.auth) return false;

  return true;
};

const fetchUserInfo = async () => {
  try {
    const res = await getUser();

    if (!res.result) {
      throw new Error('用户未登录');
    }

    const result = res?.result;

    return {
      userInfo: result,
      accessInfo: [],
    };
  } catch (error) {
    return {
      userInfo: undefined,
      access: [],
    };
  }
};

function useGlobalContext(routes: MenuDataItem[] = []) {
  // 由代码实现从无需登录页面跳转到需要登录页面时需要更新一下refresh值来获取initialState，否则会一直在转圈页面
  const [refresh, setRefresh] = useState<number>(0);
  const [initialState, setInitialState] = useState<InitialStateType>({
    loading: true,
    userInfo: {},
    accessInfo: [],
  });

  useEffect(() => {
    if (!checkAuth(routes)) {
      // return;
    }
    // 请求
    fetchUserInfo()
      .then((res) => {
        if (res.userInfo) {
          setInitialState({
            loading: false,
            userInfo: res.userInfo,
            accessInfo: res.accessInfo,
          });
        }
      })
      .catch(() => {
        setInitialState({ loading: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  return {
    initialState,
    setInitialState,
    setRefresh,
  };
}

export default createContainer(useGlobalContext);
