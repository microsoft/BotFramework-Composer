// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PromptTab } from '@bfc/shared';

import { getUrlSearch, checkUrl, getFocusPath, convertPathToUrl } from '../navigation';

const projectId = '123a-sdf123';
const skillId = '98765.4321';

describe('getFocusPath', () => {
  it('return focus path', () => {
    const result1 = getFocusPath('selected', 'focused');
    expect(result1).toEqual('focused');
    const result2 = getFocusPath('selected', '');
    expect(result2).toEqual('selected');
    const result3 = getFocusPath('', '');
    expect(result3).toEqual('');
  });
});

describe('composer url util', () => {
  it('create url', () => {
    const result1 = getUrlSearch('triggers[0]', 'triggers[0].actions[0]');
    expect(result1).toEqual('?selected=triggers[0]&focused=triggers[0].actions[0]');
  });

  it('checks a URL without a skill', () => {
    const result1 = checkUrl(
      `/bot/${projectId}/dialogs/a?selected=triggers[0]&focused=triggers[0].actions[0]#botAsks`,
      projectId,
      null,
      {
        dialogId: 'a',
        selected: 'triggers[0]',
        focused: 'triggers[0].actions[0]',
        promptTab: PromptTab.BOT_ASKS,
      }
    );
    expect(result1).toEqual(true);
    const result2 = checkUrl(`test`, projectId, skillId, {
      dialogId: 'a',
      selected: 'triggers[0]',
      focused: 'triggers[0].actions[0]',
      promptTab: PromptTab.BOT_ASKS,
    });
    expect(result2).toEqual(false);
  });

  it('checks a URL with a skill', () => {
    const result1 = checkUrl(
      `/bot/${projectId}/skill/${skillId}/dialogs/a?selected=triggers[0]&focused=triggers[0].actions[0]#botAsks`,
      projectId,
      skillId,
      {
        dialogId: 'a',
        selected: 'triggers[0]',
        focused: 'triggers[0].actions[0]',
        promptTab: PromptTab.BOT_ASKS,
      }
    );
    expect(result1).toEqual(true);
    const result2 = checkUrl(`test`, projectId, skillId, {
      dialogId: 'a',
      selected: 'triggers[0]',
      focused: 'triggers[0].actions[0]',
      promptTab: PromptTab.BOT_ASKS,
    });
    expect(result2).toEqual(false);
  });

  it('convert path to url', () => {
    const result1 = convertPathToUrl(projectId, skillId, 'main');
    expect(result1).toEqual(`/bot/${projectId}/skill/${skillId}/dialogs/main`);
    const result2 = convertPathToUrl(projectId, skillId, 'main', 'main.triggers[0].actions[0]');
    expect(result2).toEqual(
      `/bot/${projectId}/skill/${skillId}/dialogs/main?selected=triggers[0]&focused=triggers[0].actions[0]`
    );
    const result3 = convertPathToUrl(
      projectId,
      skillId,
      'main',
      'main.triggers[0].actions[0]#Microsoft.TextInput#prompt'
    );
    expect(result3).toEqual(
      `/bot/${projectId}/skill/${skillId}/dialogs/main?selected=triggers[0]&focused=triggers[0].actions[0]#botAsks`
    );
    const result4 = convertPathToUrl(projectId, null, 'main');
    expect(result4).toEqual(`/bot/${projectId}/dialogs/main`);
  });
});
