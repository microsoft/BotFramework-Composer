// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { LgFile } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { useResolvers } from '../hooks/useResolver';

import { projectIdState, focusPathState } from './../recoilModel';
import { dispatcherState } from './../recoilModel/DispatcherWrapper';

const fileNotFound = (id: string) => formatMessage('LG file {id} not found', { id });
const TEMPLATE_ERROR = formatMessage('templateName is missing or empty');

function createLgApi(
  focusPath: string,
  actions: any, //TODO
  lgFileResolver: (id: string) => LgFile | undefined
) {
  const getLgTemplates = (id) => {
    if (id === undefined) throw new Error('must have a file id');
    const focusedDialogId = focusPath.split('#').shift() || id;
    const file = lgFileResolver(focusedDialogId);
    if (!file) throw new Error(fileNotFound(id));
    return file.templates;
  };

  const updateLgTemplate = (id: string, templateName: string, templateBody: string) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!templateName) throw new Error(TEMPLATE_ERROR);
    const template = { name: templateName, body: templateBody, parameters: [] };

    return actions.updateLgTemplate({
      id: file.id,
      templateName,
      template,
    });
  };

  const copyLgTemplate = (id, fromTemplateName, toTemplateName) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!fromTemplateName || !toTemplateName) throw new Error(TEMPLATE_ERROR);

    return actions.copyLgTemplate({
      id: file.id,
      fromTemplateName,
      toTemplateName,
    });
  };

  const removeLgTemplate = (id, templateName) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!templateName) throw new Error(TEMPLATE_ERROR);

    return actions.removeLgTemplate({
      id: file.id,
      templateName,
    });
  };

  const removeLgTemplates = (id, templateNames) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!templateNames) throw new Error(TEMPLATE_ERROR);

    return actions.removeLgTemplates({
      id: file.id,
      templateNames,
    });
  };

  return {
    addLgTemplate: updateLgTemplate,
    getLgTemplates,
    updateLgTemplate,
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
  const [api, setApi] = useState(createLgApi(focusPath, actions, lgFileResolver));

  useEffect(() => {
    const newApi = createLgApi(focusPath, actions, lgFileResolver);
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
