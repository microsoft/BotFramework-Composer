// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LgTemplate, LgFile, importResolverGenerator } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import differenceBy from 'lodash/differenceBy';
import formatMessage from 'format-message';
import { lgUtil } from '@bfc/indexers';

import { getBaseName, getExtension } from '../../utils/fileUtil';

import LgWorker from './../parsers/lgWorker';
import { lgFilesState, localeState, settingsState } from './../atoms/botState';

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
  { id, content }: { id: string; content: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const lgFiles = await snapshot.getPromise(lgFilesState);
  const locale = await snapshot.getPromise(localeState);
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
    ({ set, snapshot }: CallbackInterface) => async ({ id, content }: { id: string; content: string }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState);
      const updatedFile = (await LgWorker.parse(id, content, lgFiles)) as LgFile;
      set(lgFilesState, (lgFiles) => {
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
    }: {
      id: string;
      templateName: string;
      template: LgTemplate;
    }) => {
      set(lgFilesState, (lgFiles) => {
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const sameIdOtherLocaleFiles = lgFiles.filter((file) => getBaseName(file.id) === getBaseName(id));

        // name change, need update cross multi locale file.
        if (template.name !== templateName) {
          const changes: LgFile[] = [];
          for (const item of sameIdOtherLocaleFiles) {
            const updatedFile = lgUtil.updateTemplate(
              item,
              templateName,
              { name: template.name },
              lgFileResolver(lgFiles)
            );
            changes.push(updatedFile);
          }
          return lgFiles.map((file) => {
            const changedFile = changes.find(({ id }) => id === file.id);
            return changedFile ? changedFile : file;
          });

          // body change, only update current locale file
        } else {
          const updatedFile = lgUtil.updateTemplate(
            lgFile,
            templateName,
            { body: template.body },
            lgFileResolver(lgFiles)
          );
          return lgFiles.map((file) => {
            return file.id === id ? updatedFile : file;
          });
        }
      });
    }
  );

  const createLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => ({ id, template }: { id: string; template: LgTemplate }) => {
      set(lgFilesState, (lgFiles) => {
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const updatedFile = lgUtil.addTemplate(lgFile, template, lgFileResolver(lgFiles));
        return updateLgFileState(lgFiles, updatedFile);
      });
    }
  );

  const createLgTemplates = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ id, templates }: { id: string; templates: LgTemplate[] }) => {
      set(lgFilesState, (lgFiles) => {
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const updatedFile = lgUtil.addTemplates(lgFile, templates, lgFileResolver(lgFiles));
        return updateLgFileState(lgFiles, updatedFile);
      });
    }
  );

  const removeLgTemplate = useRecoilCallback(
    ({ set }: CallbackInterface) => ({ id, templateName }: { id: string; templateName: string }) => {
      set(lgFilesState, (lgFiles) => {
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const updatedFile = lgUtil.removeTemplate(lgFile, templateName, lgFileResolver(lgFiles));
        return updateLgFileState(lgFiles, updatedFile);
      });
    }
  );

  const removeLgTemplates = useRecoilCallback(
    ({ set }: CallbackInterface) => ({ id, templateNames }: { id: string; templateNames: string[] }) => {
      set(lgFilesState, (lgFiles) => {
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
    }: {
      id: string;
      fromTemplateName: string;
      toTemplateName: string;
    }) => {
      set(lgFilesState, (lgFiles) => {
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
    createLgTemplates,
    removeLgTemplate,
    removeLgTemplates,
    copyLgTemplate,
  };
};
