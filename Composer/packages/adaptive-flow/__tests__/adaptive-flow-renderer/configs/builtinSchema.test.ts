// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

import builtinVisualSDKSchema from '../../../src/adaptive-flow-renderer/configs/builtinSchema';

describe('builtinSchema', () => {
  it('builtin visualSDKSchema should at least contain branching, looping $kinds', () => {
    const getSchema = ($kind) => builtinVisualSDKSchema[$kind];
    expect(getSchema(SDKKinds.IfCondition)).toBeTruthy();
    expect(getSchema(SDKKinds.SwitchCondition)).toBeTruthy();
    expect(getSchema(SDKKinds.Foreach)).toBeTruthy();
    expect(getSchema(SDKKinds.ForeachPage)).toBeTruthy();
  });
});
