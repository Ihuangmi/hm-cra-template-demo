import { MenuDataItem } from '../type';
import { isEqual } from 'lodash';
import memoizeOne from 'memoize-one';

const mergePath = (path: string = '', parentPath: string = '/') => {
  if ((path || parentPath).startsWith('/')) {
    return path;
  }
  return `/${parentPath}/${path}`.replace(/\/\//g, '/').replace(/\/\//g, '/');
};

const stripQueryStringAndHashFromPath = (url: string) => {
  return url.split('?')[0].split('#')[0];
};

/**
 * 获取面包屑映射
 * @param Route[] menuData 菜单配置
 */
const getBreadcrumbNameMap = memoizeOne((routes?: MenuDataItem[]): Map<string, MenuDataItem> => {
  // Map is used to ensure the order of keys
  const routerMap = new Map<string, MenuDataItem>();
  const flattenMenuData = (data?: MenuDataItem[], parent?: MenuDataItem) => {
    data?.forEach((menuItem) => {
      if (menuItem && menuItem?.children) {
        flattenMenuData(menuItem?.children, menuItem);
      }
      // Reduce memory usage
      const path = mergePath(menuItem.path, parent ? parent.path : '/');
      routerMap.set(stripQueryStringAndHashFromPath(path), menuItem);
    });
  };
  flattenMenuData(routes);
  return routerMap;
}, isEqual);

export { getBreadcrumbNameMap };
