// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { TeamsManifestGeneratorModal } from '../../../src/components/Adapters/TeamsManifestGeneratorModal';
import { renderWithRecoil } from '../../testUtils/renderWithRecoil';

const mockAppId = '123';
const mockDisplayName = 'mockDisplayName';

describe('<TeamsManifestGenerator />', async () => {
  function renderComponent() {
    return renderWithRecoil(
      <TeamsManifestGeneratorModal
        botAppId={mockAppId}
        botDisplayName={mockDisplayName}
        hidden={false}
        onDismiss={jest.fn()}
      />
    );
  }

  it('should render the component', async () => {
    const component = renderComponent();
    const downloadBtn = await component.queryByTestId('teamsDownloadIcon');
    expect(downloadBtn).toBeTruthy();
  });

  it('should render valid json teams manifest with dynamic values', async () => {
    const component = renderComponent();

    const textField = await component.queryByTestId('teamsManifestTextField');
    const manifestString = (textField as HTMLTextAreaElement).value;
    const manifestObj = JSON.parse(manifestString);
    expect(manifestObj).toBeTruthy();
    expect(manifestObj.name.short).toBe(mockDisplayName);
    expect(manifestObj.name.full).toBe(mockDisplayName);
    expect(manifestObj.bots[0].botId).toBe(mockAppId);
    expect(manifestObj.id).toBeTruthy();
    expect(manifestObj.packageName).toBe(mockDisplayName);
    expect(manifestObj.description.short).toBe(`short description for ${mockDisplayName}`);
    expect(manifestObj.description.full).toBe(`full description for ${mockDisplayName}`);

    const checkedLuis = await component.queryByTestId('teamsDownloadIcon');
    expect(checkedLuis).toBeTruthy();
  });
});
