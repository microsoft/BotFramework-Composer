// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { LgFile } from '@bfc/shared';
import debounce from 'lodash/debounce';
import { useRecoilValue } from 'recoil';

import { projectIdState, focusPathState } from '../recoilModel';

import { useResolvers } from './../hooks/useRecolver';
import { dispatcherState } from './../recoilModel/DispatcherWrapper';

function createLgApi(
  state: { focusPath: string; projectId: string },
  actions: any, //TODO
  lgFileResolver: (id: string) => LgFile | undefined
) {
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
  const focusPath = useRecoilValue(focusPathState);
  const projectId = useRecoilValue(projectIdState);
  const actions = useRecoilValue(dispatcherState);
  const { lgFileResolver } = useResolvers();
  const [api, setApi] = useState(createLgApi({ focusPath, projectId }, actions, lgFileResolver));

  useEffect(() => {
    const newApi = createLgApi({ focusPath, projectId }, actions, lgFileResolver);
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
