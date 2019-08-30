import React, { useEffect } from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { loginUser, getUserToken } from '../../utils/auth';

import { loading } from './styles';

export const RequireAuth: React.FC = props => {
  useEffect(() => {
    if (process.env.COMPOSER_REQUIRE_AUTH) {
      loginUser();
    }
  }, []);

  if (process.env.COMPOSER_REQUIRE_AUTH && !getUserToken()) {
    return (
      <div css={loading}>
        <Spinner label={formatMessage('Loading...')} size={SpinnerSize.large} />
      </div>
    );
  }

  return <>{props.children}</>;
};
