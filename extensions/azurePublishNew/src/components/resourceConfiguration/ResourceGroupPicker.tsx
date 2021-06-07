// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { ResourceGroup } from '@azure/arm-resources/esm/models';

import { AutoComplete, IAutoCompleteProps } from '../shared/autoComplete/AutoComplete';
import { getResourceGroups } from '../api';

type ComboBoxPropsWithOutOptions = Omit<IAutoCompleteProps, 'items' | 'onSubmit'>;
type Props = {
  allowCreation?: boolean;
  subscriptionId: string;
  canRefresh?: boolean;
  onResourceGroupChange: React.Dispatch<React.SetStateAction<string>>;
  accessToken: string;
} & ComboBoxPropsWithOutOptions;

const messages = {
  placeholder: formatMessage('Select Resource Group'),
};
export const ResourceGroupPicker = React.memo((props: Props) => {
  const { accessToken, subscriptionId, onResourceGroupChange } = props;
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (accessToken && subscriptionId) {
      setIsLoading(true);
      getResourceGroups(accessToken, subscriptionId)
        .then((data) => {
          setResourceGroups(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setErrorMessage(formatMessage(err.message));
          setIsLoading(false);
        })
        .finally(() => {
          isLoading && setIsLoading(false);
        });
    }
  }, [accessToken, props.subscriptionId]);

  const localTextFieldProps = {
    placeholder: messages.placeholder,
  };

  const getValue = () => {
    return resourceGroups.find((rg) => rg.id === props.value)?.name;
  };

  return (
    <>
      <AutoComplete
        errorMessage={errorMessage}
        isLoading={isLoading}
        items={resourceGroups.map((t) => ({ key: t.id, text: t.name }))}
        onSubmit={(option) => onResourceGroupChange(option.id)}
        {...{ ...props, textFieldProps: { ...localTextFieldProps, ...props.textFieldProps }, value: getValue() }}
      />
    </>
  );
});

// Client & server side validations when new resource groups are created
// When tenantid is changed, load the new subscriptions
// if previously selected subscription is part of the new tenent leave it selected else show the placeholder
