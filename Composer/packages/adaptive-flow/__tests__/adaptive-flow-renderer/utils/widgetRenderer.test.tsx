// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import { WidgetComponent, FlowEditorWidgetMap, FlowWidget } from '@bfc/extension-client';

import { renderUIWidget, UIWidgetContext } from '../../../src/adaptive-flow-renderer/utils/visual/widgetRenderer';

const renderWidget = (schema: FlowWidget, widgetsMap: FlowEditorWidgetMap, context: UIWidgetContext) => {
  const TestResult = () => renderUIWidget(schema, widgetsMap, context);
  return render(<TestResult />);
};

const TestWidget: WidgetComponent<any> = ({ id, testField }) => <div data-testid="test-widget">{testField}</div>;

describe('renderUIWidget', () => {
  it('can render with simple schema', () => {
    const schema = {
      widget: 'TestWidget',
      testField: 'test',
    };

    const ele = renderWidget(
      schema,
      { TestWidget },
      { id: '', data: { $kind: 'Kind' }, onEvent: () => null, onResize: () => null }
    );
    expect(ele.getByTestId('test-widget')).toBeTruthy();
    expect(ele.getAllByText('test')).toHaveLength(1);
  });

  it('can consume function props to value.', () => {
    const schema = {
      widget: 'TestWidget',
      testField: (data) => data.value,
    };

    const ele = renderWidget(
      schema,
      { TestWidget },
      { id: '', data: { $kind: 'Kind', value: 'testValue' } as any, onEvent: () => null, onResize: () => null }
    );

    expect(ele.getByTestId('test-widget')).toBeTruthy();
    expect(ele.getAllByText('testValue')).toHaveLength(1);
  });
});
