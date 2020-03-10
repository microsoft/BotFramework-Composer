// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { MicrosoftIDialog, SDKTypes } from '../types';

import { walkAdaptiveAction } from './walkAdaptiveAction';
import { walkAdaptiveActionList } from './walkAdaptiveActionList';

const collectLgTemplates = (action: any, outputTemplates: string[]) => {
  if (typeof action === 'string') return;
  if (!action || !action.$type) return;

  switch (action.$type) {
    case SDKTypes.SendActivity:
      outputTemplates.push(action.activity);
      break;
    case SDKTypes.AttachmentInput:
    case SDKTypes.ChoiceInput:
    case SDKTypes.ConfirmInput:
    case SDKTypes.DateTimeInput:
    case SDKTypes.NumberInput:
    case SDKTypes.TextInput:
      outputTemplates.push(action.prompt, action.unrecognizedPrompt, action.invalidPrompt, action.defaultValueResponse);
      break;
  }
};

const collectLuIntents = (action: any, outputTemplates: string[]) => {
  if (typeof action === 'string') return;
  if (!action || !action.$type) return;

  switch (action.$type) {
    case SDKTypes.AttachmentInput:
    case SDKTypes.ChoiceInput:
    case SDKTypes.ConfirmInput:
    case SDKTypes.DateTimeInput:
    case SDKTypes.NumberInput:
    case SDKTypes.TextInput: {
      const [, promptType] = action.$type.split('.');
      const intentName = `${promptType}.response-${action?.$designer?.id}`;
      promptType && intentName && outputTemplates.push(intentName);
      break;
    }
  }
};

export const deleteAdaptiveAction = (
  data: MicrosoftIDialog,
  deleteLgTemplates: (lgTemplates: string[]) => any,
  deleteLuIntents: (luIntents: string[]) => any
) => {
  const lgTemplates: string[] = [];
  const luIntents: string[] = [];

  walkAdaptiveAction(data, action => collectLgTemplates(action, lgTemplates));
  walkAdaptiveAction(data, action => collectLuIntents(action, luIntents));

  deleteLgTemplates(lgTemplates.filter(activity => !!activity));
  deleteLuIntents(luIntents);
};

export const deleteAdaptiveActionList = (
  data: MicrosoftIDialog[],
  deleteLgTemplates: (lgTemplates: string[]) => any,
  deleteLuIntents: (luIntents: string[]) => any
) => {
  const lgTemplates: string[] = [];
  const luIntents: string[] = [];

  walkAdaptiveActionList(data, action => collectLgTemplates(action, lgTemplates));
  walkAdaptiveAction(data, action => collectLuIntents(action, luIntents));

  deleteLgTemplates(lgTemplates.filter(activity => !!activity));
  deleteLuIntents(luIntents);
};
