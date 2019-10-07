import nanoid from 'nanoid/generate';

import { appschema } from './appschema';

interface DesignerAttributes {
  name: string;
  description: string;
}

export interface DesignerData {
  name?: string;
  description?: string;
  id: string;
}

const initialDialogShape = {
  'Microsoft.AdaptiveDialog': {
    $type: 'Microsoft.AdaptiveDialog',
    events: [
      {
        $type: 'Microsoft.OnBeginDialog',
        $designer: {
          name: 'BeginDialog',
        },
      },
    ],
  },
  'Microsoft.OnConversationUpdateActivity': {
    $type: 'Microsoft.OnConversationUpdateActivity',
    constraint: "toLower(turn.Activity.membersAdded[0].name) != 'bot'",
  },
};

export function getNewDesigner(name: string, description: string) {
  return {
    $designer: {
      name,
      description,
      id: nanoid('1234567890', 6),
    },
  };
}

export const getDesignerId = (data: DesignerData) => {
  const newDesigner: DesignerData = {
    id: nanoid('1234567890', 6),
    ...data,
  };

  return newDesigner;
};

const seedDefaults = (type: string) => {
  const dialogSeed = {};

  if (!appschema.definitions[type]) return dialogSeed;
  const { properties } = appschema.definitions[type];

  for (const field in properties) {
    if (properties[field].type === 'object') {
      // todo: recurse on properties
      // const { properties } = properties[field];
      // for (const field in properties) {
      // }
    } else if (properties[field].const !== null && properties[field].const !== undefined) {
      dialogSeed[field] = properties[field].const;
    } else if (properties[field].default !== null && properties[field].default !== undefined) {
      dialogSeed[field] = properties[field].default;
    }
  }
  return dialogSeed;
};

export const seedNewDialog = (
  $type: string,
  designerAttributes: Partial<DesignerAttributes> = {},
  optionalAttributes: object = {}
): object => {
  return {
    $type,
    $designer: {
      id: nanoid('1234567890', 6),
      ...designerAttributes,
    },
    ...(initialDialogShape[$type] || {}),
    ...optionalAttributes,
    ...seedDefaults($type),
  };
};
