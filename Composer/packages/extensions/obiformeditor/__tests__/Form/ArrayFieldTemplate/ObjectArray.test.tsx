import React from 'react';
import { render, fireEvent, RenderResult } from 'react-testing-library';

import ObjectArray from '../../../src/Form/ArrayFieldTemplate/ObjectArray';

const items = [
  { children: <div>element 1</div> },
  { children: <div>element 2</div> },
  { children: <div>element 3</div> },
];

function renderDefault(propOverrides = {}): RenderResult {
  const props = {
    items,
    title: 'My Array Title',
    schema: {
      description: 'My array description.',
    },
    idSchema: {
      __id: 'ObjectArrayTest',
    },
    ...propOverrides,
  };

  // @ts-ignore
  return render(<ObjectArray {...props} />);
}

describe('<ObjectArray />', () => {
  it('renders a TitleField', async () => {
    const { findByText } = renderDefault();

    const title = await findByText('My Array Title');
    expect(title).toBeTruthy();
  });

  it('renders a DescriptionField', async () => {
    const { findByText } = renderDefault();

    const description = await findByText('My array description.');
    expect(description).toBeTruthy();
  });

  it('renders a StringItem for each item', async () => {
    const { findAllByText } = renderDefault();

    const items = await findAllByText('element', { exact: false });
    expect(items).toHaveLength(3);
  });

  it('can add new items', async () => {
    const onAddClick = jest.fn();
    const { findByText } = renderDefault({ canAdd: true, onAddClick });
    const addBtn = await findByText('Add');
    fireEvent.click(addBtn);
    expect(onAddClick).toHaveBeenCalled();
  });
});
