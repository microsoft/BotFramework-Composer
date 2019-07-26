const initialDialogShape = {
  'Microsoft.ConversationUpdateActivityRule': {
    $type: 'Microsoft.ConversationUpdateActivityRule',
    constraint: "toLower(turn.Activity.membersAdded[0].name) != 'bot'",
  },
};

export const seedNewDialog = ($type: string): object => {
  return initialDialogShape[$type] ? initialDialogShape[$type] : {};
};
