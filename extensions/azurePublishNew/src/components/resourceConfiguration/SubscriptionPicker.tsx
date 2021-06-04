// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Subscription } from '@azure/arm-subscriptions/esm/models';
import React, { useEffect, useState } from 'react';
import formatMessage from 'format-message';

import { getSubscriptions } from '../../api';
import { AutoComplete, IAutoCompleteProps } from '../shared/autoComplete/AutoComplete';

type ComboBoxPropsWithOutOptions = Omit<IAutoCompleteProps, 'items' | 'onSubmit'>;
type Props = {
  allowCreation?: boolean;
  canRefresh?: boolean; // not needed for subscriptions
  accessToken: string;
  onSubscriptionChange: React.Dispatch<React.SetStateAction<string>>;
} & ComboBoxPropsWithOutOptions;

export const SubscriptionPicker = React.memo((props: Props) => {
  const { accessToken } = props;
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    if (accessToken) {
      setErrorMessage(undefined);
      setIsLoading(true);
      getSubscriptions(accessToken)
        .then((data) => {
          setIsLoading(false);
          setSubscriptions(data);
          if (data.length === 0) {
            setErrorMessage(
              formatMessage(
                'Your subscription list is empty, please add your subscription, or login with another account.'
              )
            );
          }
        })
        .catch((err) => {
          setIsLoading(false);
          setErrorMessage(err.message);
        })
        .finally(() => {
          if (isLoading) {
            setIsLoading(false);
          }
        });
    }
  }, [accessToken]);
  const localTextFieldProps = { placeholder: formatMessage('Select subscription') };
  const getValue = () => {
    return subscriptions.find((sub) => sub.subscriptionId === props.value)?.displayName;
  };
  return (
    <AutoComplete
      errorMessage={errorMessage}
      isLoading={isLoading}
      items={subscriptions.map((t) => ({ key: t.subscriptionId, text: t.displayName }))}
      onSubmit={(option) => props.onSubscriptionChange(option.key as string)}
      {...{ ...props, textFieldProps: { ...localTextFieldProps, ...props.textFieldProps }, value: getValue() }}
    />
  );
});

{
  /* <LuisSearchDropdown
items={storageAccountItems}
value={selectedStorageAccount?.name}
data-automation-id={'storageAccountId'}
isLoading={storageAccountTracker.isRunning}
onSubmit={item => updateFormState({ storageAccountId: item.key })}
onClear={() => updateFormState({ storageAccountId: '', containerName: '' })}
textFieldProps={{
    required: true,
    disabled: storageAccountTracker.isFailed,
    label: localize(messages.storageAccountLabel),
    placeholder: localize(messages.storageAccountPlaceholder)
}}
/> */
}
