/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilCallback, CallbackInterface } from 'recoil';
import { FormDialogSchema, FormDialogSchemaTemplate } from '@bfc/shared';
import formatMessage from 'format-message';

import httpClient from '../../utils/httpUtil';
import {
  formDialogSchemasState,
  formDialogTemplateSchemasState,
  applicationErrorState,
  formDialogGenerationProgressingState,
} from '../atoms';
import { dispatcherState } from '../DispatcherWrapper';

export const formDialogDispatcher = () => {
  const createFormDialogSchema = useRecoilCallback((callbackHelpers: CallbackInterface) => ({ id, content }) => {
    const formDialogSchema: FormDialogSchema = { id, content };
    const { set } = callbackHelpers;
    set(formDialogSchemasState, (formDialogSchemas) => [...formDialogSchemas, formDialogSchema]);
  });

  const updateFormDialogSchema = useRecoilCallback(({ set }: CallbackInterface) => ({ id, content }) => {
    set(formDialogSchemasState, (formDialogSchemas) => {
      return formDialogSchemas.map((fds) => {
        if (fds.id === id) {
          return { ...fds, content };
        }
        return fds;
      });
    });
  });

  const removeFormDialogSchema = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ id }) => {
    const { set, snapshot } = callbackHelpers;
    let formDialogSchemas = await snapshot.getPromise(formDialogSchemasState);
    formDialogSchemas = formDialogSchemas.filter((d) => d.id !== id);
    set(formDialogSchemasState, formDialogSchemas);
  });

  const loadFormDialogSchemaTemplates = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set, snapshot } = callbackHelpers;
    const templates = await snapshot.getPromise(formDialogTemplateSchemasState);
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

      set(formDialogTemplateSchemasState, templates);
    } catch (error) {
      set(applicationErrorState, {
        message: error.message,
        summary: formatMessage('Load form dialog schema templates Error'),
      });
    }
  });

  const generateFormDialog = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ projectId, schemaName }) => {
      const { set, snapshot } = callbackHelpers;
      const { reloadProject } = await snapshot.getPromise(dispatcherState);
      try {
        set(formDialogGenerationProgressingState, true);

        const formDialogSchemas = await snapshot.getPromise(formDialogSchemasState);
        const formDialogSchema = formDialogSchemas.find((s) => s.id === schemaName);
        if (!formDialogSchema) {
          return;
        }

        const response = await httpClient.post(`/formDialogs/${projectId}/generate`, {
          name: schemaName,
        });
        reloadProject(callbackHelpers, response.data);
      } catch (error) {
        set(applicationErrorState, {
          message: error.message,
          summary: formatMessage('Generating form dialog using ${schemaName} schema failed.', { schemaName }),
        });
      } finally {
        set(formDialogGenerationProgressingState, false);
      }
    }
  );

  return {
    createFormDialogSchema,
    updateFormDialogSchema,
    loadFormDialogSchemaTemplates,
    removeFormDialogSchema,
    generateFormDialog,
  };
};
