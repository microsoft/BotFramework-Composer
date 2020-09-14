// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { WidgetSchemaProvider } from '../utils/visual/WidgetSchemaProvider';
export var SchemaContext = React.createContext({
    widgets: {},
    schemaProvider: new WidgetSchemaProvider({ default: { widget: function () { return null; } } }),
});
//# sourceMappingURL=SchemaContext.js.map