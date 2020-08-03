// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldProps } from '@bfc/extension';
import startCase from 'lodash/startCase';

import { RefField } from './RefField';
import { resultTypeDefinitions } from '../schema';

export const ResultRefField: React.FC<FieldProps> = (props) => {
  const options = useMemo<IDropdownOption[]>(() => {
    return Object.entries(resultTypeDefinitions || {}).map(([key, value]) => ({
      key: `#/definitions/${key}`,
      text: value?.title || startCase(key),
    }));
  }, []);

  return <RefField {...props} options={options} />;
};
