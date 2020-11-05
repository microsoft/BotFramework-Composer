// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { AdaptiveTrigger } from '../../../src/adaptive-flow-renderer/adaptive/AdaptiveTrigger';
import { SchemaContext } from '../../../src/adaptive-flow-renderer/contexts/SchemaContext';
import { WidgetSchemaProvider } from '../../../src/adaptive-flow-renderer/utils/visual/WidgetSchemaProvider';
import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

describe('<AdaptiveTrigger />', () => {
  it('can be rendererd.', () => {
    const triggerData = {
      $kind: AdaptiveKinds.OnIntent,
      actions: [
        {
          $kind: AdaptiveKinds.SendActivity,
          activity: 'hello',
        },
      ],
    };
    const widgets = {
      Node: ({ id, data, onEvent }) => <div className="node-text">{data.activity}</div>,
    };
    const uischema = {
      [AdaptiveKinds.SendActivity]: {
        widget: 'Node',
      },
    };

    const renderResult = render(
      <SchemaContext.Provider value={{ widgets, schemaProvider: new WidgetSchemaProvider(uischema) }}>
        <AdaptiveTrigger triggerData={triggerData} triggerId="triggers[0]" onEvent={() => null} />
      </SchemaContext.Provider>
    );
    expect(renderResult.getAllByText('hello')).toHaveLength(1);
  });
});
