// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent, render } from '@botframework-composer/test-utils';

import { WebChatHeader, WebChatHeaderProps } from '../WebChatHeader';
import { RestartOption } from '../types';

describe('<WebChatHeader />', () => {
  const mockOnSetRestartOption = jest.fn();
  const mockOnRestartConversation = jest.fn();
  const mockOnSaveTranscript = jest.fn();

  const props: WebChatHeaderProps = {
    botName: 'Test-Bot',
    currentRestartOption: RestartOption.NewUserID,
    onSetRestartOption: mockOnSetRestartOption,
    conversationId: '123-abc-conv',
    onRestartConversation: mockOnRestartConversation,
    onSaveTranscript: mockOnSaveTranscript,
    onOpenBotInEmulator: jest.fn(),
    onCloseWebChat: jest.fn(),
    isRestartButtonDisabled: false,
  };

  afterEach(() => {
    mockOnSetRestartOption.mockClear();
    mockOnRestartConversation.mockClear();
    mockOnSaveTranscript.mockClear();
  });

  it('should render webchat header correctly and restart conversation with same user id', async () => {
    const mockOnSetRestartOption = jest.fn();
    const mockOnRestartConversation = jest.fn();
    const mockOnSaveTranscript = jest.fn();

    const props: WebChatHeaderProps = {
      botName: 'Test-Bot',
      currentRestartOption: RestartOption.SameUserID,
      onSetRestartOption: mockOnSetRestartOption,
      conversationId: '123-abc-conv',
      onRestartConversation: mockOnRestartConversation,
      onSaveTranscript: mockOnSaveTranscript,
      onOpenBotInEmulator: jest.fn(),
      onCloseWebChat: jest.fn(),
      isRestartButtonDisabled: false,
    };

    const { findByText } = render(<WebChatHeader {...props} />);

    const restartElement = await findByText('Restart Conversation - same user ID');
    act(() => {
      fireEvent.click(restartElement);
      expect(mockOnRestartConversation).toHaveBeenLastCalledWith('123-abc-conv', false);
    });
  });

  it('should render webchat header correctly and restart conversation with different user id', async () => {
    const mockOnSetRestartOption = jest.fn();
    const mockOnRestartConversation = jest.fn();
    const mockOnSaveTranscript = jest.fn();

    const props: WebChatHeaderProps = {
      botName: 'Test-Bot',
      currentRestartOption: RestartOption.NewUserID,
      onSetRestartOption: mockOnSetRestartOption,
      conversationId: '123-abc-conv',
      onRestartConversation: mockOnRestartConversation,
      onSaveTranscript: mockOnSaveTranscript,
      onOpenBotInEmulator: jest.fn(),
      onCloseWebChat: jest.fn(),
      isRestartButtonDisabled: false,
    };

    const { findByText } = render(<WebChatHeader {...props} />);

    const restartElement = await findByText('Restart Conversation - new user ID');
    act(() => {
      fireEvent.click(restartElement);
      expect(mockOnRestartConversation).toHaveBeenLastCalledWith('123-abc-conv', true);
    });
  });

  it('should call save transcript with the correct conversation id', async () => {
    const { findByTestId } = render(<WebChatHeader {...props} />);

    const saveTranscript = await findByTestId('save-transcript');
    act(() => {
      fireEvent.click(saveTranscript);
      expect(mockOnSaveTranscript).toHaveBeenLastCalledWith('123-abc-conv');
    });
  });
});
