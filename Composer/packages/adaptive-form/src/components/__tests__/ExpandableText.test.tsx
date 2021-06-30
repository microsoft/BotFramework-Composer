// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, act, faker, userEvent } from '@botframework-composer/test-utils';

import { ExpandableText } from '../ExpandableText';

describe('<ExpandableText />', () => {
  const scrollHeightSpy = jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get');
  const clientHeightSpy = jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get');
  const text = faker.lorem.sentence();

  beforeEach(() => {
    scrollHeightSpy.mockClear();
    clientHeightSpy.mockClear();
  });

  it('does not truncate if the text does not overflow max lines', () => {
    const maxLines = 2;
    scrollHeightSpy.mockReturnValue(maxLines * 16);
    clientHeightSpy.mockReturnValue(maxLines * 16);

    const { getByTestId, queryByText } = render(<ExpandableText maxLines={maxLines}>{text}</ExpandableText>);
    const content = getByTestId('ExpandableTextContent');
    expect(content.getAttribute('data-istruncated')).toEqual('false');
    expect(queryByText('Show More')).not.toBeInTheDocument();
  });

  it('truncates if the text overflows max lines', () => {
    const maxLines = 2;
    scrollHeightSpy.mockReturnValue((maxLines + 1) * 16);
    clientHeightSpy.mockReturnValue(maxLines * 16);

    const { getByTestId, queryByText } = render(<ExpandableText maxLines={maxLines}>{text}</ExpandableText>);
    const content = getByTestId('ExpandableTextContent');
    expect(content.getAttribute('data-istruncated')).toEqual('true');
    expect(queryByText('Show More')).toBeInTheDocument();
  });

  it('can expand to show all content when truncated', () => {
    const maxLines = 2;
    scrollHeightSpy.mockReturnValue((maxLines + 1) * 16);
    clientHeightSpy.mockReturnValue(maxLines * 16);

    const { getByTestId, getByText } = render(<ExpandableText maxLines={maxLines}>{text}</ExpandableText>);
    const content = getByTestId('ExpandableTextContent');
    expect(content.getAttribute('data-istruncated')).toEqual('true');

    const showMoreBtn = getByText('Show More');

    act(() => {
      userEvent.click(showMoreBtn);
    });

    expect(content.getAttribute('data-istruncated')).toEqual('false');
    expect(getByText('Show Less')).toBeInTheDocument();
  });
});
