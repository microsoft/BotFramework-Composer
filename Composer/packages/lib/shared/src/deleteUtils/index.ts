// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { MicrosoftIDialog, SDKKinds } from '@botframework-composer/types';

import { LuMetaData, LuType } from '../luNameBuilder';
import { walkAdaptiveAction } from '../walkerUtils/walkAdaptiveAction';
import { walkAdaptiveActionList } from '../walkerUtils/walkAdaptiveActionList';

// TODO: (ze) considering refactoring it with the `walkLgResources` util
const collectLgTemplates = (action: any, outputTemplates: string[]) => {
  if (typeof action === 'string') return;
  if (!action?.$kind) return;

  switch (action.$kind) {
    case SDKKinds.SendActivity:
    case SDKKinds.BeginSkill:
      outputTemplates.push(action.activity);
      break;
    case SDKKinds.AttachmentInput:
    case SDKKinds.ChoiceInput:
    case SDKKinds.ConfirmInput:
    case SDKKinds.DateTimeInput:
    case SDKKinds.NumberInput:
    case SDKKinds.TextInput:
      outputTemplates.push(action.prompt, action.unrecognizedPrompt, action.invalidPrompt, action.defaultValueResponse);
      break;
  }
};

// TODO: (ze) considering refactoring it by implementing a new `walkLuResources` util
const collectLuIntents = (action: any, outputTemplates: string[]) => {
  if (typeof action === 'string') return;
  if (!action?.$kind) return;

  switch (action.$kind) {
    case SDKKinds.AttachmentInput:
    case SDKKinds.ChoiceInput:
    case SDKKinds.ConfirmInput:
    case SDKKinds.DateTimeInput:
    case SDKKinds.NumberInput:
    case SDKKinds.TextInput: {
      const [, promptType] = action.$kind.split('.');
      const intentName = new LuMetaData(new LuType(action?.$kind).toString(), action?.$designer?.id).toString();
      promptType && intentName && outputTemplates.push(intentName);
      break;
    }
  }
};

export const deleteAdaptiveAction = async (
  data: MicrosoftIDialog,
  deleteLgTemplates: (lgTemplates: string[]) => Promise<void>,
  deleteLuIntents: (luIntents: string[]) => Promise<void>,
) => {
  const lgTemplates: string[] = [];
  const luIntents: string[] = [];

  walkAdaptiveAction(data, (action) => collectLgTemplates(action, lgTemplates));
  walkAdaptiveAction(data, (action) => collectLuIntents(action, luIntents));

  await deleteLgTemplates(lgTemplates.filter((activity) => !!activity));
  await deleteLuIntents(luIntents);
};

export const deleteAdaptiveActionList = async (
  data: MicrosoftIDialog[],
  deleteLgTemplates: (lgTemplates: string[]) => Promise<void>,
  deleteLuIntents: (luIntents: string[]) => Promise<void>,
) => {
  const lgTemplates: string[] = [];
  const luIntents: string[] = [];

  walkAdaptiveActionList(data, (action) => collectLgTemplates(action, lgTemplates));
  walkAdaptiveActionList(data, (action) => collectLuIntents(action, luIntents));

  await deleteLgTemplates(lgTemplates.filter((activity) => !!activity));
  await deleteLuIntents(luIntents);
};
