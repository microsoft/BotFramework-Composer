// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Define the project structure
import { FileExtensions } from '@bfc/shared';

import { Path } from '../../utility/path';

const BotStructureTemplate = {
  entry: '${BOTNAME}.dialog',
  lg: 'language-generation/${LOCALE}/${BOTNAME}.${LOCALE}.lg',
  lu: 'language-understanding/${LOCALE}/${BOTNAME}.${LOCALE}.lu',
  dialogSchema: '${BOTNAME}.dialog.schema',
  schema: '${FILENAME}',
  settings: 'settings/${FILENAME}',
  common: {
    lg: 'language-generation/${LOCALE}/common.${LOCALE}.lg',
  },
  dialogs: {
    entry: 'dialogs/${DIALOGNAME}/${DIALOGNAME}.dialog',
    lg: 'dialogs/${DIALOGNAME}/language-generation/${LOCALE}/${DIALOGNAME}.${LOCALE}.lg',
    lu: 'dialogs/${DIALOGNAME}/language-understanding/${LOCALE}/${DIALOGNAME}.${LOCALE}.lu',
    dialogSchema: 'dialogs/${DIALOGNAME}/${DIALOGNAME}.dialog.schema',
  },
  formDialogs: 'form-dialogs/${FORMDIALOGNAME}',
  skillManifests: 'manifests/${MANIFESTFILENAME}',
};

const templateInterpolate = (str: string, obj: { [key: string]: string }) =>
  str.replace(/\${([^}]+)}/g, (_, prop) => obj[prop]);

export const parseFileName = (name: string, defaultLocale: string) => {
  const fileType = Path.extname(name);
  const id = Path.basename(name, fileType);

  let fileId = id;
  let locale = defaultLocale;
  const index = id.lastIndexOf('.');
  if (index !== -1) {
    fileId = id.slice(0, index);
    locale = id.slice(index + 1);
  }
  return { fileId, locale, fileType };
};

// only
export const defaultFilePath = (botName: string, defaultLocale: string, filename: string): string => {
  const { fileId, locale, fileType } = parseFileName(filename, defaultLocale);
  const BOTNAME = botName.toLowerCase();
  const CommonFileId = 'common';
  const LOCALE = locale;

  // 1. Even appsettings.json hit FileExtensions.Manifest, but it never use this do created.
  // 2. When exprot bot as a skill, name is `EchoBot-4-2-1-preview-1-manifest.json`
  if (fileType === FileExtensions.Manifest) {
    return templateInterpolate(BotStructureTemplate.skillManifests, {
      MANIFESTFILENAME: filename,
    });
  }

  if (fileType === FileExtensions.FormDialogSchema) {
    return templateInterpolate(BotStructureTemplate.formDialogs, {
      FORMDIALOGNAME: filename,
    });
  }

  // common.lg
  if (fileId === CommonFileId && fileType === FileExtensions.Lg) {
    return templateInterpolate(BotStructureTemplate.common.lg, {
      LOCALE,
    });
  }

  const DIALOGNAME = fileId;
  const isRootFile = BOTNAME === DIALOGNAME.toLowerCase();

  let TemplatePath = '';

  switch (fileType) {
    case FileExtensions.Dialog:
      TemplatePath = isRootFile ? BotStructureTemplate.entry : BotStructureTemplate.dialogs.entry;
      break;
    case FileExtensions.Lg:
      TemplatePath = isRootFile ? BotStructureTemplate.lg : BotStructureTemplate.dialogs.lg;
      break;
    case FileExtensions.Lu:
      TemplatePath = isRootFile ? BotStructureTemplate.lu : BotStructureTemplate.dialogs.lu;
      break;
    case FileExtensions.DialogSchema:
      TemplatePath = isRootFile ? BotStructureTemplate.dialogSchema : BotStructureTemplate.dialogs.dialogSchema;
      break;
  }

  return templateInterpolate(TemplatePath, {
    BOTNAME,
    DIALOGNAME,
    LOCALE,
  });
};

// when create/saveAs bot, serialize entry dialog/lg/lu
export const serializeFiles = async (fileStorage, rootPath, botName) => {
  const entryPatterns = [
    templateInterpolate(BotStructureTemplate.entry, { BOTNAME: '*' }),
    templateInterpolate(BotStructureTemplate.lg, { LOCALE: '*', BOTNAME: '*' }),
    templateInterpolate(BotStructureTemplate.lu, { LOCALE: '*', BOTNAME: '*' }),
    templateInterpolate(BotStructureTemplate.dialogSchema, { BOTNAME: '*' }),
  ];
  for (const pattern of entryPatterns) {
    const paths = await fileStorage.glob(pattern, rootPath);
    for (const filePath of paths.sort()) {
      const realFilePath = Path.join(rootPath, filePath);
      // skip common file, do not rename.
      if (Path.basename(realFilePath).startsWith('common.')) continue;
      // rename file to new botname
      const targetFilePath = realFilePath.replace(/(.*)\/[^.]*(\..*$)/i, `$1/${botName}$2`);
      await fileStorage.rename(realFilePath, targetFilePath);
    }
  }
};
