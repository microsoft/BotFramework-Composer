// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { DialogSchemaFile } from '@bfc/shared';

import { dialogSchemasState } from '../atoms/botState';

const createDialogSchema = ({ set }: CallbackInterface, dialogSchema: DialogSchemaFile) => {
  set(dialogSchemasState, (dialogSchemas) => [...dialogSchemas, dialogSchema]);
};

export const removeDialogSchema = ({ set }: CallbackInterface, id: string) => {
  set(dialogSchemasState, (dialogSchemas) => dialogSchemas.filter((dialogSchema) => dialogSchema.id !== id));
};

export const dialogSchemaDispatcher = () => {
  const updateDialogSchema = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (dialogSchema: DialogSchemaFile) => {
      const { set, snapshot } = callbackHelpers;
      const dialogSchemas = await snapshot.getPromise(dialogSchemasState);

      if (!dialogSchemas.some((dialog) => dialog.id === dialogSchema.id)) {
        return createDialogSchema(callbackHelpers, dialogSchema);
      }

      set(dialogSchemasState, (dialogSchemas) =>
        dialogSchemas.map((schema) => (schema.id === dialogSchema.id ? dialogSchema : schema))
      );
    }
  );

  return {
    updateDialogSchema,
  };
};
