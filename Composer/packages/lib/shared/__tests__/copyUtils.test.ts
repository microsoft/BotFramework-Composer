import { copyAdaptiveAction } from '../src/copyUtils';

describe('copyAdaptiveAction', () => {
  const lgTemplate = [{ Name: 'bfdactivity-1234', Body: '-hello' }];
  const externalApi = {
    updateDesigner: data => {
      data.$designer = { id: '5678' };
    },
    lgApi: {
      getLgTemplates: (fileId, activityId) => {
        return Promise.resolve(lgTemplate);
      },
      updateLgTemplate: (filedId, activityId, activityBody) => {
        return Promise.resolve(true);
      },
    },
  };
  const externalApiWithFailure = {
    ...externalApi,
    lgApi: {
      ...externalApi.lgApi,
      updateLgTemplate: () => Promise.reject(),
    },
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

    expect(await copyAdaptiveAction(sendActivity, externalApiWithFailure)).toEqual({
      $type: 'Microsoft.SendActivity',
      $designer: { id: '5678' },
      activity: '-hello',
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
      prompt: '[bfdactivity-1234]',
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
      prompt: '[bfdactivity-5678]',
    });

    expect(await copyAdaptiveAction(promptText, externalApiWithFailure)).toEqual({
      $type: 'Microsoft.TextInput',
      $designer: {
        id: '5678',
      },
      maxTurnCount: 3,
      alwaysPrompt: false,
      allowInterruptions: 'true',
      outputFormat: 'none',
      prompt: '-hello',
    });
  });
});
