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

const converters = {
  [PVAKinds.Question]: (data) => {
    // break into input + condition (if necessary)
    // add some linking in $designer field for deserialzation
    const { type, choices, ...rest } = data;

    const newKind = questionTypes[type];
    if (newKind) {
      return [
        {
          ...rest,
          $kind: newKind,
          $designer: {
            ...data?.$designer,
            $convertedFrom: data?.$kind,
          },
        },
      ];
    }

    return [data];
  },
  'Microsoft.VirtualAgents.ManageVariable': (data) => {
    return data;
  },
  'Microsoft.TextInput': (data) => {
    if (data?.$designer?.$convertedFrom === PVAKinds.Question) {
      return {
        ...data,
        $kind: PVAKinds.Question,
        type: 'text',
      };
    }

    return data;
  },
  'Microsoft.NumberInput': (data) => {
    if (data?.$designer?.$convertedFrom === PVAKinds.Question) {
      return {
        ...data,
        $kind: PVAKinds.Question,
        type: 'number',
      };
    }

    return data;
  },
  'Microsoft.ConfirmInput': (data) => {
    if (data?.$designer?.$convertedFrom === PVAKinds.Question) {
      return {
        ...data,
        $kind: PVAKinds.Question,
        type: 'confirm',
      };
    }

    return data;
  },
  'Microsoft.ChoiceInput': (data) => {
    if (data?.$designer?.$convertedFrom === PVAKinds.Question) {
      return {
        ...data,
        $kind: PVAKinds.Question,
        type: 'choice',
      };
    }

    return data;
  },
};

function convert(data: any) {
  const converter = converters[data?.$kind] || (() => data);

  return converter(data);
}

export function decomposeComposite$Kinds(content: BaseSchema): BaseSchema {
  const data = content;
  // first handle triggers (recursive)
  if (data?.triggers && Array.isArray(data.triggers)) {
    data.triggers = data.triggers.map((trigger) => decomposeComposite$Kinds(trigger));
  }

  //then check for cases (recursive)
  if (data?.cases && Array.isArray(data.cases)) {
    data.cases = data.cases.reduce((all, action) => all.concat(decomposeComposite$Kinds(action)), []);
  }

  // then check for actions
  if (data?.actions && Array.isArray(data.actions)) {
    data.actions = data.actions.reduce((all, action) => all.concat(decomposeComposite$Kinds(action)), []);
  }

  // then check for elseActions
  if (data?.elseActions && Array.isArray(data.elseActions)) {
    data.elseActions = data.elseActions.reduce((all, action) => all.concat(decomposeComposite$Kinds(action)), []);
  }

  return convert(data);
}
