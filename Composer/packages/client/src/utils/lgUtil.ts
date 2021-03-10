// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, LgFile, LgTemplate } from '@bfc/shared';
import difference from 'lodash/difference';

import lgWorker from '../recoilModel/parsers/lgWorker';

import { getBaseName } from './fileUtil';

/**
 * Auto create placeholder template used in dialog but did not exist in <dialog>.<*locale>.lg
 */

export const createMissingLgTemplatesForDialogs = async (
  projectId: string,
  dialogs: DialogInfo[],
  lgFiles: LgFile[]
): Promise<LgFile[]> => {
  const updatedLgFiles: LgFile[] = [];

  const templateNamesInDialog: Record<string, string[]> = dialogs.reduce((result, dialog: DialogInfo) => {
    const { id, lgTemplates } = dialog;
    result[id] = lgTemplates.map(({ name }) => name);
    return result;
  }, {});

  for (const lgFile of lgFiles) {
    const dialogId = getBaseName(lgFile.id);
    const templatesShouldExist = templateNamesInDialog[dialogId];
    const templatesInLgFile = lgFile.allTemplates.map(({ name }) => name);
    const templatesNotExist = difference(templatesShouldExist, templatesInLgFile);
    if (templatesNotExist?.length) {
      const templatesToAdd = templatesNotExist.map((name) => {
        return { name, body: '-', parameters: [] } as LgTemplate;
      });
      const updatedFile = (await lgWorker.addTemplates(projectId, lgFile, templatesToAdd, lgFiles)) as LgFile;
      updatedLgFiles.push(updatedFile);
    } else {
      updatedLgFiles.push(lgFile);
    }
  }

  return updatedLgFiles;
};
