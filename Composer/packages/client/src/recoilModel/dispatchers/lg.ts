// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LgTemplate, LgFile, importResolverGenerator } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import differenceBy from 'lodash/differenceBy';

import { getBaseName, getExtension } from '../../utils/fileUtil';

import LgWorker from './../parsers/lgWorker';
import { lgFilesState, localeState, settingsState } from './../atoms/botState';
import * as lgUtil from './../../utils/lgUtil';

const templateIsNotEmpty = ({ name, body }) => {
  return !!name && !!body;
};

// fill other locale lgFile new added template with '- '
const initialBody = '- ';

export const updateLgFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content }: { id: string; content: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const lgFiles = await snapshot.getPromise(lgFilesState);
  const dialogId = getBaseName(id);
  const locale = getExtension(id);
  const updatedLgFile = (await LgWorker.parse(id, content, lgFiles)) as LgFile;
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
      let newLgFile = lgUtil.addTemplates(file.id, file.content, addedTemplates, lgImportResolver);
      newLgFile = lgUtil.removeTemplates(
        file.id,
        newLgFile.content,
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
  const createdLgFile = (await LgWorker.parse(createdLgId, content, lgFiles)) as LgFile;
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
      let content = lgFiles.find((file) => file.id === id)?.content ?? '';
      content = lgUtil.updateTemplate(id, content, templateName, template, lgFileResolver(lgFiles)).content;
      await updateLgFileState(callbackHelpers, { id, content });
    }
  );

  const createLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, template }: { id: string; template: LgTemplate }) => {
      const { snapshot } = callbackHelpers;
      const lgFiles = await snapshot.getPromise(lgFilesState);
      let content = lgFiles.find((file) => file.id === id)?.content ?? '';
      content = lgUtil.addTemplate(id, content, template, lgFileResolver(lgFiles)).content;
      await updateLgFileState(callbackHelpers, { id, content });
    }
  );

  const removeLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, templateName }: { id: string; templateName: string }) => {
      const { snapshot } = callbackHelpers;
      const lgFiles = await snapshot.getPromise(lgFilesState);
      let content = lgFiles.find((file) => file.id === id)?.content ?? '';
      content = lgUtil.removeTemplate(id, content, templateName, lgFileResolver(lgFiles)).content;
      await updateLgFileState(callbackHelpers, { id, content });
    }
  );

  const removeLgTemplates = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, templateNames }: { id: string; templateNames: string[] }) => {
      const { snapshot } = callbackHelpers;
      const lgFiles = await snapshot.getPromise(lgFilesState);
      let content = lgFiles.find((file) => file.id === id)?.content ?? '';
      content = lgUtil.removeTemplates(id, content, templateNames, lgFileResolver(lgFiles)).content;
      await updateLgFileState(callbackHelpers, { id, content });
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
      let content = lgFiles.find((file) => file.id === id)?.content ?? '';
      content = lgUtil.copyTemplate(id, content, fromTemplateName, toTemplateName, lgFileResolver(lgFiles)).content;
      await updateLgFileState(callbackHelpers, { id, content });
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
