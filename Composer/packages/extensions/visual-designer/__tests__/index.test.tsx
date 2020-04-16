// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from '@bfc/test-utils';

import VisualDesigner from '../src';

// READ: https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
window.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
});

describe('<VisualDesigner />', () => {
  it('should render the visual designer', async () => {
    const { getByTestId } = render(
      <VisualDesigner
        data={{ content: '{"json": "some data"}' }}
        currentDialog={{ id: 'Main', displayName: 'Main', isRoot: false }}
        dialogId="SomeDialog"
        focusedEvent="events[0]"
        focusedSteps={['events[0].steps[0]']}
        focusedTab=""
        shellApi={{
          saveData: () => {},
        }}
      />
    );

    // TODO: make more meaningful tests according to https://testing-library.com/docs/guide-which-query
    // ex: searching for elements by text, etc.
    expect(getByTestId(/visualdesigner-container/)).toBeInTheDocument();
    expect(getByTestId(/obi-editor-container/)).toBeInTheDocument();
  });
});
