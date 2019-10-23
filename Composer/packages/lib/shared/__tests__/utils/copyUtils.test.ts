import { copyAdaptiveAction } from '../../src/utils/copyUtils';

describe('copyAdaptiveAction', () => {
  const externalApi = {
    updateDesigner: data => {
      data.$designer = { id: '5678' };
    },
    copyLgTemplate: (templateToCopy: string, newTemplateName: string) => Promise.resolve(newTemplateName),
  };

  it('should return {} when input is invalid', async () => {
    expect(await copyAdaptiveAction(null, externalApi)).toEqual({});
    expect(await copyAdaptiveAction({}, externalApi)).toEqual({});
    expect(await copyAdaptiveAction({ name: 'hi' }, externalApi)).toEqual({});
  });

  it('can copy BeginDialog', async () => {
    const beginDialog = {
      $type: 'Microsoft.BeginDialog',
      dialog: 'AddToDo',
    };

    expect(await copyAdaptiveAction(beginDialog, externalApi)).toEqual({
      $type: 'Microsoft.BeginDialog',
      $designer: { id: '5678' },
      dialog: 'AddToDo',
    });
  });

  it('can copy SendActivity', async () => {
    const sendActivity = {
      $type: 'Microsoft.SendActivity',
      activity: '[bfdactivity-1234]',
    };

    expect(await copyAdaptiveAction(sendActivity, externalApi)).toEqual({
      $type: 'Microsoft.SendActivity',
      $designer: { id: '5678' },
      activity: '[bfdactivity-5678]',
    });
  });

  it('can copy TextInput', async () => {
    const promptText = {
      $type: 'Microsoft.TextInput',
      $designer: {
        id: '844184',
        name: 'Prompt for text',
      },
      maxTurnCount: 3,
      alwaysPrompt: false,
      allowInterruptions: 'true',
      outputFormat: 'none',
      prompt: '[bfdprompt-1234]',
      invalidPrompt: '[bfdinvalidPrompt-1234]',
    };

    expect(await copyAdaptiveAction(promptText, externalApi)).toEqual({
      $type: 'Microsoft.TextInput',
      $designer: {
        id: '5678',
      },
      maxTurnCount: 3,
      alwaysPrompt: false,
      allowInterruptions: 'true',
      outputFormat: 'none',
      prompt: '[bfdprompt-5678]',
      invalidPrompt: '[bfdinvalidPrompt-5678]',
    });
  });
});
