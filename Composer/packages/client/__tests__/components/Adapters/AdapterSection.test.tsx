// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import AdapterSection from '../../../src/pages/botProject/adapters/AdapterSection';
import { renderWithRecoil } from '../../testUtils/renderWithRecoil';

const mockProjId = '123';
// jest.mock('../../../src/pages/botProject/adapters/ABSChannels', () => 'mock ABSChannel component');

const mockNavigationTo = jest.fn();
jest.mock('../../../src/utils/navigation', () => ({
  navigateTo: (...args) => mockNavigationTo(...args),
}));
describe('<AdapterSection />', () => {
  function renderComponent() {
    return renderWithRecoil(<AdapterSection projectId={mockProjId} />);
  }

  it('should render the component', async () => {
    const component = renderComponent();
    const containerNode = await component.queryByTestId('adapterSectionContainer');
    expect(containerNode).toBeTruthy();
  });

  it('deep link should nav to package manager', async () => {
    const { getByText } = renderComponent();

    fireEvent.click(getByText('package manager'));

    expect(mockNavigationTo).toHaveBeenCalledWith(`/bot/${mockProjId}/plugin/package-manager/package-manager`);
  });
});
