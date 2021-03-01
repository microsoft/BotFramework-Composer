// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { LgFile, LgContextApi, LgTemplateRef } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import debounce from 'lodash/debounce';
import formatMessage from 'format-message';

import { useResolvers } from '../hooks/useResolver';
import { Dispatcher } from '../recoilModel/dispatchers';

import { dispatcherState, focusPathState } from './../recoilModel';

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

  /**
   * This util function returns the names of all auto generated templates associated with the templates being removed.
   * @param file Lg file that contains the templates.
   * @param toBeRemovedLgTemplateNames Names of Lg templates that are being removed.
   */
  const getGeneratedLgTemplateNames = (file: LgFile, toBeRemovedLgTemplateNames: string[]) => {
    const generatedLgTemplateNames: string[] = [];
    const lgTemplates = file.templates.filter((t) => toBeRemovedLgTemplateNames.includes(t.name) && !!t.properties);
    for (const lgTemplate of lgTemplates) {
      // Auto-generated templates in structured responses have the following pattern
      // [name of the parent template]_text OR [name of the parent template]_speak OR [name of the parent template]_attachment_[random string]
      const pattern = `${lgTemplate.name}_((text|speak)|(attachment_.+))$`;
      // eslint-disable-next-line security/detect-non-literal-regexp
      const regex = new RegExp(`^${pattern}`);
      const generatedLgTemplates = file.templates.map((t) => t.name).filter((name) => regex.test(name));
      generatedLgTemplateNames.push(...generatedLgTemplates);
    }

    return generatedLgTemplateNames;
  };

  const removeLgTemplate = async (id, templateName) => {
    const file = lgFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!templateName) throw new Error(TEMPLATE_ERROR);

    // Find potential auto generated templates from response editor and delete them
    const generatedLgTemplateNames = getGeneratedLgTemplateNames(file, [templateName]);

    return await actions.removeLgTemplates({
      id: file.id,
      templateNames: [templateName, ...generatedLgTemplateNames],
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

    // Find potential auto generated templates from response editor and delete them
    const generatedLgTemplateNames = getGeneratedLgTemplateNames(file, normalizedLgTemplates);

    return await actions.removeLgTemplates({
      id: file.id,
      templateNames: [...normalizedLgTemplates, ...generatedLgTemplateNames],
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
