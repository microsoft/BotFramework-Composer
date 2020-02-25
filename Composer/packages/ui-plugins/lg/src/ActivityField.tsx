// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension';

import { LgField } from './LgField';

const ActivityField: React.FC<FieldProps> = props => {
  return <LgField {...props} />;
};

export { ActivityField };
