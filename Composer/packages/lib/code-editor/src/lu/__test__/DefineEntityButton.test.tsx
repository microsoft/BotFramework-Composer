// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { act, fireEvent, render, screen } from '@botframework-composer/test-utils';
import React from 'react';

import { DefineEntityButton } from '../DefineEntityButton';

beforeAll(() => {
  jest.useFakeTimers();
});
afterAll(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('<DefineEntityButton />', () => {
  it('Should call onDefineEntity callback when a menu item is clicked', () => {
    const callback = jest.fn();
    render(<DefineEntityButton onDefineEntity={callback} />);
    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.click(screen.getByText('Machine learned entity'));
    expect(callback).toBeCalledWith('ml');
  });

  it('prebuilt: Should filter prebuilt entities when passed query', async () => {
    render(<DefineEntityButton onDefineEntity={jest.fn()} />);

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.click(screen.getByText('Prebuilt entity'));
    fireEvent.change(screen.getByPlaceholderText('Search prebuilt entities'), { target: { value: 'age' } });

    act(() => {
      jest.runAllTimers();
    });

    expect((await screen.findAllByText(/.*age.*/)).length).toBe(2);
  });

  it('prebuilt: Should call onDefineEntity callback when a menu item is clicked', async () => {
    const callback = jest.fn();
    render(<DefineEntityButton onDefineEntity={callback} />);

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.click(screen.getByText('Prebuilt entity'));
    fireEvent.click(screen.getByText('datetimeV2'));

    act(() => {
      jest.runAllTimers();
    });

    expect(callback).toBeCalledWith('prebuilt', 'datetimeV2');
  });

  it('Should open a new window when link in tooltip is clicked', () => {
    const windowOpenSpy = spyOn(window, 'open');

    render(<DefineEntityButton onDefineEntity={jest.fn()} />);

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.mouseOver(screen.getByTestId('helpIcon'));
    act(() => {
      jest.runAllTimers();
    });
    fireEvent.click(screen.getByText('this page'));

    expect(windowOpenSpy).toBeCalled();
  });
});
