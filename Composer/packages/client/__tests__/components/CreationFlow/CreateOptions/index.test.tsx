// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { renderWithRecoil } from '../../../testUtils';
import { CreateOptions } from '../../../../src/components/CreationFlow/CreateOptions';

describe('<CreateOptions/>', () => {
  const handleDismissMock = jest.fn();
  const handleCreateNextMock = jest.fn();
  const templates = [
    {
      description: 'empty bot',
      id: 'EmptyBot',
      index: 0,
      name: 'Empty Bot',
      path: 'templatePath',
      support: ['C#', 'JS'],
      tags: ['Basic'],
    },
    {
      description: 'echo bot',
      id: 'EchoBot',
      index: 1,
      name: 'Echo Bot',
      path: 'templatePath',
      support: ['C#', 'JS'],
      tags: ['Basic'],
    },
  ];

  const renderComponent = () => {
    return renderWithRecoil(
      <CreateOptions path="create" templates={templates} onDismiss={handleDismissMock} onNext={handleCreateNextMock} />
    );
  };

  it('should save empty bot template id', async () => {
    const component = renderComponent();
    const nextButton = await component.findByText('Next');
    fireEvent.click(nextButton);
    expect(handleCreateNextMock).toBeCalledWith('EmptyBot');
  });

  it('should save echo bot template id', async () => {
    const component = renderComponent();
    const option = await component.findByTestId('Create from template');
    fireEvent.click(option);
    const echoBot = await component.findByText('Echo Bot');
    fireEvent.click(echoBot);
    const nextButton = await component.findByText('Next');
    fireEvent.click(nextButton);
    expect(handleCreateNextMock).toBeCalledWith('EchoBot');
  });
});
