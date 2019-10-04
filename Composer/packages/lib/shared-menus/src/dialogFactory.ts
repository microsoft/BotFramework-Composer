import nanoid from 'nanoid/generate';

import { appschema } from './appschema';

interface DesignerAttributes {
  name: string;
  description: string;
}

const initialDialogShape = {
  'Microsoft.OnConversationUpdateActivity': {
    $type: 'Microsoft.OnConversationUpdateActivity',
    constraint: "toLower(turn.Activity.membersAdded[0].name) != 'bot'",
  },
};

const seedDefaults = (type: string) => {
  const obj = {};
  for (const field in appschema.definitions[type].properties) {
    if (appschema.definitions[type].properties[field].default) {
      console.log('SETTING DEFAULT');
      obj[field] = appschema.definitions[type].properties[field].default;
    }
  }
  return obj;
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
    ...seedDefaults($type),
    ...(initialDialogShape[$type] || {}),
    ...optionalAttributes,
  };
};
