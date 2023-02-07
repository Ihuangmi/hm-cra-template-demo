import React from 'react';
import { Button, ErrorBlock } from 'antd-mobile';
import { useNavigate } from 'react-router';

const NoFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="tw-flex tw-flex-col tw-h-screen tw-justify-center">
      <ErrorBlock status="empty">
        <Button color="primary" onClick={() => navigate('/', { replace: true })}>
          返回首页
        </Button>
      </ErrorBlock>
    </div>
  );
};

export default NoFoundPage;
