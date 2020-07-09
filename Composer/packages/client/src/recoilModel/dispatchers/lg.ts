// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LgTemplate, LgFile } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { lgIndexer } from '@bfc/indexers';

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
        const templates = lgUtil.updateTemplate(content, templateName, template);
        const result = lgIndexer.convertTemplatesToLgFile(id, content, templates);
        return lgFiles.map((file) => (file.id === id ? result : file));
      });
    }
  );

  const createLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ id, template }: { id: string; template: LgTemplate }) => {
      set(lgFilesState, (lgFiles) => {
        const content = lgFiles.find((file) => file.id === id)?.content ?? '';
        const templates = lgUtil.addTemplate(content, template);
        const result = lgIndexer.convertTemplatesToLgFile(id, content, templates);

        return lgFiles.map((file) => (file.id === id ? result : file));
      });
    }
  );

  const removeLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ id, templateName }: { id: string; templateName: string }) => {
      set(lgFilesState, (lgFiles) => {
        const content = lgFiles.find((file) => file.id === id)?.content ?? '';
        const templates = lgUtil.removeTemplate(content, templateName);
        const result = lgIndexer.convertTemplatesToLgFile(id, content, templates);

        return lgFiles.map((file) => (file.id === id ? result : file));
      });
    }
  );

  const removeLgTemplates = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ id, templateNames }: { id: string; templateNames: string[] }) => {
      set(lgFilesState, (lgFiles) => {
        const content = lgFiles.find((file) => file.id === id)?.content ?? '';
        const templates = lgUtil.removeTemplates(content, templateNames);
        const result = lgIndexer.convertTemplatesToLgFile(id, content, templates);

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
        const templates = lgUtil.copyTemplate(content, fromTemplateName, toTemplateName);
        const result = lgIndexer.convertTemplatesToLgFile(id, content, templates);

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
