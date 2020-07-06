// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mergePluginConfig } from '../../../src/adaptive-flow-editor/utils/mergePluginConfig';
import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

describe('mergePluginConfig()', () => {
  it('can generate correct config.', () => {
    const plugins: any = [
      {
        visualSchema: {
          widgets: { widget1: 'w1' },
          schema: { [AdaptiveKinds.IfCondition]: 'widget1' },
        },
      },
      {
        visualSchema: {
          widgets: { widget2: 'w2' },
          schema: { [AdaptiveKinds.SwitchCondition]: 'widget2' },
        },
      },
    ];
    expect(mergePluginConfig(...plugins)).toMatchObject({
      widgets: {
        widget1: 'w1',
        widget2: 'w2',
      },
      schema: {
        [AdaptiveKinds.IfCondition]: 'widget1',
        [AdaptiveKinds.SwitchCondition]: 'widget2',
      },
    });
  });
});
