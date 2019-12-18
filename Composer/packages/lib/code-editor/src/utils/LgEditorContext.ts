// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

const LgEditorContext = React.createContext<{ basePath: string }>({ basePath: '/' });

export default LgEditorContext;
