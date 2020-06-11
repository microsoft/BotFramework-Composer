// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { renderWithStore } from '../../testUtils';
import TriggerCreationModal from '../../../src/components/ProjectTree/TriggerCreationModal';

jest.mock('nanoid', () => {
  return {
    nanoid: () => '123456',
    customAlphabet: () => () => '123456',
  };
});
describe('<TriggerCreationModal/>', () => {
  const onSubmitMock = jest.fn();
  const onDismissMock = jest.fn();
  let StoreContext;

  function renderComponent(dialogId: string) {
    return renderWithStore(
      <TriggerCreationModal isOpen dialogId={dialogId} onDismiss={onDismissMock} onSubmit={onSubmitMock} />,
      StoreContext.state
    );
  }

  beforeEach(() => {
    StoreContext = {
      state: {
        templateId: 'EchoBot',
        dialogs: [
          {
            content: { recognizer: 'emptybot-0.lu' },
            displayName: 'EmptyBot-0',
            id: 'main',
            isRoot: true,
          },
          {
            content: {
              recognizer: {
                $kind: 'Microsoft.RegexRecognizer',
                intents: [],
              },
            },
            displayName: 'dialog0',
            id: 'dialog0',
            isRoot: true,
          },
        ],
        schemas: {
          sdk: {
            content: 'content',
          },
        },
      },
    };
  });

  it('should submit form to create an onIntent trigger', async () => {
    const component = renderComponent('dialog0');
    const nameField = await component.findByTestId('TriggerName');
    fireEvent.change(nameField, { target: { value: 'aaa' } });
    const regExField = await component.findByTestId('RegExField');
    fireEvent.change(regExField, { target: { value: 'aaa' } });
    const submit = await component.findByTestId('triggerFormSubmit');
    fireEvent.click(submit);
    expect(onSubmitMock).toBeCalledWith({
      content: {
        recognizer: { $kind: 'Microsoft.RegexRecognizer', intents: [{ intent: 'aaa', pattern: 'aaa' }] },
        triggers: [{ $designer: { id: '123456' }, $kind: 'Microsoft.OnIntent', intent: 'aaa' }],
      },
      displayName: 'dialog0',
      id: 'dialog0',
      isRoot: true,
    });
  });

  it('should submit form to create dialog event trigger', async () => {
    const component = renderComponent('dialog0');
    const dropdown = await component.findByTestId('triggerTypeDropDown');
    fireEvent.click(dropdown);
    const triggerType = await component.findByText('Dialog events');
    fireEvent.click(triggerType);
    const eventTypeDropDown = await component.findByTestId('eventTypeDropDown');
    fireEvent.click(eventTypeDropDown);
    const eventType = await component.findByText('Dialog started (Begin dialog event)');
    fireEvent.click(eventType);
    const submit = await component.findByTestId('triggerFormSubmit');
    fireEvent.click(submit);
    expect(onSubmitMock).nthCalledWith(2, {
      content: {
        recognizer: { $kind: 'Microsoft.RegexRecognizer', intents: [] },
        triggers: [{ $designer: { id: '123456' }, $kind: 'Microsoft.OnBeginDialog' }],
      },
      displayName: 'dialog0',
      id: 'dialog0',
      isRoot: true,
    });
  });

  it('should submit form to create dialog activity trigger', async () => {
    const component = renderComponent('dialog0');
    const dropdown = await component.findByTestId('triggerTypeDropDown');
    fireEvent.click(dropdown);
    const triggerType = await component.findByText('Activities');
    fireEvent.click(triggerType);
    const activityTypeDropDown = await component.findByTestId('activityTypeDropDown');
    fireEvent.click(activityTypeDropDown);
    const activityType = await component.findByText('Activities (Activity received)');
    fireEvent.click(activityType);
    const submit = await component.findByTestId('triggerFormSubmit');
    fireEvent.click(submit);
    expect(onSubmitMock).nthCalledWith(3, {
      content: {
        recognizer: { $kind: 'Microsoft.RegexRecognizer', intents: [] },
        triggers: [{ $designer: { id: '123456' }, $kind: 'Microsoft.OnActivity' }],
      },
      displayName: 'dialog0',
      id: 'dialog0',
      isRoot: true,
    });
  });
});
