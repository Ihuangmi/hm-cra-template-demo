import GlobalContext from '@/context/GlobalContext';
import { MenuDataItem } from '@/type';
import React, { useMemo } from 'react';
import accessFactory from '../access';
import AccessContext, { AccessInstance } from './accessContext';
import { traverseModifyRoutes } from './traverseModifyRoutes';

interface Props {
  routes: MenuDataItem[];
  children?: React.ReactNode;
}

const AccessProvider: React.FC<Props> = (props) => {
  const { children, routes } = props;

  // globalContext
  const { initialState } = GlobalContext.useContainer();

  const access: AccessInstance = useMemo(() => accessFactory(initialState), [initialState]);

  console.log('eeee', traverseModifyRoutes(routes, access));

  return (
    <AccessContext.Provider value={access}>
      {/* @ts-ignore */}
      {React.cloneElement(children, {
        // @ts-ignore
        ...children.props,
        routes: traverseModifyRoutes(routes, access),
        loading: initialState.loading,
      })}
    </AccessContext.Provider>
  );
};

export default AccessProvider;
