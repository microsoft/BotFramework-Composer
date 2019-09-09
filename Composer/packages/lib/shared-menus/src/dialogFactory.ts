const initialDialogShape = {
  'Microsoft.OnConversationUpdateActivity': {
    $type: 'Microsoft.OnConversationUpdateActivity',
    constraint: "toLower(turn.Activity.membersAdded[0].name) != 'bot'",
  },
};

export const seedNewDialog = ($type: string): object => {
  return initialDialogShape[$type] ? initialDialogShape[$type] : {};
};
