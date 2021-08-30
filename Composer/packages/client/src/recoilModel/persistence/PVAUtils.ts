// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema } from '@botframework-composer/types';

enum PVAKinds {
  Question = 'Microsoft.VirtualAgents.Question',
}

const questionTypes = {
  text: 'Microsoft.TextInput',
  number: 'Microsoft.NumberInput',
  confirm: 'Microsoft.ConfirmInput', // includes condition always
  choice: 'Microsoft.ChoiceInput', // could include condition
};

const inputConverter = ($kind: string) => (data: any) => {
  if (data?.$designer?.$convertedFrom?.$kind === PVAKinds.Question) {
    return {
      ...data.$designer.$convertedFrom,
    };
  }

  return data;
};

const converters = {
  [PVAKinds.Question]: (data) => {
    // break into input + condition (if necessary)
    // add some linking in $designer field for deserialzation
    const { type, choices, cases, ...rest } = data;

    const newKind = questionTypes[type];
    if (newKind) {
      const additionalSteps: any[] = [];

      if (cases) {
        const { conditionCases, defaultActions } = (cases || []).reduce(
          (all, c) => {
            if (c.isDefault) {
              all.defaultActions = c.actions || [];
            } else {
              all.conditionCases = all.conditionCases || [];
              all.conditionCases.push(c);
            }

            return all;
          },
          { conditionCases: [], defaultActions: [] }
        );

        const switchCondition = {
          $kind: 'Microsoft.SwitchCondition',
          condition: data.property,
          cases: conditionCases,
          default: defaultActions,
          $designer: {
            __virtual: true,
          },
        };
        additionalSteps.push(switchCondition);
      }

      return [
        {
          ...rest,
          $kind: newKind,
          $designer: {
            ...data?.$designer,
            $convertedFrom: data,
          },
          choices,
        },
        ...additionalSteps,
      ];
    }

    return [data];
  },
  'Microsoft.VirtualAgents.ManageVariable': (data) => {
    return data;
  },
  'Microsoft.TextInput': inputConverter('Microsoft.TextInput'),
  'Microsoft.NumberInput': inputConverter('Microsoft.NumberInput'),
  'Microsoft.ConfirmInput': inputConverter('Microsoft.ConfirmInput'),
  'Microsoft.ChoiceInput': inputConverter('Microsoft.ChoiceInput'),
};

function convert(data: any) {
  if (data?.$designer?.__virtual) {
    return null;
  }

  const converter = converters[data?.$kind] || (() => data);

  return converter(data);
}

export function decomposeComposite$Kinds(action: BaseSchema): BaseSchema {
  const data = action;
  // first handle triggers (recursive)
  if (data?.triggers && Array.isArray(data.triggers)) {
    data.triggers = data.triggers.map((trigger) => decomposeComposite$Kinds(trigger)).filter(Boolean);
  }

  if (data?.cases && Array.isArray(data.cases)) {
    data.cases = data.cases.reduce((all, action) => all.concat(decomposeComposite$Kinds(action)), []).filter(Boolean);
  }

  if (data?.$kind === 'Microsoft.SwitchCondition' && data?.default && Array.isArray(data.default)) {
    data.default = data.default
      .reduce((all, action) => all.concat(decomposeComposite$Kinds(action)), [])
      .filter(Boolean);
  }

  if (data?.$kind === 'Microsoft.IfCondition' && data?.elseActions && Array.isArray(data.elseActions)) {
    data.elseActions = data.elseActions
      .reduce((all, action) => all.concat(decomposeComposite$Kinds(action)), [])
      .filter(Boolean);
  }

  if (data?.actions && Array.isArray(data.actions)) {
    data.actions = data.actions
      .reduce((all, action) => all.concat(decomposeComposite$Kinds(action)), [])
      .filter(Boolean);
  }

  return convert(data);
}
