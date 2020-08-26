// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LgTemplate, LgFile } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import differenceBy from 'lodash/differenceBy';
import formatMessage from 'format-message';

import { getBaseName, getExtension } from '../../utils/fileUtil';

import LgWorker from './../parsers/lgWorker';
import { lgFilesState, localeState, settingsState, projectIdState } from './../atoms/botState';

const templateIsNotEmpty = ({ name, body }) => {
  return !!name && !!body;
};

// fill other locale lgFile new added template with '- '
const initialBody = '- ';

export const updateLgFileState = async (projectId: string, lgFiles: LgFile[], updatedLgFile: LgFile) => {
  const { id } = updatedLgFile;
  const dialogId = getBaseName(id);
  const locale = getExtension(id);
  const originLgFile = lgFiles.find((file) => id === file.id);
  const sameIdOtherLocaleFiles = lgFiles.filter((file) => {
    const fileDialogId = getBaseName(file.id);
    const fileLocale = getExtension(file.id);
    return fileDialogId === dialogId && locale !== fileLocale;
  });

  if (!originLgFile) {
    throw new Error(formatMessage('origin lg file not found in store'));
  }

  const changes: LgFile[] = [updatedLgFile];

  const addedTemplates = differenceBy(updatedLgFile.templates, originLgFile.templates, 'name')
    .filter(templateIsNotEmpty)
    .map((t) => {
      return {
        ...t,
        body: initialBody,
      };
    });
  const deletedTemplates = differenceBy(originLgFile.templates, updatedLgFile.templates, 'name').filter(
    templateIsNotEmpty
  );
  const onlyAdds = addedTemplates.length && !deletedTemplates.length;
  const onlyDeletes = !addedTemplates.length && deletedTemplates.length;

  // sync add/remove templates
  if (onlyAdds || onlyDeletes) {
    for (const file of sameIdOtherLocaleFiles) {
      let newLgFile = (await LgWorker.addTemplates(projectId, file, addedTemplates, lgFiles)) as LgFile;
      newLgFile = (await LgWorker.removeTemplates(
        projectId,
        newLgFile,
        deletedTemplates.map(({ name }) => name),
        lgFiles
      )) as LgFile;

      changes.push(newLgFile);
    }
  }

  return lgFiles.map((file) => {
    const changedFile = changes.find(({ id }) => id === file.id);
    return changedFile ? changedFile : file;
  });
};

// when do create, passed id do not carried with locale
export const createLgFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content }: { id: string; content: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const lgFiles = await snapshot.getPromise(lgFilesState);
  const locale = await snapshot.getPromise(localeState);
  const projectId = await snapshot.getPromise(projectIdState);
  const { languages } = await snapshot.getPromise(settingsState);
  const createdLgId = `${id}.${locale}`;
  if (lgFiles.find((lg) => lg.id === createdLgId)) {
    throw new Error(formatMessage('lg file already exist'));
  }
  // slot with common.lg import
  let lgInitialContent = '';
  const lgCommonFile = lgFiles.find(({ id }) => id === `common.${locale}`);
  if (lgCommonFile) {
    lgInitialContent = `[import](common.lg)`;
  }
  content = [lgInitialContent, content].join('\n');
  const createdLgFile = (await LgWorker.parse(projectId, createdLgId, content, lgFiles)) as LgFile;
  const changes: LgFile[] = [];

  // copy to other locales
  languages.forEach((lang) => {
    changes.push({
      ...createdLgFile,
      id: `${id}.${lang}`,
    });
  });

  set(lgFilesState, [...lgFiles, ...changes]);
};

export const removeLgFileState = async (callbackHelpers: CallbackInterface, { id }: { id: string }) => {
  const { set, snapshot } = callbackHelpers;
  let lgFiles = await snapshot.getPromise(lgFilesState);
  lgFiles = lgFiles.filter((file) => getBaseName(file.id) !== id);
  set(lgFilesState, lgFiles);
};

export const lgDispatcher = () => {
  const createLgFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, content }: { id: string; content: string }) => {
      await createLgFileState(callbackHelpers, { id, content });
    }
  );

  const removeLgFile = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ id }: { id: string }) => {
    await removeLgFileState(callbackHelpers, { id });
  });

  const updateLgFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, content }: { id: string; content: string }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const projectId = await snapshot.getPromise(projectIdState);
      const updatedFile = (await LgWorker.parse(projectId, id, content, lgFiles)) as LgFile;
      const updatedFiles = await updateLgFileState(projectId, lgFiles, updatedFile);
      set(lgFilesState, updatedFiles);
    }
  );

  const updateLgTemplate = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      templateName,
      template,
    }: {
      id: string;
      templateName: string;
      template: LgTemplate;
    }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const projectId = await snapshot.getPromise(projectIdState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) return lgFiles;
      const sameIdOtherLocaleFiles = lgFiles.filter((file) => getBaseName(file.id) === getBaseName(id));

      if (template.name !== templateName) {
        // name change, need update cross multi locale file.
        const changes: LgFile[] = [];
        for (const item of sameIdOtherLocaleFiles) {
          const updatedFile = (await LgWorker.updateTemplate(
            projectId,
            item,
            templateName,
            { name: template.name },
            lgFiles
          )) as LgFile;
          changes.push(updatedFile);
        }

        set(lgFilesState, (lgFiles) => {
          return lgFiles.map((file) => {
            const changedFile = changes.find(({ id }) => id === file.id);
            return changedFile ? changedFile : file;
          });
        });
      } else {
        // body change, only update current locale file
        const updatedFile = (await LgWorker.updateTemplate(
          projectId,
          lgFile,
          templateName,
          { body: template.body },
          lgFiles
        )) as LgFile;

        set(lgFilesState, (lgFiles) => {
          return lgFiles.map((file) => {
            return file.id === id ? updatedFile : file;
          });
        });
      }
    }
  );

  const createLgTemplate = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, template }: { id: string; template: LgTemplate }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const projectId = await snapshot.getPromise(projectIdState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) return lgFiles;
      const updatedFile = (await LgWorker.addTemplate(projectId, lgFile, template, lgFiles)) as LgFile;
      const updatedFiles = await updateLgFileState(projectId, lgFiles, updatedFile);
      set(lgFilesState, updatedFiles);
    }
  );

  const createLgTemplates = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, templates }: { id: string; templates: LgTemplate[] }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const projectId = await snapshot.getPromise(projectIdState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) return lgFiles;
      const updatedFile = (await LgWorker.addTemplates(projectId, lgFile, templates, lgFiles)) as LgFile;
      const updatedFiles = await updateLgFileState(projectId, lgFiles, updatedFile);
      set(lgFilesState, updatedFiles);
    }
  );

  const removeLgTemplate = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, templateName }: { id: string; templateName: string }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const projectId = await snapshot.getPromise(projectIdState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) return lgFiles;
      const updatedFile = (await LgWorker.removeTemplate(projectId, lgFile, templateName, lgFiles)) as LgFile;

      const updatedFiles = await updateLgFileState(projectId, lgFiles, updatedFile);
      set(lgFilesState, updatedFiles);
    }
  );

  const removeLgTemplates = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      templateNames,
    }: {
      id: string;
      templateNames: string[];
    }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const projectId = await snapshot.getPromise(projectIdState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) return lgFiles;
      const updatedFile = (await LgWorker.removeTemplates(projectId, lgFile, templateNames, lgFiles)) as LgFile;

      const updatedFiles = await updateLgFileState(projectId, lgFiles, updatedFile);
      set(lgFilesState, updatedFiles);
    }
  );

  const copyLgTemplate = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      fromTemplateName,
      toTemplateName,
    }: {
      id: string;
      fromTemplateName: string;
      toTemplateName: string;
    }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const projectId = await snapshot.getPromise(projectIdState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) return lgFiles;
      const updatedFile = (await LgWorker.copyTemplate(
        projectId,
        lgFile,
        fromTemplateName,
        toTemplateName,
        lgFiles
      )) as LgFile;
      const updatedFiles = await updateLgFileState(projectId, lgFiles, updatedFile);
      set(lgFilesState, updatedFiles);
    }
  );

  return {
    updateLgFile,
    createLgFile,
    removeLgFile,
    updateLgTemplate,
    createLgTemplate,
    createLgTemplates,
    removeLgTemplate,
    removeLgTemplates,
    copyLgTemplate,
  };
};
