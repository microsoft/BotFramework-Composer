// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { DialogSchemaFile } from '@bfc/shared';

import { dialogSchemasState } from '../atoms/botState';

const createDialogSchema = ({ set }: CallbackInterface, dialogSchema: DialogSchemaFile, projectId: string) => {
  set(dialogSchemasState(projectId), (dialogSchemas) => [...dialogSchemas, dialogSchema]);
};

export const removeDialogSchema = (
  { set }: CallbackInterface,
  { id, projectId }: { id: string; projectId: string },
) => {
  set(dialogSchemasState(projectId), (dialogSchemas) => dialogSchemas.filter((dialogSchema) => dialogSchema.id !== id));
};

export const dialogSchemaDispatcher = () => {
  const updateDialogSchema = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (dialogSchema: DialogSchemaFile, projectId: string) => {
      const { set, snapshot } = callbackHelpers;
      const dialogSchemas = await snapshot.getPromise(dialogSchemasState(projectId));

      if (!dialogSchemas.some((dialog) => dialog.id === dialogSchema.id)) {
        return createDialogSchema(callbackHelpers, dialogSchema, projectId);
      }

      set(dialogSchemasState(projectId), (dialogSchemas) =>
        dialogSchemas.map((schema) => (schema.id === dialogSchema.id ? dialogSchema : schema)),
      );
    },
  );

  return {
    updateDialogSchema,
  };
};
