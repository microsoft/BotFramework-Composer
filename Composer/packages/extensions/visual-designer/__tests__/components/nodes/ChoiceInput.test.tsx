import React from 'react';
import { render, cleanup } from 'react-testing-library';

import { ChoiceInput } from '../../../src/components/nodes/steps/ChoiceInput';
import { ObiTypes } from '../../../src/constants/ObiTypes';

describe('<ChoiceInput />', () => {
  let renderResult, id, data, onEvent;

  beforeEach(() => {
    onEvent = jest.fn();
    id = 'choiceInput';
  });
  afterEach(cleanup);

  it("should have no choice dom when data's choice is null", () => {
    data = {
      $type: ObiTypes.ChoiceInput,
      choices: null,
    };

    renderResult = render(<ChoiceInput id={id} data={data} onEvent={onEvent} />);

    const { queryByTestId } = renderResult;
    expect(queryByTestId('ChoiceInput')).toBeNull();
  });

  it("should show as many choice items as there are when data's choices length is less than 4", () => {
    data = {
      $type: ObiTypes.ChoiceInput,
      choices: [
        {
          value: '1',
        },
        {
          value: '2',
        },
        {
          value: '3',
        },
      ],
    };

    renderResult = render(<ChoiceInput id={id} data={data} onEvent={onEvent} />);

    const { getAllByRole } = renderResult;
    const choices = getAllByRole('choice');

    expect(choices).toHaveLength(3);
  });

  it("should show three choice items and 'more' dom when data's choices length is more than 3", () => {
    data = {
      $type: ObiTypes.ChoiceInput,
      choices: [
        {
          value: '1',
        },
        {
          value: '2',
        },
        {
          value: '3',
        },
        {
          value: '4',
        },
      ],
    };

    renderResult = render(<ChoiceInput id={id} data={data} onEvent={onEvent} />);

    const { getAllByRole, getByTestId } = renderResult;
    const choices = getAllByRole('choice');
    const hasMore = getByTestId('hasMore');

    expect(choices).toHaveLength(3);
    expect(hasMore).toBeTruthy();
  });
});
