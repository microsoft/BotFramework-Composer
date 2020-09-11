// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';
import { render } from '@bfc/test-utils';
import { DialogFactory } from '@bfc/shared';

import { NodeRendererContext } from '../../../src/adaptive-flow-editor/contexts/NodeRendererContext';

describe('NodeRendererContext', () => {
  const CtxtConsumer = () => {
    const { focusedId, focusedEvent, focusedTab, clipboardActions, dialogFactory, customSchemas } = useContext(
      NodeRendererContext
    );

    return (
      <div>
        <span data-testid="focusedId-value">{focusedId}</span>
        <span data-testid="focusedEvent-value">{focusedEvent}</span>
        <span data-testid="focusedTab-value">{focusedTab}</span>
        <span data-testid="clipboardAction-length">{clipboardActions.length}</span>
        <span data-testid="dialogFactory-existence">{'' + !!dialogFactory}</span>
        <span data-testid="customSchemas-length">{customSchemas.length}</span>
      </div>
    );
  };
  it('can be consumed.', () => {
    const ele = render(
      <NodeRendererContext.Provider
        value={{
          focusedId: 'id1',
          focusedEvent: 'event1',
          focusedTab: 'tab1',
          clipboardActions: ['action1'],
          dialogFactory: new DialogFactory(),
          customSchemas: [{}],
        }}
      >
        <CtxtConsumer />
      </NodeRendererContext.Provider>
    );

    expect(ele.getByTestId('focusedId-value').textContent).toEqual('id1');
    expect(ele.getByTestId('focusedEvent-value').textContent).toEqual('event1');
    expect(ele.getByTestId('focusedTab-value').textContent).toEqual('tab1');
    expect(ele.getByTestId('clipboardAction-length').textContent).toEqual('1');
    expect(ele.getByTestId('dialogFactory-existence').textContent).toEqual('true');
    expect(ele.getByTestId('customSchemas-length').textContent).toEqual('1');
  });
});
