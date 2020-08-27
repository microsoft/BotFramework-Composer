// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { renderWithRecoil } from './../../../../__tests__/testUtils/renderWithRecoil';
import { ImportQnAFromUrlModal } from './../ImportQnAFromUrlModal';

describe('<ImportQnAFromUrlModal />', () => {
  const onDismiss = jest.fn(() => {});
  const onSubmit = jest.fn(() => {});
  let container;
  beforeEach(() => {
    container = renderWithRecoil(
      <ImportQnAFromUrlModal dialogId="test" onDismiss={onDismiss} onSubmit={onSubmit} />,
      () => {}
    );
  });

  it('renders <ImportQnAFromUrlModal /> and create from scratch', () => {
    const { getByText } = container;
    expect(getByText('Populate your KB.')).not.toBeNull();
    const createFromScratchButton = getByText('Create knowledge base from scratch');
    expect(createFromScratchButton).not.toBeNull();
    fireEvent.click(createFromScratchButton);
    expect(onSubmit).toBeCalled();
    expect(onSubmit).toBeCalledWith([]);
  });

  it('click cancel', () => {
    const { getByText } = container;
    const cancelButton = getByText('Cancel');
    expect(cancelButton).not.toBeNull();
    fireEvent.click(cancelButton);
    expect(onDismiss).toBeCalled();
  });

  it('add new url and validate the value', () => {
    const { findByText, getByTestId, getByText } = container;
    const input0 = getByTestId('knowledgeLocationTextField-0');
    fireEvent.change(input0, { target: { value: 'test' } });

    expect(input0.value).toBe('test');
    expect(findByText(/A valid url should start with/)).not.toBeNull();

    const addButton = getByText(/Add URL/);
    fireEvent.change(input0, { target: { value: 'http://test' } });
    fireEvent.click(addButton);
    expect(getByTestId('knowledgeLocationTextField-1')).not.toBeNull();

    const input1 = getByTestId('knowledgeLocationTextField-1');
    fireEvent.change(input1, { target: { value: 'http://test' } });
    expect(findByText(/This url is duplicated/)).not.toBeNull();
    fireEvent.change(input1, { target: { value: 'http://test1' } });

    const createKnowledgeButton = getByText('Create knowledge base');
    expect(createKnowledgeButton).not.toBeNull();
    fireEvent.click(createKnowledgeButton);
    expect(onSubmit).toBeCalled();
    expect(onSubmit).toBeCalledWith(['http://test', 'http://test1']);

    const deletebutton = getByTestId('deleteImportQnAUrl-1');
    fireEvent.click(deletebutton);
    fireEvent.click(createKnowledgeButton);
    expect(onSubmit).toBeCalled();
    expect(onSubmit).toBeCalledWith(['http://test']);
  });
});
