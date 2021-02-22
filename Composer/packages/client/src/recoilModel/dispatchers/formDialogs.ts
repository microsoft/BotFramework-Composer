// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { FormDialogSchemaTemplate } from '@bfc/shared';
import { navigate } from '@reach/router';
import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import TelemetryClient from '../../telemetry/TelemetryClient';
import httpClient from '../../utils/httpUtil';
import {
  dispatcherState,
  formDialogErrorState,
  formDialogGenerationProgressingState,
  formDialogLibraryTemplatesState,
} from '../atoms/appState';
import { dialogState, formDialogSchemaIdsState, formDialogSchemaState } from '../atoms/botState';

export const formDialogsDispatcher = () => {
  const createFormDialogSchema = useRecoilCallback(({ set }: CallbackInterface) => ({ id, projectId }) => {
    set(formDialogSchemaIdsState(projectId), (formDialogSchemaIds) => {
      return [...formDialogSchemaIds, id];
    });

    set(formDialogSchemaState({ projectId, schemaId: id }), { id, content: JSON.stringify({}, null, 4) });

    navigate(`/bot/${projectId}/forms/${id}`);
  });

  const updateFormDialogSchema = useRecoilCallback(({ set }: CallbackInterface) => ({ id, content, projectId }) =>
    set(formDialogSchemaState({ projectId, schemaId: id }), { id, content })
  );

  const removeFormDialogSchema = useRecoilCallback(({ set, reset }: CallbackInterface) => async ({ id, projectId }) => {
    set(formDialogSchemaIdsState(projectId), (formDialogSchemas) => {
      return formDialogSchemas.filter((fdId) => fdId !== id);
    });
    reset(formDialogSchemaState({ projectId, schemaId: id }));
  });

  const loadFormDialogSchemaTemplates = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set, reset, snapshot } = callbackHelpers;
    reset(formDialogErrorState);

    const templates = await snapshot.getPromise(formDialogLibraryTemplatesState);
    // If templates are already loaded, don't reload.
    if (templates.length) {
      return;
    }

    try {
      const { data } = await httpClient.get<FormDialogSchemaTemplate[]>('/formDialogs/templateSchemas');
      const templates = Object.keys(data).map((key) => ({
        name: key,
        isGlobal: data[key].$global,
      }));

      set(formDialogLibraryTemplatesState, templates);
    } catch (ex) {
      set(formDialogErrorState, {
        ...ex,
        message: formatMessage('Fetching form dialog schema templates failed.'),
        kind: 'templateFetch',
      });
    }
  });

  const generateFormDialog = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ projectId, schemaId }) => {
      const { set, reset, snapshot } = callbackHelpers;
      reset(formDialogErrorState);

      const { reloadProject } = await snapshot.getPromise(dispatcherState);
      try {
        set(formDialogGenerationProgressingState, true);

        const formDialogSchema = await snapshot.getPromise(formDialogSchemaState({ projectId, schemaId }));
        if (!formDialogSchema) {
          return;
        }

        const generateStartTime = Date.now();
        const response = await httpClient.post(`/formDialogs/${projectId}/generate`, {
          name: schemaId,
        });
        TelemetryClient.track('FormDialogGenerated', { durationMilliseconds: Date.now() - generateStartTime });
        await reloadProject(response.data.id);
      } catch (ex) {
        set(formDialogErrorState, {
          ...ex,
          message: formatMessage('Generating form dialog using "{ schemaId }" schema failed. Please try again later.', {
            schemaId,
          }),
          kind: 'generation',
          logs: ex.data?.logs,
        });
      } finally {
        set(formDialogGenerationProgressingState, false);
      }
    }
  );

  const removeFormDialog = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ projectId, dialogId }) => {
      const { set, reset, snapshot } = callbackHelpers;
      reset(formDialogErrorState);

      const dialog = await snapshot.getPromise(dialogState({ projectId, dialogId }));
      const { reloadProject } = await snapshot.getPromise(dispatcherState);

      try {
        if (!dialog) {
          return;
        }

        const response = await httpClient.delete(`/formDialogs/${projectId}/${dialogId}`);
        await reloadProject(response.data.id);
      } catch (ex) {
        set(formDialogErrorState, {
          ...ex,
          message: formatMessage('Deleting "{ dialogId }" failed.', { dialogId }),
          kind: 'deletion',
        });
      }
    }
  );

  const navigateToGeneratedDialog = ({ projectId, schemaId }) => {
    navigate(`/bot/${projectId}/dialogs/${schemaId}`);
  };

  const navigateToFormDialogSchema = ({ projectId, schemaId }) => {
    navigate(`/bot/${projectId}/forms/${schemaId}`);
  };

  return {
    createFormDialogSchema,
    updateFormDialogSchema,
    loadFormDialogSchemaTemplates,
    removeFormDialogSchema,
    generateFormDialog,
    navigateToGeneratedDialog,
    navigateToFormDialogSchema,
    removeFormDialog,
  };
};
