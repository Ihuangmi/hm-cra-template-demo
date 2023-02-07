import { useState } from 'react';
import { createContainer } from 'unstated-next';

function useContext() {
  const [params, setParams] = useState();

  return {
    params,
    setParams,
  };
}

const HomeContext = createContainer(useContext);

export default HomeContext;
