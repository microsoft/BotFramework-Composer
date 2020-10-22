// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';
import { AdaptiveDialog } from '../../../src/adaptive-flow-renderer/adaptive/AdaptiveDialog';

describe('<AdaptiveDialog />', () => {
  it('can be rendered', () => {
    const dialog = {
      $kind: AdaptiveKinds.AdaptiveDialog,
      triggers: [
        {
          $kind: AdaptiveKinds.OnIntent,
          actions: [
            {
              $kind: AdaptiveKinds.SendActivity,
              activity: 'hello',
            },
          ],
        },
      ],
    };
    const widgets = {
      Node: ({ data }) => data.activity,
    };
    const uischema = {
      [AdaptiveKinds.SendActivity]: {
        widget: 'Node',
      },
    };

    const renderResult = render(
      <AdaptiveDialog
        activeTrigger="triggers[0]"
        dialogData={dialog}
        dialogId="test"
        uischema={uischema}
        widgets={widgets}
        onEvent={() => null}
      />
    );
    expect(renderResult.getAllByText('hello')).toHaveLength(1);
  });
});
