// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getDialogData,
  setDialogData,
  getDialog,
  generateNewDialog,
  updateRegExIntent,
  createSelectedPath,
  deleteTrigger,
  getTriggerTypes,
  getEventTypes,
  getActivityTypes,
  getFriendlyName,
  getBreadcrumbLabel,
  getSelected,
} from '../../src/utils/dialogUtil';

const dialogsMap = {
  Dialog1: {
    steps: [
      {
        $kind: 'Step1',
      },
      {
        $kind: 'Step2',
      },
    ],
  },
  'Dialog2.main': {
    steps: [
      {
        $kind: 'Step3',
      },
      {
        $kind: 'Step4',
      },
    ],
  },
};

const dialogs = [
  {
    content: {
      $kind: 'kind1',
      triggers: ['trigger1', 'trigger2', 'aaa'],
      recognizer: {
        $kind: 'Microsoft.RegexRecognizer',
        intents: [{ intent: 'aaa', pattern: 'aaa' }],
      },
    },
    displayName: 'MainDialog',
    id: 'id1',
  },
  { content: { $kind: 'kind2', triggers: ['trigger1', 'trigger2'] }, displayName: 'dialog1', id: 'id2' },
  {
    content: { $kind: 'kind3', triggers: [], action: { action: { action: undefined, property: true }, property: {} } },
    displayName: 'toBeCleaned',
    id: 'id3',
  },
];

describe('getDialogData', () => {
  it('return empty string if no dialogId', () => {
    const result = getDialogData(dialogsMap, '');
    expect(result).toEqual('');
  });

  it('returns all dialog data if path is a top level property', () => {
    const result = getDialogData(dialogsMap, 'Dialog1');
    expect(result).toEqual(dialogsMap.Dialog1);
  });

  it('returns all dialog data if path is a top level property and has a "."', () => {
    const result = getDialogData(dialogsMap, 'Dialog2.main');
    expect(result).toEqual(dialogsMap['Dialog2.main']);
  });

  it('returns a sub path', () => {
    const result = getDialogData(dialogsMap, 'Dialog1', 'steps[1]');
    expect(result).toEqual(dialogsMap.Dialog1.steps[1]);
  });

  it('returns a sub path when "." is in path', () => {
    const result = getDialogData(dialogsMap, 'Dialog2.main', 'steps[1]');
    expect(result).toEqual(dialogsMap['Dialog2.main'].steps[1]);
  });
});

describe('setDialogData', () => {
  it('returns updated top level dialog data', () => {
    const result = setDialogData(dialogsMap, 'Dialog2.main', '', { new: 'data' });
    expect(result).toEqual({ new: 'data' });
  });

  it('returns updated dialog data at a path', () => {
    const result = setDialogData(dialogsMap, 'Dialog2.main', 'steps[1]', { new: 'data' });
    expect(result).toEqual({ steps: [{ $kind: 'Step3' }, { new: 'data' }] });
  });
});

describe('getDialog', () => {
  it('returns a copy of dialog', () => {
    const dialog = getDialog(dialogs, 'id1');
    expect(dialog === dialogs[0]).toBe(false);
    expect(dialog).toEqual(dialogs[0]);
  });
});

describe('generateNewDialog', () => {
  it('add new luis intent trigger to the given dialog', () => {
    const formData = {
      $kind: 'Microsoft.OnIntent',
      errors: { triggerPhrases: '' },
      event: '',
      intent: 'aaa',
      regEx: '',
      triggerPhrases: '- a',
    };
    const schema = {};
    const length = dialogs[0].content.triggers.length;
    const dialog = generateNewDialog(dialogs, 'id1', formData, schema);
    expect(dialog.content.triggers.length).toBe(length + 1);
  });

  it('add new regEx intent trigger to the given dialog', () => {
    const formData = {
      $kind: 'Microsoft.OnIntent',
      errors: { triggerPhrases: '' },
      event: '',
      intent: 'aaaa',
      regEx: 'aaaa',
      triggerPhrases: '',
    };
    const schema = {};
    const length1 = dialogs[0].content.recognizer.intents.length;
    const length2 = dialogs[0].content.triggers.length;
    const dialog = generateNewDialog(dialogs, 'id1', formData, schema);
    expect(dialog.content.recognizer.intents.length).toBe(length1 + 1);
    expect(dialog.content.triggers.length).toBe(length2 + 1);
  });

  it('add new customer event trigger to the given dialog', () => {
    const formData = {
      $kind: 'Microsoft.OnDialogEvent',
      errors: { triggerPhrases: '' },
      event: 'aaaa',
      triggerPhrases: '',
    };
    const schema = {};
    const length = dialogs[0].content.triggers.length;
    const dialog = generateNewDialog(dialogs, 'id1', formData, schema);
    expect(dialog.content.triggers.length).toBe(length + 1);
  });
});

describe('updateRegExIntent', () => {
  it('update regEx pattern in the given dialog', () => {
    const dialog = updateRegExIntent(dialogs[0], 'aaa', 'bbb');
    expect(dialog.content.recognizer.intents[0].pattern).toBe('bbb');
  });

  it('create regEx in the given dialog if the given regEx does not exist', () => {
    const dialog = updateRegExIntent(dialogs[0], 'ccc', 'ddd');
    expect(dialog.content.recognizer.intents.find((intent) => intent.intent === 'ccc')?.pattern).toBe('ddd');
  });
});

describe('createSelectedPath', () => {
  it('return selected path', () => {
    expect(createSelectedPath(0)).toBe('triggers[0]');
  });
});

describe('deleteTrigger', () => {
  it('delete trigger', () => {
    const length = dialogs[0].content.triggers.length;
    const dialogContent = deleteTrigger(dialogs, 'id1', 2);
    expect(dialogContent.triggers.length).toBe(length - 1);
  });
});

describe('getTriggerTypes', () => {
  it('return trigger types', () => {
    const triggerTypes = getTriggerTypes();
    expect(triggerTypes).toEqual([
      { key: 'Microsoft.OnIntent', text: 'Intent recognized' },
      { key: 'Microsoft.OnQnAMatch', text: 'QnA Intent recognized' },
      { key: 'Microsoft.OnUnknownIntent', text: 'Unknown intent' },
      { key: 'Microsoft.OnDialogEvent', text: 'Dialog events' },
      { key: 'Microsoft.OnActivity', text: 'Activities' },
      { key: 'Microsoft.OnChooseIntent', text: 'Duplicated intents recognized' },
      { key: 'OnCustomEvent', text: 'Custom events' },
    ]);
  });
});

describe('getEventTypes', () => {
  it('return event types', () => {
    const eventTypes = getEventTypes();
    expect(eventTypes).toEqual([
      { key: 'Microsoft.OnBeginDialog', text: 'Dialog started (Begin dialog event)' },
      { key: 'Microsoft.OnCancelDialog', text: 'Dialog cancelled (Cancel dialog event)' },
      { key: 'Microsoft.OnError', text: 'Error occurred (Error event)' },
      { key: 'Microsoft.OnRepromptDialog', text: 'Re-prompt for input (Reprompt dialog event)' },
    ]);
  });
});

describe('getActivityTypes', () => {
  it('return activity types', () => {
    const activityTypes = getActivityTypes();
    expect(activityTypes).toEqual([
      { key: 'Microsoft.OnActivity', text: 'Activities (Activity received)' },
      { key: 'Microsoft.OnConversationUpdateActivity', text: 'Greeting (ConversationUpdate activity)' },
      { key: 'Microsoft.OnEndOfConversationActivity', text: 'Conversation ended (EndOfConversation activity)' },
      { key: 'Microsoft.OnEventActivity', text: 'Event received (Event activity)' },
      { key: 'Microsoft.OnHandoffActivity', text: 'Handover to human (Handoff activity)' },
      { key: 'Microsoft.OnInvokeActivity', text: 'Conversation invoked (Invoke activity)' },
      { key: 'Microsoft.OnTypingActivity', text: 'User is typing (Typing activity)' },
      { key: 'Microsoft.OnMessageActivity', text: 'Message received (Message received activity)' },
      { key: 'Microsoft.OnMessageDeleteActivity', text: 'Message deleted (Message deleted activity)' },
      { key: 'Microsoft.OnMessageReactionActivity', text: 'Message reaction (Message reaction activity)' },
      { key: 'Microsoft.OnMessageUpdateActivity', text: 'Message updated (Message updated activity)' },
    ]);
  });
});

describe('getFriendlyName', () => {
  it('return friendly name', () => {
    const name = getFriendlyName(dialogs[0].content);
    expect(name).toBe('kind1');
  });
});

describe('getBreadcrumbLabel', () => {
  it('return breadcrumb label', () => {
    const name = getBreadcrumbLabel(dialogs, 'id1', null, null);
    expect(name).toBe('MainDialog');
  });
});

describe('getSelected', () => {
  it('return selected path', () => {
    let res = getSelected();
    expect(res).toEqual('');
    res = getSelected('focused=triggers[0].actions[0]');
    expect(res).toEqual('focused=triggers[0]');
  });
});
