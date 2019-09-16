import nanoid from 'nanoid/generate';

const initialDialogShape = {
  'Microsoft.OnConversationUpdateActivity': {
    $type: 'Microsoft.OnConversationUpdateActivity',
    constraint: "toLower(turn.Activity.membersAdded[0].name) != 'bot'",
  },
};

export const seedNewDialog = ($type: string, name?: string, description?: string): object => {
  const shape = initialDialogShape[$type] ? initialDialogShape[$type] : {};
  const res = {
    $type: $type,
    $designer: {
      id: nanoid('1234567890', 6),
    },
    ...shape,
  };
  if (name) {
    res.$designer.name = name;
  }
  if (description) {
    res.$designer.description = description;
  }
  return res;
};
