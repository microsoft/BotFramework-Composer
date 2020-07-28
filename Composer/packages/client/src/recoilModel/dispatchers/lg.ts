// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LgTemplate, LgFile, importResolverGenerator } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import differenceBy from 'lodash/differenceBy';

import { getBaseName, getExtension } from '../../utils/fileUtil';

import { lgFilesState, localeState, settingsState } from './../atoms/botState';
import * as lgUtil from './../../utils/lgUtil';

const templateIsNotEmpty = ({ name, body }) => {
  return !!name && !!body;
};

// fill other locale lgFile new added template with '- '
const initialBody = '- ';

export const updateLgFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content, updatedFile }: { id: string; content: string; updatedFile?: LgFile }
) => {
  const { set, snapshot } = callbackHelpers;
  const lgFiles = await snapshot.getPromise(lgFilesState);
  const dialogId = getBaseName(id);
  const locale = getExtension(id);
  const updatedLgFile = updatedFile || lgUtil.parse(id, content, lgFiles);
  const originLgFile = lgFiles.find((file) => id === file.id);
  const sameIdOtherLocaleFiles = lgFiles.filter((file) => {
    const fileDialogId = getBaseName(file.id);
    const fileLocale = getExtension(file.id);
    return fileDialogId === dialogId && locale !== fileLocale;
  });

  if (!originLgFile) {
    throw new Error('origin lg file not found in store');
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
      const lgImportResolver = importResolverGenerator(lgFiles, '.lg', getExtension(file.id));
      let newLgFile = lgUtil.addTemplates(file, addedTemplates, lgImportResolver);
      newLgFile = lgUtil.removeTemplates(
        newLgFile,
        deletedTemplates.map(({ name }) => name),
        lgImportResolver
      );

      changes.push(newLgFile);
    }
  }

  const newlgFiles = lgFiles.map((file) => {
    const changedFile = changes.find(({ id }) => id === file.id);
    if (changedFile) {
      return changedFile;
    }
    return file;
  });

  set(lgFilesState, newlgFiles);
};

// when do create, passed id do not carried with locale
export const createLgFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content }: { id: string; content: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const lgFiles = await snapshot.getPromise(lgFilesState);
  const locale = await snapshot.getPromise(localeState);
  const { languages } = await snapshot.getPromise(settingsState);
  const createdLgId = `${id}.${locale}`;
  if (lgFiles.find((lg) => lg.id === createdLgId)) {
    throw new Error('lg file already exist');
  }
  // slot with common.lg import
  let lgInitialContent = '';
  const lgCommonFile = lgFiles.find(({ id }) => id === `common.${locale}`);
  if (lgCommonFile) {
    lgInitialContent = `[import](common.lg)`;
  }
  content = [lgInitialContent, content].join('\n');
  const createdLgFile = lgUtil.parse(createdLgId, content, lgFiles);
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
    (callbackHelpers: CallbackInterface) => async ({ id, content }: { id: string; content: string }) => {
      await updateLgFileState(callbackHelpers, { id, content });
    }
  );

  const lgFileResolver = (lgFiles) => {
    return importResolverGenerator(lgFiles, '.lg');
  };

  const updateLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      templateName,
      template,
    }: {
      id: string;
      templateName: string;
      template: LgTemplate;
    }) => {
      const { snapshot } = callbackHelpers;
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) {
        throw new Error(`lg file ${id} not exist`);
      }
      const updatedFile = lgUtil.updateTemplate(lgFile, templateName, template, lgFileResolver(lgFiles));
      await updateLgFileState(callbackHelpers, { id, content: updatedFile.content, updatedFile });
    }
  );

  const createLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, template }: { id: string; template: LgTemplate }) => {
      const { snapshot } = callbackHelpers;
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) {
        throw new Error(`lg file ${id} not exist`);
      }

      const updatedFile = lgUtil.addTemplate(lgFile, template, lgFileResolver(lgFiles));
      await updateLgFileState(callbackHelpers, { id, updatedFile, content: updatedFile.content });
    }
  );

  const removeLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, templateName }: { id: string; templateName: string }) => {
      const { snapshot } = callbackHelpers;
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) {
        throw new Error(`lg file ${id} not exist`);
      }

      const updatedFile = lgUtil.removeTemplate(lgFile, templateName, lgFileResolver(lgFiles));
      await updateLgFileState(callbackHelpers, { id, updatedFile, content: updatedFile.content });
    }
  );

  const removeLgTemplates = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, templateNames }: { id: string; templateNames: string[] }) => {
      const { snapshot } = callbackHelpers;
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) {
        throw new Error(`lg file ${id} not exist`);
      }
      const updatedFile = lgUtil.removeTemplates(lgFile, templateNames, lgFileResolver(lgFiles));
      await updateLgFileState(callbackHelpers, { id, updatedFile, content: updatedFile.content });
    }
  );

  const copyLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      fromTemplateName,
      toTemplateName,
    }: {
      id: string;
      fromTemplateName: string;
      toTemplateName: string;
    }) => {
      const { snapshot } = callbackHelpers;
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) {
        throw new Error(`lg file ${id} not exist`);
      }
      const updatedFile = lgUtil.copyTemplate(lgFile, fromTemplateName, toTemplateName, lgFileResolver(lgFiles));
      await updateLgFileState(callbackHelpers, { id, updatedFile, content: updatedFile.content });
    }
  );

  return {
    updateLgFile,
    createLgFile,
    removeLgFile,
    updateLgTemplate,
    createLgTemplate,
    removeLgTemplate,
    removeLgTemplates,
    copyLgTemplate,
  };
};
