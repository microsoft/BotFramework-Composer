import React from 'react';
import { render, fireEvent, findAllByText } from 'react-testing-library';

import StringArray, { StringItem } from '../../../src/Form/ArrayFieldTemplate/StringArray';

const TestTitleField = ({ title, ...rest }) => <label {...rest}>{title}</label>;
const TestDescriptionField = ({ description, ...rest }) => <p {...rest}>{description}</p>;

const items = [
  { children: <div>element 1</div> },
  { children: <div>element 2</div> },
  { children: <div>element 3</div> },
];

function renderDefault(propOverrides = {}) {
  const props = {
    TitleField: TestTitleField,
    DescriptionField: TestDescriptionField,
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

  return render(<StringArray {...props} />);
}

describe('<StringArray />', () => {
  it('renders a TitleField', async () => {
    const { findByText } = renderDefault();

    const title = await findByText('My Array Title');
    expect(title.tagName).toEqual('LABEL');
    expect(title.id).toEqual('StringArrayTest__title');
  });

  it('renders a DescriptionField', async () => {
    const { findByText } = renderDefault();

    const title = await findByText('My array description.');
    expect(title.tagName).toEqual('P');
    expect(title.id).toEqual('StringArrayTest__description');
  });

  it('renders a StringItem for each item', async () => {
    const { findAllByText } = renderDefault();

    const items = await findAllByText('element', { exact: false });
    expect(items).toHaveLength(3);
  });

  it('can add an item', async () => {
    const onAddClick = jest.fn();
    const { findByText } = renderDefault({ canAdd: true, onAddClick });
    const addBtn = await findByText('Add');
    fireEvent.click(addBtn);
    expect(onAddClick).toHaveBeenCalled();
  });
});

describe('<StringItem />', () => {
  it('does not render a context menu if no actions can be made', () => {
    const { queryByTestId } = render(
      <StringItem>
        <div>element 1</div>
      </StringItem>
    );

    const menuButton = queryByTestId('StringItemContextMenu');
    expect(menuButton).toBe(null);
  });

  describe('when there are actions that can be made', () => {
    let renderResult, onReorderClick, onDropIndexClick, clickResults;

    beforeEach(() => {
      clickResults = {
        onReorderClick: [],
        onDropIndexClick: [],
      };

      onReorderClick = (...args) => {
        return () => {
          clickResults.onReorderClick.push(args);
        };
      };
      onDropIndexClick = (...args) => {
        return () => {
          clickResults.onDropIndexClick.push(args);
        };
      };

      renderResult = render(
        <StringItem
          hasMoveUp
          hasMoveDown
          hasRemove
          onReorderClick={onReorderClick}
          onDropIndexClick={onDropIndexClick}
          index={3}
        >
          <div>element 1</div>
        </StringItem>
      );
    });

    async function getMenuItems(itemName) {
      const { findByTestId } = renderResult;
      const menuButton = await findByTestId('StringItemContextMenu');
      expect(menuButton).toBeTruthy();
      fireEvent.click(menuButton);

      if (itemName) {
        return findAllByText(document.body, itemName);
      }

      return findAllByText(document.body, /(Move Up|Move Down|Remove)/);
    }

    it('renders a context menu with available actions', async () => {
      const menuItems = await getMenuItems();

      expect(menuItems).toHaveLength(3);
    });

    it('can move an item up', async () => {
      const [moveUpItem] = await getMenuItems('Move Up');

      fireEvent.click(moveUpItem);
      expect(clickResults.onReorderClick).toEqual([[3, 2]]);
    });

    it('can move an item down', async () => {
      const [moveDownItem] = await getMenuItems('Move Down');

      fireEvent.click(moveDownItem);
      expect(clickResults.onReorderClick).toEqual([[3, 4]]);
    });

    it('can remove an item', async () => {
      const [removeItem] = await getMenuItems('Remove');

      fireEvent.click(removeItem);
      expect(clickResults.onDropIndexClick).toEqual([[3]]);
    });
  });
});
