// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import assign from 'lodash/assign';

import { ExpressionField } from '../ExpressionField';

const defaultProps = {
  depth: 0,
  schema: {},
  definitions: {},
  uiOptions: {},
  name: 'testName',
  id: 'testId',
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
};

function renderSubject(overrides = {}) {
  const props = assign({}, defaultProps, overrides);
  return render(<ExpressionField {...props} />);
}

describe('<ExpressionField />', () => {
  const schema = {
    $role: 'expression',
    oneOf: [
      {
        type: 'string',
        title: 'String Value',
      },
      {
        type: 'number',
        title: 'Number Value',
      },
      {
        type: 'string',
        title: 'Expression Value',
      },
    ],
  };

  it('renders a dropdown with the types', () => {
    const { getByTestId } = renderSubject({ schema, label: 'test' });
    expect(getByTestId('expression-type-dropdown-test')).toBeInTheDocument();
  });
});
