import React, { useEffect, useState, useContext } from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { StoreContext } from '../../store';

import { loading } from './styles';

export const RequireAuth: React.FC = props => {
  const { state, actions } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // attempt to login user when component mounts if auth is required
  useEffect(() => {
    if (process.env.COMPOSER_REQUIRE_AUTH) {
      actions.loginUser();
    }
  }, []);

  useEffect(() => {
    setIsLoading(!state.userToken);
  }, [state.userToken]);

  if (process.env.COMPOSER_REQUIRE_AUTH && isLoading) {
    return (
      <div css={loading}>
        <Spinner label={formatMessage('Loading...')} size={SpinnerSize.large} />
      </div>
    );
  }

  return <>{props.children}</>;
};
