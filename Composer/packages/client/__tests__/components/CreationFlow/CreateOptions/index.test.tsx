// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../../../testUtils';
import { CreateOptions } from '../../../../src/components/CreationFlow/CreateOptions';

describe('<CreateOptions/>', () => {
  const handleDismissMock = jest.fn();
  const handleCreateNextMock = jest.fn();
  const handleJumpToOpenModal = jest.fn();
  const handleFetchReadMeMock = jest.fn();
  const onUpdateLocalTemplatePathMock = jest.fn();

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
        availableVersions: [''],
      },
    },
  ];

  const renderComponent = () => {
    return renderWithRecoil(
      <CreateOptions
        fetchReadMe={handleFetchReadMeMock}
        localTemplatePath={''}
        path="create"
        templates={templates}
        onDismiss={handleDismissMock}
        onJumpToOpenModal={handleJumpToOpenModal}
        onNext={handleCreateNextMock}
        onUpdateLocalTemplatePath={onUpdateLocalTemplatePathMock}
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
