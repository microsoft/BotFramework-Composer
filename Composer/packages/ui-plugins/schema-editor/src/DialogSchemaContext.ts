// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';

interface DialogSchema {
  schema: any;
}

const DialogSchemaContext = React.createContext<DialogSchema>({
  schema: {},
});

export const useDialogSchemaContext = () => {
  return useContext(DialogSchemaContext);
};

export default DialogSchemaContext;
