// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { ChooseProvisionAction } from './ChooseProvisionAction';

export const AzureProvisionDialog = () => {
  return (
    <div style={{ height: 'calc(100vh - 65px)' }}>
      <ChooseProvisionAction choice={''} onChoiceChanged={(c) => console.log(c)} />
    </div>
  );
};

//TODO: Think about cross-cutting concerns
