// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../../../testUtils';
import { CreateOptionsV2 } from '../../../../src/components/CreationFlow/v2/CreateOptions';

describe('<CreateOptionsV2/>', () => {
  const handleDismissMock = jest.fn();
  const handleCreateNextMock = jest.fn();
  const handleJumpToOpenModal = jest.fn();
  const handleFetchReadMeMock = jest.fn();
  const handleFetchTemplatesMock = jest.fn();

  const templates = [
    {
      description: 'conversational core template generator',
      id: 'generator-conversational-core',
      index: 0,
      name: 'conversational-core',
      dotnetSupport: { webAppSupported: true, functionsSupported: true },
      nodeSupport: { webAppSupported: true, functionsSupported: true },
      package: {
        packageName: 'generator-conversational-core',
        packageSource: 'npm',
        packageVersion: '1.0.9',
      },
    },
  ];

  const renderComponent = () => {
    return renderWithRecoil(
      <CreateOptionsV2
        fetchReadMe={handleFetchReadMeMock}
        fetchTemplates={handleFetchTemplatesMock}
        path="create"
        templates={templates}
        onDismiss={handleDismissMock}
        onJumpToOpenModal={handleJumpToOpenModal}
        onNext={handleCreateNextMock}
      />
    );
  };

  it('should save conversational core template id', async () => {
    const component = renderComponent();
    const conversationalCoreBot = await component.findByTestId('generator-conversational-core');
    fireEvent.click(conversationalCoreBot);
    const nextButton = await component.findByText('Next');
    fireEvent.click(nextButton);
    expect(handleCreateNextMock).toBeCalledWith('generator-conversational-core', 'dotnet');
  });
});
