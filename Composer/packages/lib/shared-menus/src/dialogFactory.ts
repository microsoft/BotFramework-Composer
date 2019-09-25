import nanoid from 'nanoid/generate';

interface DesignerAttributes {
  name?: string;
}

interface OptionalAttributes {
  constraint?: string;
  events?: string[];
}

const initialDialogShape = {
  'Microsoft.OnConversationUpdateActivity': {
    $type: 'Microsoft.OnConversationUpdateActivity',
    constraint: "toLower(turn.Activity.membersAdded[0].name) != 'bot'",
  },
};

export const seedNewDialog = (
  $type: string,
  designerAttributes: DesignerAttributes,
  optionalAttributes?: OptionalAttributes
): object => {
  return {
    $designer: {
      id: nanoid('1234567890', 6),
      ...designerAttributes,
    },
    ...optionalAttributes,
    ...(initialDialogShape[$type] || {}),
  };
};
