// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LgFile, LgTemplate } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import LgWorker from './../parsers/lgWorker';
import { lgFilesState } from './../atoms/botState';

export const lgDispatcher = () => {
  const updateFile = async ({ set, snapshot }: CallbackInterface, { id, content }: { id: string; content: string }) => {
    let lgFiles = await snapshot.getPromise(lgFilesState);
    const result = (await LgWorker.parse(id, content, lgFiles)) as LgFile;
    lgFiles = lgFiles.map((file) => (file.id === id ? result : file));
    set(lgFilesState, lgFiles);
  };

  const updateLgFile = useRecoilCallback<[{ id: string; content: any }], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async ({ id, content }) => {
      await updateFile(callbackHelpers, { id, content });
    }
  );

  const updateLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      file,
      projectId,
      templateName,
      template,
    }: {
      file: LgFile;
      projectId: string;
      templateName: string;
      template: LgTemplate;
    }) => {
      const newContent = await LgWorker.updateTemplate(file.content, templateName, template);
      await updateFile(callbackHelpers, { id: file.id, content: newContent as string });
    }
  );

  const createLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      file,
      projectId,
      template,
    }: {
      file: LgFile;
      projectId: string;
      template: LgTemplate;
    }) => {
      const newContent = await LgWorker.addTemplate(file.content, template);
      await updateFile(callbackHelpers, { id: file.id, content: newContent as string });
    }
  );

  const removeLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      file,
      projectId,
      templateName,
    }: {
      file: LgFile;
      projectId: string;
      templateName: string;
    }) => {
      const newContent = await LgWorker.removeTemplate(file.content, templateName);
      await updateFile(callbackHelpers, { id: file.id, content: newContent as string });
    }
  );

  const removeLgTemplates = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      file,
      projectId,
      templateNames,
    }: {
      file: LgFile;
      projectId: string;
      templateNames: string[];
    }) => {
      const newContent = await LgWorker.removeAllTemplates(file.content, templateNames);
      await updateFile(callbackHelpers, { id: file.id, content: newContent as string });
    }
  );

  const copyLgTemplate = useRecoilCallback<
    [{ file: LgFile; projectId: string; fromTemplateName: string; toTemplateName: string }],
    Promise<void>
  >((callbackHelpers: CallbackInterface) => async ({ file, fromTemplateName, toTemplateName, projectId }) => {
    const newContent = await LgWorker.copyTemplate(file.content, fromTemplateName, toTemplateName);
    await updateFile(callbackHelpers, { id: file.id, content: newContent as string });
  });

  return {
    updateLgFile,
    updateLgTemplate,
    createLgTemplate,
    removeLgTemplate,
    removeLgTemplates,
    copyLgTemplate,
  };
};
