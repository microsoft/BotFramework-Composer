// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Subscription } from '@azure/arm-subscriptions/esm/models';
import React, { useEffect, useState } from 'react';
import formatMessage from 'format-message';

import { SearchableDropdown, SearchableDropdownProps } from '../shared/searchableDropdown/SearchableDropdown';
import { getSubscriptions } from '../../api';

type Props = {
  allowCreation?: boolean;
  canRefresh?: boolean;
  accessToken: string;
  onSubscriptionChange: (subscriptionId: string) => void;
} & Omit<SearchableDropdownProps, 'items' | 'onSubmit'>;

export const SubscriptionPicker = React.memo((props: Props) => {
  const { accessToken } = props;
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (accessToken) {
      setErrorMessage(undefined);
      setIsLoading(true);
      (async () => {
        try {
          const subscriptions = await getSubscriptions(accessToken);
          if (subscriptions.length === 0) {
            setErrorMessage(
              formatMessage(
                'Your subscription list is empty, please add your subscription, or login with another account.'
              )
            );
          }
          setSubscriptions(subscriptions);
          setIsLoading(false);
        } catch (ex) {
          setSubscriptions([]);
          setIsLoading(false);
          setErrorMessage(ex.message);
        }
      })();
    }
  }, [accessToken]);

  const localTextFieldProps = { placeholder: formatMessage('Select subscription') };

  return (
    <SearchableDropdown
      errorMessage={errorMessage}
      isLoading={isLoading}
      items={subscriptions.map((t) => ({ key: t.subscriptionId, text: t.displayName }))}
      onSubmit={(option) => props.onSubscriptionChange(option.key)}
      {...{
        ...props,
        textFieldProps: { ...localTextFieldProps, ...props.textFieldProps },
        value: subscriptions.find((sub) => sub.subscriptionId === props.value)?.displayName,
      }}
    />
  );
});
