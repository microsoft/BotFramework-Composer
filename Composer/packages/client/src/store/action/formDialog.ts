// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ActionTypes } from '../../constants';
import { ActionCreator } from '../types';

import httpClient from './../../utils/httpUtil';

export const createFormDialogSchema: ActionCreator = async (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.CREATE_FORM_DIALOG_SCHEMA,
    payload: { id, content },
  });
};

export const updateFormDialogSchema: ActionCreator = async (store, { id, content }) => {
  if (store.getState().formDialogSchemas.findIndex((ds) => ds.id === id) === -1) {
    return;
  }

  store.dispatch({
    type: ActionTypes.UPDATE_FORM_DIALOG_SCHEMA,
    payload: { id, content },
  });
};

export const removeFormDialogSchema: ActionCreator = async (store, { id }) => {
  store.dispatch({
    type: ActionTypes.REMOVE_FORM_DIALOG_SCHEMA,
    payload: { id },
  });
};

export const loadFormDialogSchemaTemplates: ActionCreator = async (store) => {
  // If templates are already loaded, don't reload.
  if (store.getState().formDialogTemplateSchemas.length) {
    return;
  }

  try {
    const { data } = await httpClient.get<{ name: string; isGlobal: boolean }[]>('/formDialogs/templateSchemas');
    store.dispatch({ type: ActionTypes.LOAD_FORM_DIALOG_SCHEMA_TEMPLATE_SUCCESS, payload: { templates: data } });
  } catch (error) {
    store.dispatch({
      type: ActionTypes.SET_ERROR,
      payload: { summary: 'Loading form dialog templates failed.', message: error.message },
    });
  }
};

export const generateFormDialog: ActionCreator = async (store, { schemaName }) => {
  try {
    const { projectId, formDialogSchemas } = store.getState();
    const formDialogSchema = formDialogSchemas.find((s) => s.id === schemaName);
    if (!formDialogSchema) {
      return;
    }

    store.dispatch({ type: ActionTypes.GENERATE_FORM_DIALOG_PENDING });
    const response = await httpClient.post(`/formDialogs/${projectId}/generate`, {
      name: schemaName,
    });
    store.dispatch({ type: ActionTypes.GET_PROJECT_SUCCESS, payload: { response } });
  } catch (error) {
    store.dispatch({
      type: ActionTypes.SET_ERROR,
      payload: { summary: `Generating form dialog using ${name} schema failed.`, message: error.message },
    });
  }
};
