// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { UISchemaProvider } from '../schema/uischemaProvider';
import { uiSchema } from '../schema/uischema';

const defaultProvider = new UISchemaProvider(uiSchema);

export const UISchemaContext = React.createContext<UISchemaProvider>(defaultProvider);
