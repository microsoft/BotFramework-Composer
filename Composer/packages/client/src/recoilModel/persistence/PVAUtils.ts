// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const recursive$Kinds = {
  'Microsoft.IfCondition': ['actions', 'elseActions'],
  'Microsoft.SwitchCondition': [],
};

const questionTypes = {
  text: 'Microsoft.TextInput',
  number: 'Microsoft.NumberInput',
  confirm: 'Microsoft.ConfirmInput', // includes condition always
  choice: 'Microsoft.ChoiceInput', // could include condition
};

const converters = {
  'Microsoft.VirtualAgents.Question': (data) => {
    // break into input + condition (if necessary)
    // add some linking in $designer field for deserialzation

    const newKind = questionTypes[data?.type];
    return [
      {
        $kind: newKind,
        $designer: {
          ...data?.$designer,
          $convertedFrom: data?.$kind,
        },
        ...data,
      },
    ];
  },
  'Microsoft.VirtualAgents.ManageVariable': (data) => {
    return data;
  },
};

function decompose(data: any) {
  const converter = converters[data?.$kind];

  if (converter) {
    return converter(data);
  }
}

export function decomposeComposite$Kinds(name: string, content: string) {
  if (name.endsWith('.dialog')) {
    const data = JSON.parse(content);
    if (data?.triggers && Array.isArray(data.triggers)) {
      data.triggers = data.triggers.map((trigger) => {
        if (trigger?.actions && Array.isArray(trigger.actions)) {
          // walk through actions
          // find special kinds (Microsoft.PowerVirtualAgents.Question)
          // decompose
          // recurse on some types
          trigger.actions = trigger.actions.map((a) => decompose(a));
        }
      });
    }

    return JSON.stringify(data, 2, null);
  }

  return content;
}
