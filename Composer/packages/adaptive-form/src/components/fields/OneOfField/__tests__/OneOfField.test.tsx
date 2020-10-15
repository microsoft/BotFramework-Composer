// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, screen } from '@botframework-composer/test-utils';
import assign from 'lodash/assign';

import { OneOfField } from '../OneOfField';
import { resolveFieldWidget } from '../../../../utils/resolveFieldWidget';

jest.mock('../../../../utils/resolveFieldWidget', () => ({
  resolveFieldWidget: jest.fn(),
}));

const defaultProps = {
  onChange: jest.fn(),
  depth: 0,
  schema: {},
  definitions: {},
  id: 'test',
  name: 'test name',
  uiOptions: {},
};

function renderSubject(overrides = {}) {
  const props = assign({}, defaultProps, overrides);
  return render(<OneOfField {...props} />);
}

describe('<OneOfField />', () => {
  beforeEach(() => {
    (resolveFieldWidget as jest.Mock).mockImplementation(({ type }) => {
      return () => <div>{type ?? 'unsupported'} field</div>;
    });
  });

  describe('when the schema does not specify any options', () => {
    it('renders unsupported field', () => {
      const { container, queryByTestId } = renderSubject({ schema: { type: 'string' } });
      expect(container).toHaveTextContent('unsupported field');
      expect(queryByTestId('OneOfFieldType')).not.toBeInTheDocument();
    });
  });

  describe('when the schema only specifies one type', () => {
    it('renders a field of that type', () => {
      const { container, queryByTestId } = renderSubject({ schema: { oneOf: [{ type: 'string' }] } });
      expect(container).toHaveTextContent('string field');
      expect(queryByTestId('OneOfFieldType')).not.toBeInTheDocument();
    });
  });

  describe('when the schema specifies more than one type', () => {
    const schema = {
      oneOf: [
        {
          type: 'string',
          title: 'Custom Title',
        },
        {
          type: 'number',
        },
        {
          type: 'boolean',
        },
      ],
    };

    it('renders a dropdown with the schema options', () => {
      const { getByTestId, getByText } = renderSubject({ schema });
      const dropdown = getByTestId('OneOfFieldType');

      // it renders the first option by default
      expect(screen.getByText('custom title')).toBeInTheDocument();
      expect(dropdown).toHaveTextContent(/custom title/);
      expect(getByText('string field')).toBeInTheDocument();

      fireEvent.click(dropdown);
      expect(screen.getAllByText('custom title')).toHaveLength(2);
      expect(screen.getByText('number')).toBeInTheDocument();
      expect(screen.getByText('boolean')).toBeInTheDocument();

      fireEvent.click(screen.getByText('boolean'));
      expect(dropdown).toHaveTextContent(/boolean/);
      expect(getByText('boolean field')).toBeInTheDocument();
    });

    it('correctly renders selected field type', () => {});
  });
});
