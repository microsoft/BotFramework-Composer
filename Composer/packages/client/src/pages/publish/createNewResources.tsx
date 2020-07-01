// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useMemo, useContext, useEffect } from 'react';
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

  useEffect(() => {
    if (currentSubscription) {
      // get resource group under subscription
      actions.getResourceGroups(currentSubscription.subscriptionId);
    }
  }, [currentSubscription]);

  return (
    <form>
      <Dropdown
        label={formatMessage('Subscription')}
        options={subscriptionOption}
        placeholder={formatMessage('Select your subscription')}
        onChange={updateCurrentSubscription}
      />
      <Dropdown
        label={formatMessage('Resource group')}
        options={}
        placeholder={formatMessage('Select your resource group')}
        onChange={}
      />
      <Dropdown
        label={formatMessage('Location')}
        options={}
        placeholder={formatMessage('Select your location')}
        onChange={}
      />
    </form>
  );
};
