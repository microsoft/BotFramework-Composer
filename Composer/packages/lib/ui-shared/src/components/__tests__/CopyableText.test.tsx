// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { render, fireEvent } from '@botframework-composer/test-utils';
import React from 'react';

import { CopyableText } from '../CopyableText';

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

describe('<CopyableText />', () => {
  it('Should render the given text', async () => {
    const textToCopy = 'This is a command';
    const { container } = render(<CopyableText text={textToCopy} />);

    expect(container).toHaveTextContent(textToCopy);
  });

  it('Should copy text to clipboard when the copy button ios clicked', async () => {
    jest.spyOn(navigator.clipboard, 'writeText');
    const textToCopy = 'This is a command';
    const { findByTestId } = render(<CopyableText text={textToCopy} />);

    const copyButton = await findByTestId('copy-to-clipboard-button');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(textToCopy);
  });
});
