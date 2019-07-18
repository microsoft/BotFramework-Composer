import * as React from 'react';
import { cleanup, render, waitForElement } from 'react-testing-library';

import VisualDesigner from '../src';

describe('<VisualDesigner />', () => {
  afterEach(cleanup);

  it('should render the visual designer', async () => {
    const { getByTestId } = render(
      <VisualDesigner
        data={{ content: '{"json": "some data"}' }}
        currentDialog={{ id: 'Main', displayName: 'Main', isRoot: false }}
        onChange={() => {}}
        navPath="Some#path"
        focusPath="Some#path.foo"
        shellApi={{}}
      />
    );

    // TODO: make more meaningful tests according to https://testing-library.com/docs/guide-which-query
    // ex: searching for elements by text, etc.
    await waitForElement(() => getByTestId(/visualdesigner-container/));
    await waitForElement(() => getByTestId(/obi-editor-container/));
  });
});
