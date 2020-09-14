// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { DialogFactory } from '@bfc/shared';
export var defaultRendererContextValue = {
    focusedId: '',
    focusedEvent: '',
    focusedTab: '',
    clipboardActions: [],
    dialogFactory: new DialogFactory({}),
    customSchemas: [],
};
export var NodeRendererContext = React.createContext(defaultRendererContextValue);
//# sourceMappingURL=NodeRendererContext.js.map