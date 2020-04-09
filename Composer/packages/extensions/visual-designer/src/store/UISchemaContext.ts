// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { UISchemaProvider } from '../schema/uischemaProvider';
import { visualSchema } from '../schema/visualSchema';

const defaultProvider = new UISchemaProvider(visualSchema);

export const UISchemaContext = React.createContext<UISchemaProvider>(defaultProvider);
