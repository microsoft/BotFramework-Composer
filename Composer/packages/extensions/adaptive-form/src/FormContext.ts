// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { UISchema } from '@bfc/extension';

interface FormContext {
  uiSchema: UISchema;
}

const FormContext = React.createContext<FormContext>({
  uiSchema: {},
});

export default FormContext;
