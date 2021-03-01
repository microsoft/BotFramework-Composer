// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Define the project structure
import { FileExtensions } from '@bfc/shared';

import { Path } from '../../utility/path';

const BotStructureTemplate = {
  entry: '${BOTNAME}.dialog',
  lg: 'language-generation/${LOCALE}/${BOTNAME}.${LOCALE}.lg',
  lu: 'language-understanding/${LOCALE}/${BOTNAME}.${LOCALE}.lu',
  qna: 'knowledge-base/en-us/${BOTNAME}.en-us.qna',
  sourceQnA: 'knowledge-base/source/${FILENAME}.source.qna',
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
    qna: 'dialogs/${DIALOGNAME}/knowledge-base/en-us/${DIALOGNAME}.en-us.qna',
    sourceQnA: 'dialogs/${DIALOGNAME}/knowledge-base/source/${FILENAME}.source.qna',
    dialogSchema: 'dialogs/${DIALOGNAME}/${DIALOGNAME}.dialog.schema',
    recognizer: 'dialogs/${DIALOGNAME}/recognizers/${RECOGNIZERNAME}',
  },
  importedDialogs: {
    entry: 'dialogs/imported/${DIALOGNAME}/${DIALOGNAME}.dialog',
    lg: 'dialogs/imported/${DIALOGNAME}/language-generation/${LOCALE}/${DIALOGNAME}.${LOCALE}.lg',
    lu: 'dialogs/imported/${DIALOGNAME}/language-understanding/${LOCALE}/${DIALOGNAME}.${LOCALE}.lu',
    qna: 'dialogs/imported/${DIALOGNAME}/knowledge-base/en-us/${DIALOGNAME}.en-us.qna',
    sourceQnA: 'dialogs/imported/${DIALOGNAME}/knowledge-base/source/${FILENAME}.source.qna',
    dialogSchema: 'dialogs/imported/${DIALOGNAME}/${DIALOGNAME}.dialog.schema',
    recognizer: 'dialogs/imported/${DIALOGNAME}/recognizers/${RECOGNIZERNAME}',
  },
  formDialogs: 'form-dialogs/${FORMDIALOGNAME}',
  skillManifests: 'manifests/${MANIFESTFILENAME}',
  botProject: '${BOTNAME}.botproj',
  recognizer: 'recognizers/${RECOGNIZERNAME}',
  crossTrainConfig: 'settings/${CROSSTRAINCONFIGNAME}',
};

const templateInterpolate = (str: string, obj: { [key: string]: string }) =>
  str.replace(/\${([^}]+)}/g, (_, prop) => obj[prop]);

// parse QnA source file name: [dialogId].[fileId].source.qna, ignore locale for now.
// [fileId].source.qna would store to bot root folder.
const parseSourceFileName = (name: string, locale: string) => {
  const fileType = FileExtensions.SourceQnA;
  const id = Path.basename(name, fileType);

  let dialogId = '',
    fileId = '';

  if (id.includes('.')) {
    [dialogId, fileId] = id.split('.');
  } else {
    fileId = id;
  }

  return { fileId, dialogId, fileType, locale };
};

export const BotStructureFilesPatterns = [
  templateInterpolate(BotStructureTemplate.entry, { BOTNAME: '*' }),
  templateInterpolate(BotStructureTemplate.settings, { FILENAME: 'appsettings.json' }),
  templateInterpolate(BotStructureTemplate.dialogs.entry, { DIALOGNAME: '*' }),
  templateInterpolate(BotStructureTemplate.dialogs.dialogSchema, { DIALOGNAME: '*' }),
  templateInterpolate(BotStructureTemplate.dialogs.recognizer, { DIALOGNAME: '*', RECOGNIZERNAME: '*.dialog' }),

  templateInterpolate(BotStructureTemplate.importedDialogs.entry, { DIALOGNAME: '*' }),
  templateInterpolate(BotStructureTemplate.importedDialogs.dialogSchema, { DIALOGNAME: '*' }),
  templateInterpolate(BotStructureTemplate.importedDialogs.recognizer, { DIALOGNAME: '*', RECOGNIZERNAME: '*.dialog' }),

  templateInterpolate(BotStructureTemplate.formDialogs, { FORMDIALOGNAME: '*.form' }),
  templateInterpolate(BotStructureTemplate.skillManifests, { MANIFESTFILENAME: '*.json' }),
  templateInterpolate(BotStructureTemplate.botProject, { BOTNAME: '*' }),
  templateInterpolate(BotStructureTemplate.recognizer, { RECOGNIZERNAME: '*.dialog' }),
  templateInterpolate(BotStructureTemplate.crossTrainConfig, { CROSSTRAINCONFIGNAME: 'cross-train.config.json' }),
  '*.schema',
  '*.uischema',
  'language-generation/**/*.lg',
  'language-understanding/**/*.lu',
  'knowledge-base/**/*.qna',
  'dialogs/*/language-generation/**/*.lg',
  'dialogs/*/language-understanding/**/*.lu',
  'dialogs/*/knowledge-base/**/*.qna',
  'dialogs/imported/*/language-generation/**/*.lg',
  'dialogs/imported/*/language-understanding/**/*.lu',
  'dialogs/imported/*/knowledge-base/**/*.qna',
];

// parse file name: [fileId].[locale].[fileType]
export const parseFileName = (name: string, defaultLocale: string) => {
  if (name.endsWith(FileExtensions.SourceQnA)) {
    return parseSourceFileName(name, defaultLocale);
  }
  const fileType = Path.extname(name);
  const id = Path.basename(name, fileType);

  let fileId = id;
  let locale = defaultLocale;
  const index = id.lastIndexOf('.');
  if (index !== -1) {
    fileId = id.slice(0, index);
    locale = id.slice(index + 1);
  }
  const dialogId = fileId;
  return { dialogId, fileId, locale, fileType };
};

export const isRecognizer = (fileName: string) => fileName.endsWith('.lu.dialog') || fileName.endsWith('.qna.dialog');
export const isCrossTrainConfig = (fileName: string) => fileName.endsWith('cross-train.config.json');

export const defaultFilePath = (
  botName: string,
  defaultLocale: string,
  filename: string,
  options: {
    endpoint?: string; // <endpoint>/<file-path>
    rootDialogId?: string;
  }
): string => {
  const BOTNAME = botName.toLowerCase();
  const CommonFileId = 'common';

  const { endpoint = '', rootDialogId = '' } = options;
  const { fileId, locale, fileType, dialogId } = parseFileName(filename, defaultLocale);
  const LOCALE = locale;

  // now recognizer extension is .lu.dialog or .qna.dialog
  if (isRecognizer(filename)) {
    const dialogId = filename.split('.')[0];
    const isRoot = filename.startsWith(botName) || (rootDialogId && filename.startsWith(rootDialogId));
    if (endpoint) {
      return templateInterpolate(Path.join(endpoint, BotStructureTemplate.recognizer), {
        RECOGNIZERNAME: filename,
      });
    } else if (isRoot) {
      return templateInterpolate(BotStructureTemplate.recognizer, {
        RECOGNIZERNAME: filename,
      });
    } else {
      return templateInterpolate(BotStructureTemplate.dialogs.recognizer, {
        RECOGNIZERNAME: filename,
        DIALOGNAME: dialogId,
      });
    }
  }

  //crossTrain config's file name is cross-train.config
  if (isCrossTrainConfig(filename)) {
    return templateInterpolate(BotStructureTemplate.crossTrainConfig, {
      CROSSTRAINCONFIGNAME: filename,
    });
  }

  // 1. Even appsettings.json hit FileExtensions.Manifest, but it never use this do created.
  // 2. When export bot as a skill, name is `EchoBot-4-2-1-preview-1-manifest.json`
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

  const DIALOGNAME = dialogId;
  const isRootFile = BOTNAME === DIALOGNAME.toLowerCase();

  if (fileType === FileExtensions.SourceQnA) {
    if (endpoint) {
      return templateInterpolate(Path.join(endpoint, BotStructureTemplate.sourceQnA), {
        FILENAME: fileId,
        DIALOGNAME,
      });
    }
    const TemplatePath =
      isRootFile || !dialogId ? BotStructureTemplate.sourceQnA : BotStructureTemplate.dialogs.sourceQnA;
    return templateInterpolate(TemplatePath, {
      FILENAME: fileId,
      DIALOGNAME,
    });
  }

  let TemplatePath = '';

  if (endpoint) {
    switch (fileType) {
      case FileExtensions.Dialog:
        TemplatePath = BotStructureTemplate.entry;
        break;
      case FileExtensions.Lg:
        TemplatePath = BotStructureTemplate.lg;
        break;
      case FileExtensions.Lu:
        TemplatePath = BotStructureTemplate.lu;
        break;
      case FileExtensions.Qna:
        TemplatePath = BotStructureTemplate.qna;
        break;
      case FileExtensions.DialogSchema:
        TemplatePath = BotStructureTemplate.dialogSchema;
    }
    return templateInterpolate(Path.join(endpoint, TemplatePath), {
      BOTNAME: fileId,
      DIALOGNAME,
      LOCALE,
    });
  }

  if (fileType === FileExtensions.Dialog) {
    TemplatePath = isRootFile ? BotStructureTemplate.entry : BotStructureTemplate.dialogs.entry;
  } else if (fileType === FileExtensions.Lg) {
    TemplatePath = isRootFile ? BotStructureTemplate.lg : BotStructureTemplate.dialogs.lg;
  }
  if (fileType === FileExtensions.Lu) {
    TemplatePath = isRootFile ? BotStructureTemplate.lu : BotStructureTemplate.dialogs.lu;
  }
  if (fileType === FileExtensions.Qna) {
    TemplatePath = isRootFile ? BotStructureTemplate.qna : BotStructureTemplate.dialogs.qna;
  }
  if (fileType === FileExtensions.DialogSchema) {
    TemplatePath = isRootFile ? BotStructureTemplate.dialogSchema : BotStructureTemplate.dialogs.dialogSchema;
  }

  return templateInterpolate(TemplatePath, {
    BOTNAME,
    DIALOGNAME,
    LOCALE,
  });
};

// when create/saveAs bot, serialize entry dialog/lg/lu
export const serializeFiles = async (fileStorage, rootPath, botName, preserveRoot = false) => {
  const entryPatterns = [
    templateInterpolate(BotStructureTemplate.dialogSchema, { BOTNAME: '*' }),
    templateInterpolate(BotStructureTemplate.botProject, { BOTNAME: '*' }),
  ];

  if (!preserveRoot) {
    entryPatterns.push(templateInterpolate(BotStructureTemplate.entry, { BOTNAME: '*' }));
    entryPatterns.push(templateInterpolate(BotStructureTemplate.lg, { LOCALE: '*', BOTNAME: '*' }));
    entryPatterns.push(templateInterpolate(BotStructureTemplate.lu, { LOCALE: '*', BOTNAME: '*' }));
    entryPatterns.push(templateInterpolate(BotStructureTemplate.qna, { LOCALE: '*', BOTNAME: '*' }));
  }

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
