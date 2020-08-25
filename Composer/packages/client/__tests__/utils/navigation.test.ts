// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PromptTab } from '@bfc/shared';

import {
  BreadcrumbUpdateType,
  getUrlSearch,
  checkUrl,
  getFocusPath,
  clearBreadcrumb,
  updateBreadcrumb,
  convertPathToUrl,
} from './../../src/utils/navigation';

const projectId = '123a-sdf123';

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

describe('Breadcrumb Util', () => {
  it('return focus path', () => {
    const breadcrumb = [
      { dialogId: `1`, selected: `1`, focused: `1` },
      { dialogId: `2`, selected: `2`, focused: `2` },
      { dialogId: `3`, selected: `3`, focused: `3` },
    ];
    const result1 = clearBreadcrumb(breadcrumb);
    expect(result1).toEqual([]);
    const result2 = clearBreadcrumb(breadcrumb, 0);
    expect(result2).toEqual([]);
    const result3 = clearBreadcrumb(breadcrumb, 1);
    expect(result3.length).toEqual(1);
    expect(result3[0].dialogId).toEqual('1');
    const result4 = clearBreadcrumb(breadcrumb, 4);
    expect(result4.length).toEqual(3);
  });

  it('update breadcrumb', () => {
    const result1 = updateBreadcrumb([], BreadcrumbUpdateType.Selected);
    expect(result1).toEqual([]);
    let breadcrumb = [
      { dialogId: `1`, selected: `1`, focused: `1` },
      { dialogId: `2`, selected: `2`, focused: `2` },
      { dialogId: `3`, selected: `3`, focused: `3` },
    ];
    const result2 = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
    expect(result2.length).toEqual(1);
    expect(result2[0].dialogId).toEqual('1');
    breadcrumb = [
      { dialogId: `1`, selected: `1`, focused: `` },
      { dialogId: `2`, selected: `2`, focused: `` },
      { dialogId: `3`, selected: `3`, focused: `3` },
    ];
    const result3 = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Focused);
    expect(result3.length).toEqual(2);
    expect(result3[1].dialogId).toEqual('2');
  });
});

describe('composer url util', () => {
  it('create url', () => {
    const result1 = getUrlSearch('triggers[0]', 'triggers[0].actions[0]');
    expect(result1).toEqual('?selected=triggers[0]&focused=triggers[0].actions[0]');
  });

  it('check url', () => {
    const result1 = checkUrl(
      `/bot/1/dialogs/a?selected=triggers[0]&focused=triggers[0].actions[0]#botAsks`,
      projectId,
      {
        dialogId: 'a',
        selected: 'triggers[0]',
        focused: 'triggers[0].actions[0]',
        promptTab: PromptTab.BOT_ASKS,
      }
    );
    expect(result1).toEqual(true);
    const result2 = checkUrl(`test`, projectId, {
      dialogId: 'a',
      selected: 'triggers[0]',
      focused: 'triggers[0].actions[0]',
      promptTab: PromptTab.BOT_ASKS,
    });
    expect(result2).toEqual(false);
  });

  it('convert path to url', () => {
    const result1 = convertPathToUrl('1', 'main');
    expect(result1).toEqual('/bot/1/dialogs/main');
    const result2 = convertPathToUrl('1', 'main', 'main.triggers[0].actions[0]');
    expect(result2).toEqual('/bot/1/dialogs/main?selected=triggers[0]&focused=triggers[0].actions[0]');
    const result3 = convertPathToUrl('1', 'main', 'main.triggers[0].actions[0]#Microsoft.TextInput#prompt');
    expect(result3).toEqual('/bot/1/dialogs/main?selected=triggers[0]&focused=triggers[0].actions[0]#botAsks');
  });
});
