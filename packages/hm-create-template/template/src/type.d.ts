import { RouteObject } from 'react-router';

export type MenuDataItem = {
  /** @name 子菜单 */
  routes?: MenuDataItem[];
  children?: MenuDataItem[];
  name?: string;
  /** @name 用于标定选中的值，默认是 path */
  key?: string;
  auth?: boolean;
  /** @name 路由权限 */
  access?: string;
} & RouteObject;
