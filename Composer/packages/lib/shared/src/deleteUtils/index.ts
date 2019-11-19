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

export const deleteAdaptiveAction = (data: MicrosoftIDialog, deleteLgTemplates: (lgTemplates: string[]) => any) => {
  const lgTemplates: string[] = [];
  walkAdaptiveAction(data, action => collectLgTemplates(action, lgTemplates));

  deleteLgTemplates(lgTemplates.filter(activity => !!activity));
};

export const deleteAdaptiveActionList = (
  data: MicrosoftIDialog[],
  deleteLgTemplates: (lgTemplates: string[]) => any
) => {
  const lgTemplates: string[] = [];
  walkAdaptiveActionList(data, action => collectLgTemplates(action, lgTemplates));

  deleteLgTemplates(lgTemplates.filter(activity => !!activity));
};
