// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { VisualSchemaProvider } from '../schema/visualSchemaProvider';
import { visualSchema } from '../schema/visualSchema';

const defaultProvider = new VisualSchemaProvider(visualSchema);

export const VisualSchemaContext = React.createContext<VisualSchemaProvider>(defaultProvider);
