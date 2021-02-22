// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { LgFile, LgContextApi, LgTemplateRef } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import debounce from 'lodash/debounce';
import formatMessage from 'format-message';

import { useResolvers } from '../hooks/useResolver';
import { Dispatcher } from '../recoilModel/dispatchers';

import { focusPathState } from './../recoilModel';
import { dispatcherState } from './../recoilModel/DispatcherWrapper';

const fileNotFound = (id: string) => formatMessage('LG file {id} not found', { id });
const TEMPLATE_ERROR = formatMessage('templateName is missing or empty');

const memoizedDebounce = (func, wait, options = {}) => {
  const memory = {};

  return (...args) => {
    const [, searchType] = args;

    if (typeof memory[searchType] === 'function') {
      return memory[searchType](...args);
    }

    memory[searchType] = debounce(func, wait, { ...options, leading: true }); // leading required for return promise
    return memory[searchType](...args);
  };
};

function createLgApi(
  state: { focusPath: string; projectId: string },
  actions: Dispatcher,
  lgFileResolver: (id: string) => LgFile | undefined
): LgContextApi {
  const getLgTemplates = (id) => {
    if (id === undefined) throw new Error('must have a file id');
    const focusedDialogId = state.focusPath.split('#').shift() || id;
    const file = lgFileResolver(focusedDialogId);
    if (!file) throw new Error(fileNotFound(id));
    return file.templates;
  };

  const updateLgFile = async (id: string, content: string) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));

    await actions.updateLgFile({ id, content, projectId: state.projectId });
  };

  const updateLgTemplate = async (id: string, templateName: string, templateBody: string) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!templateName) throw new Error(TEMPLATE_ERROR);
    const template = { name: templateName, body: templateBody, parameters: [] };

    return await actions.updateLgTemplate({
      id: file.id,
      templateName,
      template,
      projectId: state.projectId,
    });
  };

  const copyLgTemplate = async (id, fromTemplateName, toTemplateName) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!fromTemplateName || !toTemplateName) throw new Error(`templateName is missing or empty`);

    return await actions.copyLgTemplate({
      id: file.id,
      fromTemplateName,
      toTemplateName,
      projectId: state.projectId,
    });
  };

  const removeLgTemplate = async (id, templateName) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!templateName) throw new Error(TEMPLATE_ERROR);

    return await actions.removeLgTemplate({
      id: file.id,
      templateName,
      projectId: state.projectId,
    });
  };

  const removeLgTemplates = async (id: string, templateNames: string[]) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!templateNames) throw new Error(TEMPLATE_ERROR);

    const normalizedLgTemplates = templateNames
      .map((x) => {
        const lgTemplateRef = LgTemplateRef.parse(x);
        return lgTemplateRef ? lgTemplateRef.name : x;
      })
      .filter((x) => !!x);

    return await actions.removeLgTemplates({
      id: file.id,
      templateNames: normalizedLgTemplates,
      projectId: state.projectId,
    });
  };

  return {
    updateLgFile,
    addLgTemplate: updateLgTemplate,
    getLgTemplates,
    updateLgTemplate,
    debouncedUpdateLgTemplate: memoizedDebounce(updateLgTemplate, 250),
    removeLgTemplate,
    removeLgTemplates,
    copyLgTemplate,
  };
}

export function useLgApi(projectId: string) {
  const focusPath = useRecoilValue(focusPathState(projectId));
  const actions: Dispatcher = useRecoilValue(dispatcherState);
  const { lgFileResolver } = useResolvers(projectId);
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
