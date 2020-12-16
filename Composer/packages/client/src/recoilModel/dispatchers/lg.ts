// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { LgTemplate, LgFile } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import differenceBy from 'lodash/differenceBy';
import formatMessage from 'format-message';

import { getBaseName, getExtension } from '../../utils/fileUtil';
import { dispatcherState } from '../DispatcherWrapper';

import { setError } from './shared';
import LgWorker from './../parsers/lgWorker';
import LgDiagnosticWorker from './../parsers/lgDiagnosticWorker';
import { lgFilesState, localeState, settingsState } from './../atoms/botState';

const templateIsNotEmpty = ({ name, body }) => {
  return !!name && !!body;
};

// fill other locale lgFile new added template with '- '
const initialBody = '- ';

/**
 * Recoil state from snapshot can be expired, use updater can make fine-gained operations.
 *
 * @param changes files need to update/add/delete
 * @param filter drop some expired changes.
 *
 */

const lgFilesAtomUpdater = (
  changes: {
    adds?: LgFile[];
    deletes?: LgFile[];
    updates?: LgFile[];
  },
  filter?: (oldList: LgFile[]) => (changeItem: LgFile) => boolean
) => {
  return (oldList: LgFile[]) => {
    const updates = changes.updates ? (filter ? changes.updates.filter(filter(oldList)) : changes.updates) : [];
    const adds = changes.adds ? (filter ? changes.adds.filter(filter(oldList)) : changes.adds) : [];
    const deletes = changes.deletes
      ? filter
        ? changes.deletes.filter(filter(oldList)).map(({ id }) => id)
        : changes.deletes.map(({ id }) => id)
      : [];

    // updates
    let newList = oldList.map((file) => {
      const changedFile = updates.find(({ id }) => id === file.id);
      return changedFile ?? file;
    });

    // deletes
    newList = newList.filter((file) => !deletes.includes(file.id));

    // adds
    newList = adds.concat(newList);

    return newList;
  };
};

// sync lg file structure across locales, it take times, computed changes may be expired at next tick.
export const getRelatedLgFileChanges = async (
  projectId: string,
  lgFiles: LgFile[],
  updatedLgFile: LgFile
): Promise<LgFile[]> => {
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

  return changes;
};

// when do create, passed id do not carried with locale
export const createLgFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content, projectId }: { id: string; content: string; projectId: string }
) => {
  try {
    const { set, snapshot } = callbackHelpers;
    const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
    const locale = await snapshot.getPromise(localeState(projectId));
    const { languages } = await snapshot.getPromise(settingsState(projectId));
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

    set(lgFilesState(projectId), lgFilesAtomUpdater({ adds: changes }));
  } catch (error) {
    setError(callbackHelpers, error);
  }
};

export const removeLgFileState = async (
  callbackHelpers: CallbackInterface,
  { id, projectId }: { id: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
  const locale = await snapshot.getPromise(localeState(projectId));

  const targetLgFile = lgFiles.find((item) => item.id === id) || lgFiles.find((item) => item.id === `${id}.${locale}`);
  if (!targetLgFile) {
    setError(callbackHelpers, new Error(`remove lg file ${id} not exist`));
    return;
  }

  set(lgFilesState(projectId), lgFilesAtomUpdater({ deletes: [targetLgFile] }));
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
      try {
        await createLgFileState(callbackHelpers, { id, content, projectId });
      } catch (error) {
        setError(callbackHelpers, error);
      }
    }
  );

  const removeLgFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, projectId }: { id: string; projectId: string }) => {
      await removeLgFileState(callbackHelpers, { id, projectId });
    }
  );

  const updateLgFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      content,
      projectId,
    }: {
      id: string;
      content: string;
      projectId: string;
    }) => {
      try {
        const { set, snapshot } = callbackHelpers;
        //set content first
        set(lgFilesState(projectId), (prevLgFiles) => {
          return prevLgFiles.map((file) => {
            if (file.id === id) {
              return {
                ...file,
                content,
              };
            }
            return file;
          });
        });

        const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
        const updatedFile = (await LgWorker.parse(projectId, id, content, lgFiles)) as LgFile;
        const updatedFiles = await getRelatedLgFileChanges(projectId, lgFiles, updatedFile);

        // compare to drop expired change on current id lg file.
        /**
         * Why other methods do not need double check content?
         * Because this method already did set content before call lgFilesAtomUpdater.
         */
        set(
          lgFilesState(projectId),
          lgFilesAtomUpdater({ updates: updatedFiles }, (prevLgFiles) => {
            const targetInState = prevLgFiles.find((file) => file.id === updatedFile.id);
            const targetInCurrentChange = updatedFiles.find((file) => file.id === updatedFile.id);
            // compare to drop expired content already setted above.
            if (targetInState?.content !== targetInCurrentChange?.content) {
              return (lgFile) => lgFile.id !== updatedFile.id;
            } else {
              return () => true;
            }
          })
        );

        // if changes happen on common.lg, async re-parse all.
        if (getBaseName(id) === 'common') {
          const { reparseAllLgFiles } = await snapshot.getPromise(dispatcherState);
          reparseAllLgFiles({ projectId });
        }
      } catch (error) {
        setError(callbackHelpers, error);
      }
    }
  );

  const updateLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
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
      const { set, snapshot } = callbackHelpers;
      const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) return lgFiles;
      const sameIdOtherLocaleFiles = lgFiles.filter((file) => getBaseName(file.id) === getBaseName(id));

      // create need sync to multi locale file.
      const originTemplate = lgFile.templates.find(({ name }) => name === templateName);
      if (!originTemplate) {
        await createLgTemplate({ id, template, projectId });
        return;
      }

      try {
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
          set(lgFilesState(projectId), lgFilesAtomUpdater({ updates: changes }));
        } else {
          // body change, only update current locale file
          const updatedFile = (await LgWorker.updateTemplate(
            projectId,
            lgFile,
            templateName,
            { body: template.body },
            lgFiles
          )) as LgFile;
          set(lgFilesState(projectId), lgFilesAtomUpdater({ updates: [updatedFile] }));
        }
      } catch (error) {
        setError(callbackHelpers, error);
        return;
      }

      // if changes happen on common.lg, async re-parse all.
      if (getBaseName(id) === 'common') {
        const { reparseAllLgFiles } = await snapshot.getPromise(dispatcherState);
        reparseAllLgFiles({ projectId });
      }
    }
  );

  const createLgTemplate = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      template,
      projectId,
    }: {
      id: string;
      template: LgTemplate;
      projectId: string;
    }) => {
      const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) return lgFiles;
      const updatedFile = (await LgWorker.addTemplate(projectId, lgFile, template, lgFiles)) as LgFile;
      const updatedFiles = await getRelatedLgFileChanges(projectId, lgFiles, updatedFile);
      set(lgFilesState(projectId), lgFilesAtomUpdater({ updates: updatedFiles }));
    }
  );

  const createLgTemplates = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      templates,
      projectId,
    }: {
      id: string;
      templates: LgTemplate[];
      projectId: string;
    }) => {
      try {
        const { set, snapshot } = callbackHelpers;
        const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const updatedFile = (await LgWorker.addTemplates(projectId, lgFile, templates, lgFiles)) as LgFile;
        const updatedFiles = await getRelatedLgFileChanges(projectId, lgFiles, updatedFile);
        set(lgFilesState(projectId), lgFilesAtomUpdater({ updates: updatedFiles }));
      } catch (error) {
        setError(callbackHelpers, error);
      }
    }
  );

  const removeLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      templateName,
      projectId,
    }: {
      id: string;
      templateName: string;
      projectId: string;
    }) => {
      const { set, snapshot } = callbackHelpers;
      const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
      const lgFile = lgFiles.find((file) => file.id === id);
      if (!lgFile) return lgFiles;
      try {
        const updatedFile = (await LgWorker.removeTemplate(projectId, lgFile, templateName, lgFiles)) as LgFile;

        const updatedFiles = await getRelatedLgFileChanges(projectId, lgFiles, updatedFile);
        set(lgFilesState(projectId), lgFilesAtomUpdater({ updates: updatedFiles }));
      } catch (error) {
        setError(callbackHelpers, error);
      }
    }
  );

  const removeLgTemplates = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      templateNames,
      projectId,
    }: {
      id: string;
      templateNames: string[];
      projectId: string;
    }) => {
      try {
        const { set, snapshot } = callbackHelpers;
        const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;

        const updatedFile = (await LgWorker.removeTemplates(projectId, lgFile, templateNames, lgFiles)) as LgFile;

        const updatedFiles = await getRelatedLgFileChanges(projectId, lgFiles, updatedFile);
        set(lgFilesState(projectId), lgFilesAtomUpdater({ updates: updatedFiles }));
      } catch (error) {
        setError(callbackHelpers, error);
      }
    }
  );

  const copyLgTemplate = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
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
      try {
        const { set, snapshot } = callbackHelpers;
        const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
        const lgFile = lgFiles.find((file) => file.id === id);
        if (!lgFile) return lgFiles;
        const updatedFile = (await LgWorker.copyTemplate(
          projectId,
          lgFile,
          fromTemplateName,
          toTemplateName,
          lgFiles
        )) as LgFile;
        const updatedFiles = await getRelatedLgFileChanges(projectId, lgFiles, updatedFile);
        set(lgFilesState(projectId), lgFilesAtomUpdater({ updates: updatedFiles }));
      } catch (error) {
        setError(callbackHelpers, error);
      }
    }
  );

  const reparseAllLgFiles = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ projectId }: { projectId: string }) => {
      try {
        const { set, snapshot } = callbackHelpers;
        const lgFiles = await snapshot.getPromise(lgFilesState(projectId));
        const reparsedLgFiles: LgFile[] = [];
        for (const file of lgFiles) {
          const reparsedFile = (await LgDiagnosticWorker.parse(projectId, file.id, file.content, lgFiles)) as LgFile;
          reparsedLgFiles.push({ ...file, diagnostics: reparsedFile.diagnostics });
        }
        set(
          lgFilesState(projectId),
          lgFilesAtomUpdater({ updates: reparsedLgFiles }, (prevLgFiles) => {
            // compare to drop expired content already setted above.
            return (target) => {
              const targetInState = prevLgFiles.find((file) => file.id === target.id);
              const targetInCurrentChange = reparsedLgFiles.find((file) => file.id === target.id);
              return targetInState?.content === targetInCurrentChange?.content;
            };
          })
        );
      } catch (error) {
        setError(callbackHelpers, error);
      }
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
    reparseAllLgFiles,
  };
};
