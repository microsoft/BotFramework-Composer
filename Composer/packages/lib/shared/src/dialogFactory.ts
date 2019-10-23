import nanoid from 'nanoid/generate';

import { appschema } from './appschema';
import { copyAdaptiveAction } from './copyUtils';

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
  'Microsoft.AttachmentInput': {
    allowInterruptions: 'false',
  },
  'Microsoft.ChoiceInput': {
    allowInterruptions: 'false',
  },
  'Microsoft.ConfirmInput': {
    allowInterruptions: 'false',
  },
  'Microsoft.DateTimeInput': {
    allowInterruptions: 'false',
  },
  'Microsoft.NumberInput': {
    allowInterruptions: 'false',
  },
  'Microsoft.TextInput': {
    allowInterruptions: 'false',
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
    ...data,
    id: nanoid('1234567890', 6),
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

const updateDesigner = data => {
  const $designer = data.$designer ? getDesignerId(data.$designer) : getNewDesigner('', '');
  data.$designer = $designer;
};

// TODO: lgApi should also be included in shared lib instead of pass it in
//       since it's already used by Shell, Visual and Form.
export const deepCopyAction = async (data, lgApi) => {
  return await copyAdaptiveAction(data, { lgApi, updateDesigner });
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
