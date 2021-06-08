// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { ResourceGroup } from '@azure/arm-resources/esm/models';

import { AutoComplete, IAutoCompleteProps } from '../shared/autoComplete/AutoComplete';
import { getResourceGroups } from '../../api';

type Props = {
  allowCreation?: boolean;
  subscriptionId: string;
  canRefresh?: boolean;
  onResourceGroupChange: React.Dispatch<React.SetStateAction<string>>;
  accessToken: string;
} & Omit<IAutoCompleteProps, 'items' | 'onSubmit'>;

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
    } else {
      resourceGroups?.length > 0 && setResourceGroups([]);
    }
  }, [accessToken, props.subscriptionId]);

  const localTextFieldProps = {
    placeholder: messages.placeholder,
  };

  const getValue = () => {
    if (props.value) {
      return resourceGroups.find((rg) => rg.id === props.value)?.name;
    } else {
      return '';
    }
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
