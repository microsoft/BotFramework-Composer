// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from 'react-testing-library';

import StringArray from '../../../src/Form/ArrayFieldTemplate/StringArray';

const items = [
  { children: <div>element 1</div> },
  { children: <div>element 2</div> },
  { children: <div>element 3</div> },
];

function renderDefault(propOverrides = {}) {
  const props = {
    items,
    title: 'My Array Title',
    schema: {
      description: 'My array description.',
    },
    idSchema: {
      __id: 'StringArrayTest',
    },
    ...propOverrides,
  };

  // @ts-ignore
  return render(<StringArray {...props} />);
}

describe('<StringArray />', () => {
  it('renders a TitleField', async () => {
    const { findByText } = renderDefault();

    const title = await findByText('My Array Title');
    expect(title).toBeTruthy();
  });

  it('renders a DescriptionField in tooltip', async () => {
    const { baseElement } = renderDefault();
    const icon = baseElement.querySelector('[data-icon-name="Unknown"]');

    if (icon !== null) fireEvent.mouseOver(icon);

    expect(baseElement).toHaveTextContent('My array description.');
  });

  it('renders a StringItem for each item', async () => {
    const { findAllByText } = renderDefault();

    const items = await findAllByText('element', { exact: false });
    expect(items).toHaveLength(3);
  });

  it('can add an item', async () => {
    const onAddClick = jest.fn();
    const { findByTestId } = renderDefault({ canAdd: true, onAddClick });
    const input = await findByTestId('string-array-text-input');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 13 });
    expect(onAddClick).toHaveBeenCalled();
  });
});
