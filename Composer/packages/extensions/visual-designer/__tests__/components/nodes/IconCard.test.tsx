import React from 'react';
import { render, fireEvent } from 'react-testing-library';

import { IconCard } from '../../../src/components/nodes/templates/IconCard';

describe('<IconCard />', () => {
  let renderResult, icon, label, corner, themeColor, onClick;

  beforeEach(() => {
    icon = 'MessageBot';
    label = 'Intent';
    corner = <div />;
    themeColor = '#BFEAE9';
    onClick = jest.fn();

    renderResult = render(
      <IconCard
        icon={icon}
        label={label}
        corner={corner}
        summary={''}
        trigger={''}
        childDialog={''}
        themeColor={themeColor}
        iconColor={'red'}
        onClick={onClick}
        onChildDialogClick={() => {}}
      />
    );
  });

  it('can be clicked', async () => {
    const { findByTestId } = renderResult;
    const iconCard = await findByTestId('IconCard');

    fireEvent.click(iconCard);
    expect(onClick).toHaveBeenCalled();
  });
});
