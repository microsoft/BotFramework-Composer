import React from 'react';
import { render, fireEvent, findByText, RenderResult } from 'react-testing-library';

import IDialogArray from '../../../src/Form/ArrayFieldTemplate/IDialogArray';

const TestTitleField: React.FC<any> = ({ title, ...rest }) => <label {...rest}>{title}</label>;
const TestDescriptionField: React.FC<any> = ({ description, ...rest }) => <p {...rest}>{description}</p>;

const items = [
  { children: <div>element 1</div> },
  { children: <div>element 2</div> },
  { children: <div>element 3</div> },
];

function renderDefault(propOverrides = {}): RenderResult {
  const props = {
    TitleField: TestTitleField,
    DescriptionField: TestDescriptionField,
    items,
    title: 'My Array Title',
    schema: {
      description: 'My array description.',
    },
    idSchema: {
      __id: 'IDialogArrayTest',
    },
    ...propOverrides,
  };

  // @ts-ignore
  return render(<IDialogArray {...props} />);
}

describe('<IDialogArray />', () => {
  it('renders a TitleField', async () => {
    const { findByText } = renderDefault();

    const title = await findByText('My Array Title');
    expect(title.tagName).toEqual('LABEL');
    expect(title.id).toEqual('IDialogArrayTest__title');
  });

  it('renders a DescriptionField', async () => {
    const { findByText } = renderDefault();

    const title = await findByText('My array description.');
    expect(title.tagName).toEqual('P');
    expect(title.id).toEqual('IDialogArrayTest__description');
  });

  it('renders a StringItem for each item', async () => {
    const { findAllByText } = renderDefault();

    const items = await findAllByText('element', { exact: false });
    expect(items).toHaveLength(3);
  });

  it('can add an item with a given type', async () => {
    const onAddClick = jest.fn();
    const { findByTestId } = renderDefault({ canAdd: true, onAddClick });
    const addBtn = await findByTestId('ArrayContainerAdd');

    fireEvent.click(addBtn);

    const responseMenu = await findByText(document.body, 'Send a response');
    fireEvent.click(responseMenu);

    expect(onAddClick.mock.calls[0][1]).toEqual({
      $type: 'Microsoft.SendActivity',
      $designer: {
        id: expect.any(String),
        name: 'Send a response',
      },
      data: {
        $type: 'Microsoft.SendActivity',
        $designer: {
          id: expect.any(String),
          name: 'Send a response',
        },
      },
      key: 'Microsoft.SendActivity',
      name: 'Send a response',
      onClick: expect.any(Function),
    });
  });
});
