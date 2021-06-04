// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ResourceGroups as ResourceGroup } from '@botframework-composer/types';
import React, { useEffect, useState } from 'react';
import formatMessage from 'format-message';

import { AutoComplete, IAutoCompleteProps } from '../shared/autoComplete/AutoComplete';
type ComboBoxPropsWithOutOptions = Omit<IAutoCompleteProps, 'items' | 'onSubmit'>;
type Props = {
  allowCreation?: boolean;
  subscriptionId: string;
  canRefresh?: boolean;
  onResourceGroupChange: React.Dispatch<React.SetStateAction<string>>;
  accessToken: string;
} & ComboBoxPropsWithOutOptions;
export const ResourceGroupPicker = React.memo((props: Props) => {
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  useEffect(() => {
    //TODO: Create an API to call the server
    setResourceGroups([]);
  }, [props.subscriptionId]);
  const localTextFieldProps = {
    placeholder: formatMessage('Select Resource Group'),
  };
  return (
    <>
      <AutoComplete
        items={resourceGroups.map((t) => ({ key: t.id, text: t.name }))}
        onSubmit={(option) => props.onResourceGroupChange(option.id)}
        {...{ ...props, textFieldProps: { ...localTextFieldProps, ...props.textFieldProps } }}
      />
    </>
  );
});

// Client & server side validations when new resource groups are created
// When tenantid is changed, load the new subscriptions
// if previously selected subscription is part of the new tenent leave it selected else show the placeholder
