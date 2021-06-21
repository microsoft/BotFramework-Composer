// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { ResourceGroup } from '@azure/arm-resources/esm/models';

import { SearchableDropdown, SearchableDropdownProps } from '../shared/searchableDropdown/SearchableDropdown';
import { getResourceGroups } from '../../api';
import { useDebounce } from '../useDebounce';

type Props = {
  subscriptionId: string;
  canRefresh?: boolean;
  onResourceGroupChange: (rg: string, isNew: boolean) => void;
  onResourceGroupNameValidate?: (hasErrors: boolean) => void;
  isNewResourceGroup?: boolean;
  accessToken: string;
} & Omit<SearchableDropdownProps, 'items' | 'onSubmit' | 'creationProps'>;

export const ResourceGroupPicker = React.memo((props: Props) => {
  const {
    onResourceGroupChange,
    accessToken,
    subscriptionId,
    value,
    isNewResourceGroup,
    onResourceGroupNameValidate,
  } = props;

  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newNameErrorMessage, setNewNameErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newResourceGroup, setNewResourceGroup] = useState<string>(value);
  const debouncedNewName = useDebounce<string>(newResourceGroup, 300);

  useEffect(() => {
    if (isNewResourceGroup) {
      const alreadyExists = resourceGroups?.some((rg) => rg.name === debouncedNewName);

      if (debouncedNewName && !debouncedNewName.match(/^[-\w._()]+$/)) {
        setNewNameErrorMessage(
          formatMessage(
            'Resource group names only allow alphanumeric characters, periods, underscores, hyphens and parenthesis and cannot end in a period.'
          )
        );
      } else if (alreadyExists) {
        setNewNameErrorMessage(formatMessage('A resource with this name already exists.'));
      } else {
        setNewNameErrorMessage(undefined);
      }
    }
  }, [debouncedNewName, resourceGroups, isNewResourceGroup]);

  useEffect(() => {
    isNewResourceGroup && onResourceGroupChange(debouncedNewName, isNewResourceGroup);
  }, [debouncedNewName, newNameErrorMessage, isNewResourceGroup, onResourceGroupChange]);

  useEffect(() => {
    onResourceGroupNameValidate?.(!!newNameErrorMessage);
  }, [newNameErrorMessage, onResourceGroupNameValidate]);

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

  const localTextFieldProps = React.useMemo(
    () => ({
      placeholder: formatMessage('Select Resource Group'),
      errorMessage,
    }),
    [errorMessage]
  );

  const creationItem = React.useMemo(
    () => ({ key: 'CREATE_NEW_RESOURCE_GROUP', text: formatMessage('Create new resource group') }),
    []
  );

  return (
    <SearchableDropdown
      allowCreation
      creationProps={{
        creationTextFieldProps: {
          placeholder: formatMessage('Create new resource group'),
          onChange: (_, newVal) => setNewResourceGroup(newVal),
          errorMessage: newNameErrorMessage,
          value: newResourceGroup,
        },
        creationItem,
      }}
      isLoading={isLoading}
      items={resourceGroups.map((t) => ({ key: t.name, text: t.name }))}
      onSubmit={(option) => {
        const isNew = option.key === creationItem.key;
        onResourceGroupChange(isNew ? '' : option.key, isNew);
        onResourceGroupNameValidate?.(false);
      }}
      {...{
        ...props,
        textFieldProps: { ...localTextFieldProps, ...props.textFieldProps },
      }}
      value={isNewResourceGroup ? creationItem.text : value}
    />
  );
});
