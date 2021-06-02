// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DeployLocation } from '@botframework-composer/types';
import React, { useEffect, useState } from 'react';
import { IComboBoxProps, ComboBox } from 'office-ui-fabric-react';

type ComboBoxPropsWithOutOptions = Omit<IComboBoxProps, 'options'>;
type Props = {
  allowCreation?: boolean;
  canRefresh?: boolean;
  tenantId: string;
  onRegionChange: React.Dispatch<React.SetStateAction<string>>;
} & ComboBoxPropsWithOutOptions;

export const RegionPicker = React.memo((props: Props) => {
  const [subscriptions, setSubscriptions] = useState<DeployLocation[]>();
  useEffect(() => {
    //TODO: Create an API to call the server
    //
    setSubscriptions([]);
  }, [props.tenantId]);
  return (
    <ComboBox
      required
      autoComplete="on"
      label="Region"
      options={subscriptions.map((t) => ({ key: t.id, text: t.displayName }))}
      placeholder="Select one"
      onChange={(event, option) => props.onRegionChange(option.id)}
      {...props}
    />
  );
});

//TODO:Define API's for all the Azure calls
