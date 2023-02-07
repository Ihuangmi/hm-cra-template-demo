import type { ComponentType } from 'react';
import { lazy } from 'react';
import { Navigate } from 'react-router';
import { MenuDataItem } from '@/type';

function lazyLoad(src: () => Promise<{ default: ComponentType<any> }>) {
  return lazy(src);
}

const Home = lazyLoad(() => import('@/pages/Home/index'));
const NotFound = lazyLoad(() => import('@/pages/NotFound'));

const routes: MenuDataItem[] = [
  {
    path: '/',
    element: <Navigate to="/home" />,
  },
  {
    path: '/home/:id',
    auth: true,
    element: <Home />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

(function addNotFound(r: MenuDataItem[]) {
  r.forEach((route) => {
    if (route.routes?.length) {
      route.routes = [
        ...route.routes,
        {
          element: <NotFound />,
        },
      ];
      addNotFound(route.routes);
    }
  });
})(routes);

export default routes;
