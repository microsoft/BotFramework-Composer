// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LgTemplate, LgFile, importResolverGenerator } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import LgWorker from './../parsers/lgWorker';
import { lgFilesState } from './../atoms/botState';
import * as lgUtil from './../../utils/lgUtil';

export const lgDispatcher = () => {
  const updateLgFile = useRecoilCallback<[{ id: string; content: any }], Promise<void>>(
    ({ set, snapshot }: CallbackInterface) => async ({ id, content }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const result = (await LgWorker.parse(id, content, lgFiles)) as LgFile;
      set(lgFilesState, (lgFiles) => lgFiles.map((file) => (file.id === id ? result : file)));
    }
  );

  const lgFileResolver = (lgFiles) => {
    return importResolverGenerator(lgFiles, '.lg');
  };

  const updateLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({
      id,
      templateName,
      template,
    }: {
      id: string;
      templateName: string;
      template: LgTemplate;
    }) => {
      set(lgFilesState, (lgFiles) => {
        const content = lgFiles.find((file) => file.id === id)?.content ?? '';
        const result = lgUtil.updateTemplate(id, content, templateName, template, lgFileResolver(lgFiles));
        return lgFiles.map((file) => (file.id === id ? result : file));
      });
    }
  );

  const createLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ id, template }: { id: string; template: LgTemplate }) => {
      set(lgFilesState, (lgFiles) => {
        const content = lgFiles.find((file) => file.id === id)?.content ?? '';
        const result = lgUtil.addTemplate(id, content, template, lgFileResolver(lgFiles));

        return lgFiles.map((file) => (file.id === id ? result : file));
      });
    }
  );

  const removeLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ id, templateName }: { id: string; templateName: string }) => {
      set(lgFilesState, (lgFiles) => {
        const content = lgFiles.find((file) => file.id === id)?.content ?? '';
        const result = lgUtil.removeTemplate(id, content, templateName, lgFileResolver(lgFiles));

        return lgFiles.map((file) => (file.id === id ? result : file));
      });
    }
  );

  const removeLgTemplates = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ id, templateNames }: { id: string; templateNames: string[] }) => {
      set(lgFilesState, (lgFiles) => {
        const content = lgFiles.find((file) => file.id === id)?.content ?? '';
        const result = lgUtil.removeTemplates(id, content, templateNames, lgFileResolver(lgFiles));

        return lgFiles.map((file) => (file.id === id ? result : file));
      });
    }
  );

  const copyLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({
      id,
      fromTemplateName,
      toTemplateName,
    }: {
      id: string;
      fromTemplateName: string;
      toTemplateName: string;
    }) => {
      set(lgFilesState, (lgFiles) => {
        const content = lgFiles.find((file) => file.id === id)?.content ?? '';
        const result = lgUtil.copyTemplate(id, content, fromTemplateName, toTemplateName, lgFileResolver(lgFiles));

        return lgFiles.map((file) => (file.id === id ? result : file));
      });
    }
  );

  return {
    updateLgFile,
    updateLgTemplate,
    createLgTemplate,
    removeLgTemplate,
    removeLgTemplates,
    copyLgTemplate,
  };
};
