// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../testUtils/renderWithRecoil';
import CreateQnAFromUrlModal from '../../src/components/QnA/CreateQnAFromUrlModal';
import CreateQnAFromScratchModal from '../../src/components/QnA/CreateQnAFromScratchModal';
import { showCreateQnAFromUrlDialogState } from '../../src/recoilModel';

describe('<CreateQnAFromUrlModal />', () => {
  const onDismiss = jest.fn(() => {});
  const onSubmit = jest.fn(() => {});
  const projectId = 'test-create-qna';
  const locales = ['en-us', 'zh-cn'];
  const defaultLocale = 'en-us';

  it('renders <CreateQnAFromUrlModal /> and create from scratch', () => {
    const container = renderWithRecoil(
      <CreateQnAFromUrlModal
        defaultLocale={defaultLocale}
        dialogId="test"
        locales={locales}
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
        defaultLocale={defaultLocale}
        dialogId="test"
        locales={locales}
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

    const inputUrl = getByTestId(`adden-usInCreateQnAFromUrlModal`) as HTMLInputElement;
    fireEvent.change(inputUrl, { target: { value: 'test' } });

    expect(inputUrl.value).toBe('test');
    expect(findByText(/A valid url should start with/)).not.toBeNull();
    fireEvent.change(inputUrl, { target: { value: 'http://test' } });

    const createKnowledgeButton = getByTestId('createKnowledgeBase');
    expect(createKnowledgeButton).not.toBeNull();
    fireEvent.click(createKnowledgeButton);
    expect(onSubmit).toBeCalled();
    expect(onSubmit).toBeCalledWith({ urls: ['http://test'], locales: ['en-us'], name: 'test', multiTurn: false });
  });

  it('create qna from scratch with name and validate the value', () => {
    const container = renderWithRecoil(
      <CreateQnAFromScratchModal
        dialogId="test"
        projectId={projectId}
        qnaFiles={[]}
        onDismiss={onDismiss}
        onSubmit={onSubmit}
      />,
      () => {}
    );

    const { getByTestId } = container;
    const inputName = getByTestId('knowledgeLocationTextField-name') as HTMLInputElement;
    fireEvent.change(inputName, { target: { value: 'test' } });
    const createKnowledgeButton = getByTestId('createKnowledgeBase');
    expect(createKnowledgeButton).not.toBeNull();
    fireEvent.click(createKnowledgeButton);
    expect(onSubmit).toBeCalledWith({ name: 'test' });
  });
});
