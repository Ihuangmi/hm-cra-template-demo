import React, { useState } from 'react';
import classNames from 'classnames';
import { Tabs, Avatar, Popover } from 'antd-mobile';
import Video from './components/Video';
import History from './components/History';
import useContext from './useContext';
import GlobalContext from '@/context/GlobalContext';
import { Action } from 'antd-mobile/es/components/popover';
import { loginOut } from '@/api';
import memoryConfig from '@/utils/memoryConfig';
import styles from './index.module.less';

const tabItems = [
  { key: '1', title: '素材审核' },
  { key: '2', title: '审批记录' },
];

const actions: Action[] = [{ key: 'logout', text: '退出登录' }];

const Home: React.FC = () => {
  const { initialState } = GlobalContext.useContainer();
  const { userInfo } = initialState;

  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * 退出登录
   */
  const handleLoginOut = async () => {
    window.location.href = memoryConfig.loginUrl;
    loginOut()
      .then(() => {
        window.location.href = memoryConfig.loginUrl;
      })
      .catch(() => {
        window.location.href = memoryConfig.loginUrl;
      });
  };

  return (
    <useContext.Provider>
      <div className={classNames(styles.homeConteiner, activeIndex === 1 ? styles.history : '')}>
        <div className={classNames(styles.tabsWrapper, 'tw-w-full tw-flex tw-justify-center')}>
          <Popover.Menu actions={actions} onAction={() => handleLoginOut()} placement="bottomLeft" trigger="click">
            <Avatar style={{ '--size': '32px' }} src={userInfo?.headImgUrl} className={styles.avatar} />
          </Popover.Menu>

          <Tabs
            activeKey={tabItems[activeIndex].key}
            onChange={(key) => {
              const index = tabItems.findIndex((item) => item.key === key);
              setActiveIndex(index);
            }}
          >
            {tabItems.map((item) => (
              <Tabs.Tab title={item.title} key={item.key} />
            ))}
          </Tabs>
        </div>
        {activeIndex === 0 ? <Video /> : <History />}
      </div>
    </useContext.Provider>
  );
};

export default React.memo(Home);
