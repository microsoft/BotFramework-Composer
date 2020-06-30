// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment, useMemo, useContext } from 'react';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { StoreContext } from '../../store';
import { Subscription } from '../../store/types';

export const CreateNewResource: React.FC = () => {
  const { state, actions } = useContext(StoreContext);
  const { subscriptions } = state;
  const [currentSubscription, setSubscriptions] = useState<Subscription>();
  const subscriptionOption = useMemo(() => {
    return subscriptions.map((t) => ({ key: t.subscriptionId, text: t.displayName }));
  }, [subscriptions]);

  const updateCurrentSubscription = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const sub = subscriptions.find((t) => t.subscriptionId === option?.key);

      if (sub) {
        setSubscriptions(sub);
      }
    },
    [subscriptions]
  );

  return (
    <form>
      <Dropdown
        label={formatMessage('Publish Destination Type')}
        options={subscriptionOption}
        placeholder={formatMessage('Choose One')}
        onChange={updateCurrentSubscription}
      />
    </form>
  );
};
