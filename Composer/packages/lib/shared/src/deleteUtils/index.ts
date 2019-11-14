// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { MicrosoftIDialog, SDKTypes } from '../types';

import { walkAdaptiveAction } from './walkAdaptiveAction';

export const deleteAdaptiveAction = (data: MicrosoftIDialog, deleteLgTemplates: (lgTemplates: string[]) => any) => {
  const activityTemplates: string[] = [];
  const collectLgTemplates = (action: any) => {
    if (typeof action === 'string') return;
    if (!action || !action.$type) return;

    switch (action.$type) {
      case SDKTypes.SendActivity:
        activityTemplates.push(action.activity);
        break;
      case SDKTypes.AttachmentInput:
      case SDKTypes.ChoiceInput:
      case SDKTypes.ConfirmInput:
      case SDKTypes.DateTimeInput:
      case SDKTypes.NumberInput:
      case SDKTypes.TextInput:
        activityTemplates.push(
          action.prompt,
          action.unrecognizedPrompt,
          action.invalidPrompt,
          action.defaultValueResponse
        );
        break;
    }
  };

  walkAdaptiveAction(data, collectLgTemplates);

  deleteLgTemplates(activityTemplates.filter(activity => !!activity));
};
