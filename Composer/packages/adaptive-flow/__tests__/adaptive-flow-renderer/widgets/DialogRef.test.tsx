// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { DialogRef } from '../../../src/adaptive-flow-renderer/widgets';
import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

describe('DialogRef', () => {
  it('can be rendered.', () => {
    const dialogRef = render(
      <DialogRef data={{ $kind: AdaptiveKinds.BeginDialog }} dialog="" id="test" onEvent={() => null} />
    );
    expect(dialogRef).toBeTruthy();
  });

  it('can ref string dialog value correctly.', () => {
    const dialogRef = render(
      <DialogRef data={{ $kind: AdaptiveKinds.BeginDialog }} dialog="test-dialog" id="test" onEvent={() => null} />
    );
    expect(dialogRef.queryAllByText('test-dialog')).toHaveLength(1);
  });

  it('can ref object dialog value correctly.', () => {
    const dialogRef = render(
      <DialogRef
        data={{ $kind: AdaptiveKinds.BeginDialog }}
        dialog={{ $ref: 'test-dialog-obj' }}
        id="test"
        onEvent={() => null}
      />
    );
    expect(dialogRef.queryAllByText('test-dialog-obj')).toHaveLength(1);
  });
});
