// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { VisualSchemaProvider } from '../schema/visualSchemaProvider';
import { defaultVisualSchema } from '../schema/defaultVisualSchema';

const defaultProvider = new VisualSchemaProvider(defaultVisualSchema);

export const VisualSchemaContext = React.createContext<VisualSchemaProvider>(defaultProvider);
