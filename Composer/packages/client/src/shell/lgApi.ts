// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { LgFile } from '@bfc/shared';
import debounce from 'lodash/debounce';

import { State, BoundActionHandlers } from '../store/types';
import { useStoreContext } from '../hooks/useStoreContext';

function createLgApi(state: State, actions: BoundActionHandlers, lgFileResolver: (id: string) => LgFile | undefined) {
  const getLgTemplates = (id) => {
    if (id === undefined) throw new Error('must have a file id');
    const focusedDialogId = state.focusPath.split('#').shift() || id;
    const file = lgFileResolver(focusedDialogId);
    if (!file) throw new Error(`lg file ${id} not found`);
    return file.templates;
  };

  const updateLgTemplate = async (id: string, templateName: string, templateBody: string) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!templateName) throw new Error(`templateName is missing or empty`);
    const template = { name: templateName, body: templateBody, parameters: [] };

    const projectId = state.projectId;

    return actions.updateLgTemplate({
      file,
      projectId,
      templateName,
      template,
    });
  };

  const copyLgTemplate = async (id, fromTemplateName, toTemplateName) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!fromTemplateName || !toTemplateName) throw new Error(`templateName is missing or empty`);

    const projectId = state.projectId;

    return actions.copyLgTemplate({
      file,
      projectId,
      fromTemplateName,
      toTemplateName,
    });
  };

  const removeLgTemplate = async (id, templateName) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!templateName) throw new Error(`templateName is missing or empty`);
    const projectId = state.projectId;

    return actions.removeLgTemplate({
      file,
      projectId,
      templateName,
    });
  };

  const removeLgTemplates = async (id, templateNames) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(`lg file ${id} not found`);
    if (!templateNames) throw new Error(`templateName is missing or empty`);
    const projectId = state.projectId;

    return actions.removeLgTemplates({
      file,
      projectId,
      templateNames,
    });
  };

  return {
    addLgTemplate: updateLgTemplate,
    getLgTemplates,
    updateLgTemplate: debounce(updateLgTemplate, 250),
    removeLgTemplate,
    removeLgTemplates,
    copyLgTemplate,
  };
}

export function useLgApi() {
  const { state, actions, resolvers } = useStoreContext();
  const { projectId, focusPath } = state;
  const { lgFileResolver } = resolvers;
  const [api, setApi] = useState(createLgApi(state, actions, lgFileResolver));

  useEffect(() => {
    const newApi = createLgApi(state, actions, lgFileResolver);
    setApi(newApi);

    return () => {
      Object.keys(newApi).forEach((apiName) => {
        if (typeof newApi[apiName].flush === 'function') {
          newApi[apiName].flush();
        }
      });
    };
  }, [projectId, focusPath]);

  return api;
}
