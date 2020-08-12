// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LgTemplate, LgFile, importResolverGenerator } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import differenceBy from 'lodash/differenceBy';
import formatMessage from 'format-message';

import { getBaseName, getExtension } from '../../utils/fileUtil';
import { botStateByProjectIdSelector } from '../selectors';

import LgWorker from './../parsers/lgWorker';
import { lgFilesState } from './../atoms';
import * as lgUtil from './../../utils/lgUtil';

const templateIsNotEmpty = ({ name, body }) => {
  return !!name && !!body;
};

// fill other locale lgFile new added template with '- '
const initialBody = '- ';

export const updateLgFileState = (lgFiles: LgFile[], updatedLgFile: LgFile) => {
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

  return lgFiles.map((file) => {
    const changedFile = changes.find(({ id }) => id === file.id);
    return changedFile ? changedFile : file;
  });
};

// when do create, passed id do not carried with locale
export const createLgFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content, projectId }: { id: string; content: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const { lgFiles, locale, dialogSetting: settings } = await snapshot.getPromise(botStateByProjectIdSelector);

  const { languages } = settings;
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
  const createdLgFile = lgUtil.parse(createdLgId, content, lgFiles);
  const changes: LgFile[] = [];

  // copy to other locales
  languages.forEach((lang) => {
    changes.push({
      ...createdLgFile,
      id: `${id}.${lang}`,
    });
  });

  set(lgFilesState(projectId), [...lgFiles, ...changes]);
};

export const removeLgFileState = async (
  callbackHelpers: CallbackInterface,
  { id, projectId }: { id: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  let { lgFiles } = await snapshot.getPromise(botStateByProjectIdSelector);
  lgFiles = lgFiles.filter((file) => getBaseName(file.id) !== id);
  set(lgFilesState(projectId), lgFiles);
};

export const lgDispatcher = () => {
  const createLgFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      content,
      projectId,
    }: {
      id: string;
      content: string;
      projectId: string;
    }) => {
      await createLgFileState(callbackHelpers, { id, content, projectId });
    }
  );

  const removeLgFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, projectId }: { id: string; projectId: string }) => {
      await removeLgFileState(callbackHelpers, { id, projectId });
    }
  );

  const updateLgFile = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      content,
      projectId,
    }: {
      id: string;
      content: string;
      projectId: string;
    }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
      const updatedFile = (await LgWorker.parse(id, content, lgFiles)) as LgFile;
      set(lgFilesState(projectId), (lgFiles) => {
        return updateLgFileState(lgFiles, updatedFile);
      });
    }
  );

  const lgFileResolver = (lgFiles) => {
    return importResolverGenerator(lgFiles, '.lg');
  };

  const updateLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => ({
      id,
      templateName,
      template,
      projectId,
    }: {
      id: string;
      templateName: string;
      template: LgTemplate;
      projectId: string;
    }) => {
      set(lgFilesState(projectId), (lgFiles) => {
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const updatedFile = lgUtil.updateTemplate(lgFile, templateName, template, lgFileResolver(lgFiles));
        return updateLgFileState(lgFiles, updatedFile);
      });
    }
  );

  const createLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => ({
      id,
      template,
      projectId,
    }: {
      id: string;
      template: LgTemplate;
      projectId: string;
    }) => {
      set(lgFilesState(projectId), (lgFiles) => {
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const updatedFile = lgUtil.addTemplate(lgFile, template, lgFileResolver(lgFiles));
        return updateLgFileState(lgFiles, updatedFile);
      });
    }
  );

  const removeLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => ({
      id,
      templateName,
      projectId,
    }: {
      id: string;
      templateName: string;
      projectId: string;
    }) => {
      set(lgFilesState(projectId), (lgFiles) => {
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const updatedFile = lgUtil.removeTemplate(lgFile, templateName, lgFileResolver(lgFiles));
        return updateLgFileState(lgFiles, updatedFile);
      });
    }
  );

  const removeLgTemplates = useRecoilCallback(
    ({ set }: CallbackInterface) => ({
      id,
      templateNames,
      projectId,
    }: {
      id: string;
      templateNames: string[];
      projectId: string;
    }) => {
      set(lgFilesState(projectId), (lgFiles) => {
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const updatedFile = lgUtil.removeTemplates(lgFile, templateNames, lgFileResolver(lgFiles));
        return updateLgFileState(lgFiles, updatedFile);
      });
    }
  );

  const copyLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => ({
      id,
      fromTemplateName,
      toTemplateName,
      projectId,
    }: {
      id: string;
      fromTemplateName: string;
      toTemplateName: string;
      projectId: string;
    }) => {
      set(lgFilesState(projectId), (lgFiles) => {
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const updatedFile = lgUtil.copyTemplate(lgFile, fromTemplateName, toTemplateName, lgFileResolver(lgFiles));
        return updateLgFileState(lgFiles, updatedFile);
      });
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
