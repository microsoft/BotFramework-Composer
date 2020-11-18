// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../testUtils/renderWithRecoil';
import CreateQnAFromUrlModal from '../../src/components/QnA/CreateQnAFromUrlModal';
import { showCreateQnAFromUrlDialogState } from '../../src/recoilModel';

describe('<CreateQnAFromUrlModal />', () => {
  const onDismiss = jest.fn(() => {});
  const onSubmit = jest.fn(() => {});
  const projectId = 'test-create-qna';

  it('renders <CreateQnAFromUrlModal /> and create from scratch', () => {
    const container = renderWithRecoil(
      <CreateQnAFromUrlModal
        dialogId="test"
        projectId={projectId}
        qnaFiles={[]}
        onDismiss={onDismiss}
        onSubmit={onSubmit}
      />,
      ({ set }) => {
        set(showCreateQnAFromUrlDialogState(projectId), true);
      }
    );

    const { getByTestId } = container;
    const createFromScratchButton = getByTestId('createKnowledgeBaseFromScratch');
    expect(createFromScratchButton).not.toBeNull();
    fireEvent.click(createFromScratchButton);
    // actions tobe called
  });

  it('create with name/url and validate the value', () => {
    const container = renderWithRecoil(
      <CreateQnAFromUrlModal
        dialogId="test"
        projectId={projectId}
        qnaFiles={[]}
        onDismiss={onDismiss}
        onSubmit={onSubmit}
      />,
      () => {}
    );

    const { findByText, getByTestId } = container;
    const inputName = getByTestId('knowledgeLocationTextField-name') as HTMLInputElement;
    fireEvent.change(inputName, { target: { value: 'test' } });

    const inputUrl = getByTestId('knowledgeLocationTextField-url') as HTMLInputElement;
    fireEvent.change(inputUrl, { target: { value: 'test' } });

    expect(inputUrl.value).toBe('test');
    expect(findByText(/A valid url should start with/)).not.toBeNull();
    fireEvent.change(inputUrl, { target: { value: 'http://test' } });

    const createKnowledgeButton = getByTestId('createKnowledgeBase');
    expect(createKnowledgeButton).not.toBeNull();
    fireEvent.click(createKnowledgeButton);
    expect(onSubmit).toBeCalled();
    expect(onSubmit).toBeCalledWith({ url: 'http://test', name: 'test', multiTurn: false });
  });
});
