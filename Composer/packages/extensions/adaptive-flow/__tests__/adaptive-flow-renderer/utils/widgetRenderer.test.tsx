// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import { WidgetComponent } from '@bfc/extension';

import { renderUIWidget } from '../../../src/adaptive-flow-renderer/utils/visual/widgetRenderer';

describe('renderUIWidget', () => {
  it('can render with given schema', () => {
    const TestWidget: WidgetComponent<any> = ({ id, testField }) => <div data-testid="test-widget">{testField}</div>;
    const schema = {
      widget: 'TestWidget',
      testField: 'test',
    };

    const TestResult = () =>
      renderUIWidget(
        schema,
        { TestWidget },
        { id: '', data: { $kind: 'Kind' }, onEvent: () => null, onResize: () => null }
      );
    const ele = render(<TestResult />);
    expect(ele.getByTestId('test-widget')).toBeTruthy();
    expect(ele.getAllByText('test')).toHaveLength(1);
  });
});
