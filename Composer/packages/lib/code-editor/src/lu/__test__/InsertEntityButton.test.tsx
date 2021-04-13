// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { act, fireEvent, render, screen } from '@botframework-composer/test-utils';
import { LuFile } from '@botframework-composer/types';
import React from 'react';

import { InsertEntityButton } from '../InsertEntityButton';

const luFile: LuFile = {
  id: 'lufile0',
  diagnostics: [],
  intents: [
    {
      Body: '',
      Name: 'intent1',
      Entities: [
        { Name: 'entity10', Type: 'ml' },
        { Name: 'entity11', Type: 'ml' },
        { Name: 'entity12', Type: 'prebuilt' },
      ],
    },
    {
      Body: '',
      Name: 'intent2',
      Entities: [
        { Name: 'entity20', Type: 'prebuilt' },
        { Name: 'entity21', Type: 'ml' },
        { Name: 'entity22', Type: 'ml' },
      ],
    },
    {
      Body: '',
      Name: 'intent3',
      Entities: [{ Name: 'target', Type: 'ml' }],
    },
  ],
  allIntents: [],
  empty: false,
  content: '',
  imports: [],
  resource: { Content: '', Errors: [], Sections: [] },
  isContentUnparsed: false,
};

beforeAll(() => {
  jest.useFakeTimers();
});
afterAll(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('<InsertEntityButton />', () => {
  it('Should call onInsertEntity callback when a menu item is clicked', () => {
    const callback = jest.fn();
    render(
      <InsertEntityButton
        insertEntityDisabled={false}
        labelingMenuVisible={false}
        luFile={luFile}
        tagEntityDisabled={false}
        onInsertEntity={callback}
      />
    );
    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.click(screen.getByText('entity10'));
    expect(callback).toBeCalled();
  });

  it('Should filter entities when passed query', async () => {
    render(
      <InsertEntityButton
        insertEntityDisabled={false}
        labelingMenuVisible={false}
        luFile={luFile}
        tagEntityDisabled={false}
        onInsertEntity={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.change(screen.getByPlaceholderText('Search entities'), { target: { value: 'target' } });

    act(() => {
      jest.runAllTimers();
    });

    expect((await screen.findAllByText(/.*target.*/)).length).toBe(1);
  });

  it('Should disable non-ml entities when labeling menu is visible', async () => {
    const container = render(
      <InsertEntityButton
        insertEntityDisabled
        labelingMenuVisible
        luFile={luFile}
        tagEntityDisabled={false}
        onInsertEntity={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('menuButton'));
    const elms = container.getAllByText('Prebuilt entity');

    const allDisabled = elms.reduce((acc, elm) => {
      if (!elm.closest('button')?.classList.contains('is-disabled')) {
        acc = false;
      }

      return acc;
    }, true);

    expect(allDisabled).toBeTruthy();
  });
});
