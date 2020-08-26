// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { DialogInfo, DialogSchemaFile, ITrigger, SDKKinds, SkillManifest, LuFile } from '@bfc/shared';
import { JSONSchema7 } from '@bfc/extension';

import { Activities, Activity, activityHandlerMap, ActivityTypes, DispatchModels } from './constants';

const getActivityType = (kind: SDKKinds): ActivityTypes | undefined => activityHandlerMap[kind];

export const isSupportedTrigger = ({ type }: ITrigger) => Object.keys(activityHandlerMap).includes(type as SDKKinds);

export const generateSkillManifest = (
  schema: JSONSchema7,
  skillManifest: Partial<SkillManifest>,
  dialogs: DialogInfo[],
  dialogSchemas: DialogSchemaFile[],
  luFiles: LuFile[],
  selectedTriggers: ITrigger[],
  selectedDialogs: Partial<DialogInfo>[]
) => {
  const {
    activities: previousActivities,
    dispatchModels: previousDispatchModels,
    definitions: previousDefinitions,
    ...rest
  } = skillManifest.content;
  const rootDialog = dialogs.find((dialog) => dialog?.isRoot);

  if (!rootDialog) {
    return skillManifest;
  }

  const resolvedDialogs = dialogs.filter(({ id }) => selectedDialogs.find(({ id: dialogId }) => id === dialogId));

  const { content } = rootDialog;
  const triggers = selectedTriggers.reduce((acc: ITrigger[], { id: path }) => {
    const trigger = get(content, path);
    return trigger ? [...acc, trigger] : acc;
  }, []);

  const activities = generateActivities(dialogSchemas, triggers, resolvedDialogs);
  const dispatchModels = generateDispatchModels(schema, dialogs, triggers, luFiles);
  const definitions = getDefinitions(dialogSchemas, resolvedDialogs);

  return {
    ...skillManifest,
    content: {
      ...rest,
      ...activities,
      ...dispatchModels,
      ...definitions,
    },
  };
};

export const generateActivities = (
  dialogSchemas: DialogSchemaFile[],
  triggers: ITrigger[],
  dialogs: DialogInfo[]
): { activities?: { [name: string]: Activity } } => {
  const dialogActivities = dialogs.reduce((acc: any, dialog) => {
    const activity = generateActivity(dialogSchemas, dialog);
    return { ...acc, ...activity };
  }, {});

  const activities = triggers.reduce((acc: any, { $kind }: any) => {
    const activity = generateOtherActivities($kind);

    return { ...acc, ...activity };
  }, dialogActivities);

  return { ...(Object.keys(activities).length ? { activities } : {}) };
};

export const generateActivity = (dialogSchemas: DialogSchemaFile[], dialog: DialogInfo): Activities => {
  const {
    id: name,
    content: { $designer },
  } = dialog;

  const { content = {} } = dialogSchemas.find(({ id }) => id === name) || {};
  const { properties, $result: resultValue, type } = content;
  const { description } = $designer || {};

  return {
    [name]: {
      type: ActivityTypes.Event,
      name,
      ...(description ? { description } : {}),
      ...(Object.keys(properties || {}).length ? { value: { properties, type } } : {}),
      ...(Object.keys(resultValue?.properties || {}).length ? { resultValue } : {}),
    },
  };
};

export const generateOtherActivities = (kind: SDKKinds): Activities => {
  const type = getActivityType(kind);
  return type ? { [type]: { type } } : {};
};

export const generateDispatchModels = (
  schema: JSONSchema7,
  dialogs: DialogInfo[],
  selectedTriggers: any[],
  luFiles: LuFile[]
): { dispatchModels?: DispatchModels } => {
  const intents = selectedTriggers.filter(({ $kind }) => $kind === SDKKinds.OnIntent).map(({ intent }) => intent);
  const { id: rootId } = dialogs.find((dialog) => dialog?.isRoot) || {};

  const rootLuFiles = luFiles.filter(({ id: luFileId }) => {
    const [luId] = luFileId.split('.');
    return luId === rootId;
  });

  if (!intents.length || !schema.properties?.dispatchModels) {
    return {};
  }

  const languages = rootLuFiles.reduce((acc, { id }) => {
    const [name, locale] = id.split('.');
    const { content = {} } = dialogs.find(({ id }) => id === name) || {};
    const { recognizer = '' } = content;

    if (!''.endsWith.call(recognizer, '.lu')) {
      return acc;
    }

    return {
      ...acc,
      [locale]: [
        ...(acc[locale] ?? []),
        {
          name,
          contentType: 'application/lu',
          url: `<${id} url>`,
          description: '<description>',
        },
      ],
    };
  }, {});

  return {
    dispatchModels: {
      ...(Object.keys(languages).length ? { languages } : {}),
      ...(intents.length ? { intents } : {}),
    },
  };
};

export const getDefinitions = (
  dialogSchema: DialogSchemaFile[],
  selectedDialogs: DialogInfo[]
): { definitions?: { [key: string]: any } } => {
  const definitions = dialogSchema.reduce((acc, { content = {}, id }) => {
    if (selectedDialogs.some(({ id: dialogId }) => dialogId === id)) {
      const { definitions = {} } = content;
      return { ...acc, ...definitions };
    }

    return acc;
  }, {});

  return {
    ...(Object.keys(definitions).length ? { definitions } : {}),
  };
};
