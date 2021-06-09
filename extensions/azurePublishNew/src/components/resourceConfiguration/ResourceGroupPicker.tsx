// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { ResourceGroup } from '@azure/arm-resources/esm/models';

import { SearchableDropdown, SearchableDropdownProps } from '../shared/searchableDropdown/SearchableDropdown';
import { getResourceGroups } from '../../api';

type Props = {
  allowCreation?: boolean;
  subscriptionId: string;
  canRefresh?: boolean;
  onResourceGroupChange: (rg: string) => void;
  accessToken: string;
} & Omit<SearchableDropdownProps, 'items' | 'onSubmit'>;

export const ResourceGroupPicker = React.memo((props: Props) => {
  const { accessToken, subscriptionId, onResourceGroupChange } = props;
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (accessToken && subscriptionId) {
      setIsLoading(true);
      (async () => {
        try {
          const resourceGroups = await getResourceGroups(accessToken, subscriptionId);
          setResourceGroups(resourceGroups);
          setIsLoading(false);
        } catch (ex) {
          setResourceGroups([]);
          setIsLoading(false);
          setErrorMessage(ex.message);
        }
      })();
    }
  }, [accessToken, props.subscriptionId]);

  const localTextFieldProps = {
    placeholder: formatMessage('Select Resource Group'),
  };

  return (
    <>
      <SearchableDropdown
        errorMessage={errorMessage}
        isLoading={isLoading}
        items={resourceGroups.map((t) => ({ key: t.name, text: t.name }))}
        onSubmit={(option) => onResourceGroupChange(option.key)}
        {...{
          ...props,
          textFieldProps: { ...localTextFieldProps, ...props.textFieldProps },
        }}
      />
    </>
  );
});
