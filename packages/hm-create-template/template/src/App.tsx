import { Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import routes from '@/routes';
import PageLoading from './components/Loading';
import GlobalContext from './context/GlobalContext';

import 'virtual:windi.css';
import './assets/css/index.less';

function App() {
  const GetRoutes = () => useRoutes(routes);

  return (
    <BrowserRouter basename="/mobile">
      <Suspense fallback={<PageLoading />}>
        <GlobalContext.Provider initialState={routes}>
          <GetRoutes />
        </GlobalContext.Provider>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
