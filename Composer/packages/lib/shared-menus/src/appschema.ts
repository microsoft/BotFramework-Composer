import { IContextualMenuItem, IContextualMenuProps } from 'office-ui-fabric-react';

import { ConceptLabels } from './labelMap';

export enum DialogGroup {
  RESPONSE = 'RESPONSE',
  INPUT = 'INPUT',
  BRANCHING = 'BRANCHING',
  MEMORY = 'MEMORY',
  STEP = 'STEP',
  CODE = 'CODE',
  LOG = 'LOG',
  EVENTS = 'EVENTS',
  RECOGNIZER = 'RECOGNIZER',
  SELECTOR = 'SELECTOR',
  OTHER = 'OTHER',
}

export interface DialogGroupItem {
  label: string;
  types: string[];
}
export type DialogGroupsMap = { [key in DialogGroup]: DialogGroupItem };

export const dialogGroups: DialogGroupsMap = {
  [DialogGroup.RESPONSE]: {
    label: 'Send Messages',
    types: ['Microsoft.SendActivity', 'Microsoft.BeginDialog'],
  },
  [DialogGroup.INPUT]: {
    label: 'Ask a Question',
    types: [
      'Microsoft.TextInput',
      'Microsoft.NumberInput',
      'Microsoft.IntegerInput',
      'Microsoft.FloatInput',
      'Microsoft.ConfirmInput',
      'Microsoft.ChoiceInput',
      'Microsoft.OAuthInput',
      'Microsoft.AttachmentInput',
    ],
  },
  [DialogGroup.BRANCHING]: {
    label: 'Decisions',
    types: ['Microsoft.IfCondition', 'Microsoft.SwitchCondition'],
  },
  [DialogGroup.MEMORY]: {
    label: 'Memory manipulation',
    types: ['Microsoft.SetProperty', 'Microsoft.InitProperty', 'Microsoft.DeleteProperty', 'Microsoft.EditArray'],
  },
  [DialogGroup.STEP]: {
    label: 'Flow',
    types: [
      'Microsoft.IfCondition',
      'Microsoft.SwitchCondition',
      'Microsoft.Foreach',
      'Microsoft.ForeachPage',
      'Microsoft.BeginDialog',
      'Microsoft.EditSteps',
      'Microsoft.EndDialog',
      'Microsoft.CancelAllDialogs',
      'Microsoft.EndTurn',
      'Microsoft.RepeatDialog',
      'Microsoft.ReplaceDialog',
      'Microsoft.EmitEvent',
    ],
  },
  [DialogGroup.CODE]: {
    label: 'Roll your own code',
    types: ['Microsoft.HttpRequest', 'Microsoft.CodeStep', 'Microsoft.OAuthInput'],
  },
  [DialogGroup.LOG]: {
    label: 'Debugging',
    types: [/* 'Microsoft.DebugBreak', */ 'Microsoft.LogStep', 'Microsoft.TraceActivity'],
  },
  [DialogGroup.EVENTS]: {
    label: 'Events',
    types: ['Microsoft.EventRule', 'Microsoft.IntentRule', 'Microsoft.UnknownIntentRule'],
  },
  [DialogGroup.RECOGNIZER]: {
    label: 'Recognizers',
    types: ['Microsoft.LuisRecognizer', /* 'Microsoft.MultiLanguageRecognizers', */ 'Microsoft.RegexRecognizer'],
  },
  [DialogGroup.SELECTOR]: {
    label: 'Selectors',
    types: [
      'Microsoft.ConditionalSelector',
      'Microsoft.FirstSelector',
      'Microsoft.MostSpecificSelector',
      'Microsoft.RandomSelector',
      'Microsoft.TrueSelector',
    ],
  },
  [DialogGroup.OTHER]: {
    label: 'Other',
    types: ['Microsoft.AdaptiveDialog', 'Microsoft.LanguagePolicy', 'Microsoft.QnAMakerDialog'],
  },
};

export const createStepMenu = (
  stepLabels,
  subMenu: boolean = true,
  handleType: (e: any, item: IContextualMenuItem) => void
): IContextualMenuItem[] => {
  if (subMenu) {
    const stepMenuItems = stepLabels.map(x => {
      const item = dialogGroups[x];
      const subMenu: IContextualMenuProps = {
        items: item.types.map($type => ({
          key: $type,
          name: ConceptLabels[$type] ? ConceptLabels[$type] : $type,
          $type: $type,
          data: {
            $type: $type, // used by the steps field to create the item
          },
        })),
        onItemClick: (e, item: IContextualMenuItem | undefined) => {
          if (item) {
            return handleType(e, item);
          }
        },
      };

      const menuItem: IContextualMenuItem = {
        key: item.label,
        text: item.label,
        name: item.label,
        subMenuProps: subMenu,
      };
      return menuItem;
    });

    return stepMenuItems;
  } else {
    const stepMenuItems = dialogGroups[stepLabels[0]].types.map(item => {
      const menuItem: IContextualMenuItem = {
        key: item,
        text: ConceptLabels[item],
        name: ConceptLabels[item],
        $type: item,
        data: {
          $type: item,
        },
        onClick: (e, item: IContextualMenuItem | undefined) => {
          if (item) {
            return handleType(e, item);
          }
        },
      };
      return menuItem;
    });
    return stepMenuItems;
  }
};

export function getDialogGroupByType(type) {
  let dialogType = DialogGroup.OTHER;

  Object.keys(dialogGroups).forEach(key => {
    if (dialogGroups[key].types.indexOf(type) > -1) {
      switch (key) {
        case DialogGroup.INPUT:
        case DialogGroup.RESPONSE:
        case DialogGroup.BRANCHING:
        case DialogGroup.EVENTS:
          dialogType = key;
          break;
        case DialogGroup.STEP:
          if (type.indexOf('Condition') > -1) {
            dialogType = key;
          }
          break;
        default:
          dialogType = DialogGroup.OTHER;
          break;
      }
    }
  });

  return dialogType;
}
