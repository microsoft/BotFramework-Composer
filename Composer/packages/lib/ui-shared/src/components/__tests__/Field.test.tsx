// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { TextField, DropdownField } from '../Field';

describe.each([
  ['TextField', TextField],
  ['DropdownField', DropdownField],
])('<%s/>', (fieldName, Field) => {
  const defaultProps = { options: [] };

  it('Should render an input with the given label', () => {
    const labelText = `${fieldName} Test Label`;
    const { container } = render(<Field {...defaultProps} label={labelText} />);
    expect(container).toHaveTextContent(labelText);
  });

  it('Should render tooltip with the given text', async () => {
    const tooltipText = `${fieldName} Test Tooltip`;
    const tooltipIconTestId = 'tooltip-icon';
    const { findByTestId } = render(
      <Field
        {...defaultProps}
        tooltip={tooltipText}
        tooltipIconProps={{
          'data-testid': tooltipIconTestId,
        }}
      />
    );
    const icon = await findByTestId(tooltipIconTestId);
    expect(icon.getAttribute('aria-label')).toEqual(tooltipText);
    expect(icon.tabIndex).toEqual(0);
  });

  it('Should render a tooltip only when the tooltip property is specified', () => {
    const tooltipIconTestId = 'tooltip-icon';
    const { queryByTestId } = render(
      <Field
        {...defaultProps}
        tooltipIconProps={{
          'data-testid': tooltipIconTestId,
        }}
      />
    );
    const icon = queryByTestId(tooltipIconTestId);
    expect(icon).toBeNull();
  });
});
