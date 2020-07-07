// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';
import { render } from '@bfc/test-utils';

import { SelectionContext } from '../../../src/adaptive-flow-editor/contexts/SelectionContext';

describe('SelectionContext', () => {
  const ContextConsumer = () => {
    const { getNodeIndex, getSelectableIds, selectedIds, setSelectedIds, selectableElements } = useContext(
      SelectionContext
    );
    return (
      <div>
        <span data-testid="getNodeIndex-result">{getNodeIndex('')}</span>
        <span data-testid="getSelectableIds-result">{getSelectableIds().join(',')}</span>
        <span data-testid="selectedIds-str">{selectedIds.join(',')}</span>
        <span data-testid="setSelectedIds-existence">{'' + !!setSelectedIds}</span>
        <span data-testid="selectableElements-length">{selectableElements.length}</span>
      </div>
    );
  };
  it('can be provided.', () => {
    const ele = render(
      <SelectionContext.Provider
        value={{
          getNodeIndex: () => 1,
          getSelectableIds: () => ['a', 'b', 'c'],
          selectedIds: ['a'],
          setSelectedIds: () => null,
          selectableElements: [],
        }}
      >
        <ContextConsumer />
      </SelectionContext.Provider>
    );

    expect(ele.getByTestId('getNodeIndex-result').textContent).toEqual('1');
    expect(ele.getByTestId('getSelectableIds-result').textContent).toEqual('a,b,c');
    expect(ele.getByTestId('selectedIds-str').textContent).toEqual('a');
    expect(ele.getByTestId('setSelectedIds-existence').textContent).toEqual('true');
    expect(ele.getByTestId('selectableElements-length').textContent).toEqual('0');
  });
});
