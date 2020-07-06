// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LgFile } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import LgWorker from './../parsers/lgWorker';
import { lgFilesState } from './../atoms/botState';

export const lgDispatcher = () => {
  const updateLgFile = useRecoilCallback<[{ id: string; content: any }], Promise<void>>(
    ({ set, snapshot }: CallbackInterface) => async ({ id, content }) => {
      let lgFiles = await snapshot.getPromise(lgFilesState);
      const result = (await LgWorker.parse(id, content, lgFiles)) as LgFile;
      lgFiles = lgFiles.map((file) => (file.id === id ? result : file));
      set(lgFilesState, lgFiles);
    }
  );

  const updateLgTemplate = async ({ file, templateName, template }) => {
    const newContent = await LgWorker.updateTemplate(file.content, templateName, template);
    await updateLgFile({ id: file.id, content: newContent });
  };

  const createLgTemplate = async ({ file, template }) => {
    const newContent = await LgWorker.addTemplate(file.content, template);
    await updateLgFile({ id: file.id, content: newContent });
  };

  const removeLgTemplate = async ({ file, templateName }) => {
    const newContent = await LgWorker.removeTemplate(file.content, templateName);
    await updateLgFile({ id: file.id, content: newContent });
  };

  const removeLgTemplates = async ({ file, templateNames }) => {
    const newContent = await LgWorker.removeAllTemplates(file.content, templateNames);
    await updateLgFile({ id: file.id, content: newContent });
  };

  const copyLgTemplate = async ({ file, fromTemplateName, toTemplateName }) => {
    const newContent = await LgWorker.copyTemplate(file.content, fromTemplateName, toTemplateName);
    await updateLgFile({ id: file.id, content: newContent });
  };

  return {
    updateLgFile,
    updateLgTemplate,
    createLgTemplate,
    removeLgTemplate,
    removeLgTemplates,
    copyLgTemplate,
  };
};
