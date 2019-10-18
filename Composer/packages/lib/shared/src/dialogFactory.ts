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
    condition: "toLower(turn.Activity.membersAdded[0].name) != 'bot'",
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

export const getDesignerId = (data?: DesignerData) => {
  const newDesigner: DesignerData = {
    id: nanoid('1234567890', 6),
    ...data,
  };

  return newDesigner;
};

const assignDefaults = (data: {}, currentSeed = {}) => {
  for (const field in data) {
    if (field !== '$designer' && data[field].type === 'object') {
      // recurse on subtree's properties
      currentSeed[field] = assignDefaults(data[field].properties);
    }
    if (data[field].const !== null && data[field].const !== undefined) {
      currentSeed[field] = data[field].const;
    }
    if (data[field].default !== null && data[field].default !== undefined) {
      currentSeed[field] = data[field].default;
    }
  }
  return Object.keys(currentSeed).length > 0 ? currentSeed : undefined;
};

export const seedDefaults = (type: string) => {
  if (!appschema.definitions[type]) return {};
  const { properties } = appschema.definitions[type];
  return assignDefaults(properties);
};

const DEEP_COPY_TYPES = ['Microsoft.SendActivity'];
export const needsDeepCopy = $type => {
  return DEEP_COPY_TYPES.includes($type);
};

export const deepCopy: any = (_data, _lgApi) => {
  // data.type is a SendActivity
  // data.id is bound to copied SendActivity
  // new id getDesignerId()
  // data.activity references an LG template
  // make new LG template based off of naming schema
  // assign to data.activity
  return undefined;
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
