// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import { DialogGroup } from '@bfc/shared';

import { EdgeMenu } from '../../../src/adaptive-flow-editor/renderers/EdgeMenu';
import { createActionMenu } from '../../../src/adaptive-flow-editor/renderers/EdgeMenu/createSchemaMenu';

describe('<EdgeMenu>', () => {
  it('can render.', () => {
    const menu = render(<EdgeMenu id="test" onClick={() => undefined} />);
    expect(menu).toBeTruthy();
  });
});

describe('createActionMenu()', () => {
  it('options.enablePaste should control Paste button state.', () => {
    const menuItems1 = createActionMenu(() => null, { isSelfHosted: false, enablePaste: true });
    expect(menuItems1.findIndex((x) => x.key === 'Paste')).toEqual(0);
    expect(menuItems1[0].disabled).toBeFalsy();

    const menuItems2 = createActionMenu(() => null, { isSelfHosted: false, enablePaste: false });
    expect(menuItems2[0].disabled).toBeTruthy();
  });

  it('should return builtin $kinds.', () => {
    const menuItemsHosted = createActionMenu(() => null, { isSelfHosted: true, enablePaste: true });
    expect(menuItemsHosted.findIndex((x) => x.key === DialogGroup.RESPONSE)).toBeTruthy();
  });

  it('should show custom actions as last item.', () => {
    const menuItemsWithoutCustomActions = createActionMenu(
      () => null,
      { isSelfHosted: false, enablePaste: false },
      {},
      []
    );
    expect(menuItemsWithoutCustomActions.findIndex((x) => x.key === 'Custom Actions')).toEqual(-1);

    const customActions = [
      [{ title: 'Custom1', description: 'Custom1', $ref: 'Group1.Custom1' }],
      [{ title: 'Custom2', description: 'Custom2', $ref: 'Group2.Custom2' }],
    ];
    const withCustomActions = createActionMenu(
      () => null,
      { isSelfHosted: false, enablePaste: false },
      {},
      customActions
    );
    expect(withCustomActions.findIndex((x) => x.key === 'Custom Actions')).toEqual(withCustomActions.length - 1);
    expect(withCustomActions[withCustomActions.length - 1].subMenuProps?.items.length).toEqual(3); // 2 action labels + 1 sep line
  });
});
