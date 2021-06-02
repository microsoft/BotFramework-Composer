// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ResourceGroups as ResourceGroup } from '@botframework-composer/types';
import React, { useEffect, useState } from 'react';
import { IComboBoxProps, ComboBox } from 'office-ui-fabric-react';
type ComboBoxPropsWithOutOptions = Omit<IComboBoxProps, 'options' | 'onChange'>;
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
  return (
    <>
      <ComboBox
        required
        autoComplete="on"
        label="Resource Group"
        options={resourceGroups.map((t) => ({ key: t.id, text: t.name }))}
        placeholder="Select Resource Group"
        onChange={(event, option) => props.onResourceGroupChange(option.id)}
        {...props}
      />
      {props.allowCreation && <a>Create new</a>}
    </>
  );
});

// Client & server side validations when new resource groups are created
// When tenantid is changed, load the new subscriptions
// if previously selected subscription is part of the new tenent leave it selected else show the placeholder
