// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fireEvent, act } from '@botframework-composer/test-utils';
import React from 'react';

import { renderWithRecoil } from '../../testUtils';
import { ManageService } from '../../../src/components/ManageService/ManageService';

const regions = [{ key: 'westus', text: 'West US' }];
const tiers = [{ key: 'mockedTier', text: 'mockedTier' }];
const serviceName = 'serviceName';
const introtext = 'introtext';
const learnMore = 'learnmore';
const serviceKeyType = 'keytype';
const handoffInstructions = 'handoffInstructions';
const DOWN_ARROW = { keyCode: 40 };

jest.mock('../../../src/utils/auth', () => ({
  decodeToken: () => {
    return {
      upn: 'mockUser@mockDomain.com',
      name: 'mockUser',
      exp: new Date().getTime(),
      tenant: 'mockTenant',
    };
  },
  userShouldProvideTokens: jest.fn(),
  isShowAuthDialog: jest.fn(),
  getTokenFromCache: jest.fn(),
  setTenantId: jest.fn(),
  getTenantIdFromCache: jest.fn(),
  prepareAxios: jest.fn(),
}));

jest.mock('@azure/arm-cognitiveservices', () => ({
  CognitiveServicesManagementClient: function CognitiveServicesManagementClient() {
    return {
      accounts: {
        list: async () => {
          return [
            {
              kind: 'keytype',
              id: '/stuff/resourceGroups/mockedGroup/stuff',
              name: 'mockedAccount',
              location: 'westus',
            },
          ];
        },
        listKeys: async () => {
          return {
            key1: 'mockedKey',
          };
        },
      },
    };
  },
}));

jest.mock('../../../src/components/Auth/AuthDialog', () => ({
  AuthDialog: ({ children, onClick }) => <div />,
}));

jest.mock('../../../src/utils/authClient', () => ({
  AuthClient: {
    getTenants: async () => {
      return [
        {
          displayName: 'mockTenant',
          tenantId: 'mockTenant',
        },
      ];
    },
    getARMTokenForTenant: async () => 'mockToken',
    getAccessToken: async () => 'mockToken',
  },
}));

describe('<ManageService />', () => {
  it('displays correct ui copy', async () => {
    const createService = jest.fn(async () => 'mockedKey');
    const onDismiss = jest.fn();
    const onGetKey = jest.fn();
    const onNext = jest.fn();
    const onToggleVisibility = jest.fn();

    const { baseElement, findByTestId } = renderWithRecoil(
      <ManageService
        createService={createService}
        handoffInstructions={handoffInstructions}
        hidden={false}
        introText={introtext}
        learnMore={learnMore}
        regions={regions}
        serviceKeyType={serviceKeyType}
        serviceName={serviceName}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    // confirm the text of the UI contains the dynamic values
    expect(baseElement).toHaveTextContent(`Set up ${serviceName}`);
    expect(baseElement).toHaveTextContent(introtext);
    const learnmore = await findByTestId('manageservice-learnmore');
    expect(learnmore).toBeDefined();
    expect(learnmore).toHaveAttribute('href', learnMore);
  });

  it('calls close method when closed', async () => {
    const createService = jest.fn(async () => 'mockedKey');
    const onDismiss = jest.fn();
    const onGetKey = jest.fn();
    const onNext = jest.fn();
    const onToggleVisibility = jest.fn();

    const { findByText } = renderWithRecoil(
      <ManageService
        createService={createService}
        handoffInstructions={handoffInstructions}
        hidden={false}
        introText={introtext}
        learnMore={learnMore}
        regions={regions}
        serviceKeyType={serviceKeyType}
        serviceName={serviceName}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    const cancelButton = await findByText('Cancel');
    fireEvent.click(cancelButton);
    expect(onDismiss).toBeCalled();
  });

  it('it should navigate to the selection page', async () => {
    const createService = jest.fn(async () => 'mockedKey');
    const onDismiss = jest.fn();
    const onGetKey = jest.fn();
    const onNext = jest.fn();
    const onToggleVisibility = jest.fn();

    const { baseElement, findByText, findByTestId, findByRole } = renderWithRecoil(
      <ManageService
        createService={createService}
        handoffInstructions={handoffInstructions}
        hidden={false}
        introText={introtext}
        learnMore={learnMore}
        regions={regions}
        serviceKeyType={serviceKeyType}
        serviceName={serviceName}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    // test the default option (choose existing)
    // click the next button, ensure the title changes
    const nextButton = await findByRole('button', { name: 'Next' });
    expect(nextButton).toBeDefined();
    await act(async () => {
      await fireEvent.click(nextButton);
    });

    const subscriptionOption = await findByTestId('service-useexisting-subscription-selection');
    expect(subscriptionOption).toBeDefined();
    expect(subscriptionOption).toBeEnabled();

    expect(baseElement).toHaveTextContent(`Select ${serviceName} resources`);
    expect(baseElement).toHaveTextContent(
      `Choose the subscription where your existing ${serviceName} resource is located.`
    );

    // ensure that since a subscription hasn't been selected
    // this button is disabled
    const nextButton2 = await findByRole('button', { name: 'Next' });
    expect(nextButton2).toBeDefined();
    expect(nextButton2).toBeDisabled();

    // select a subscription
    await act(async () => {
      await fireEvent.keyDown(subscriptionOption, DOWN_ARROW);
    });

    const mySub = await findByText('mockSubscription');
    expect(mySub).toBeDefined();

    await act(async () => {
      await fireEvent.click(mySub);
    });

    // select a resource group
    const resourceOption = await findByTestId('service-useexisting-key-selection');
    expect(resourceOption).toBeDefined();
    expect(resourceOption).toBeEnabled();
    await act(async () => {
      await fireEvent.keyDown(resourceOption, DOWN_ARROW);
    });

    // select the key
    const myKey = await findByText('mockedAccount');
    expect(myKey).toBeDefined();
    await act(async () => {
      await fireEvent.click(myKey);
    });

    // make sure the next button is appropriately enabled
    expect(nextButton2).toBeEnabled();

    // click next
    await act(async () => {
      await fireEvent.click(nextButton2);
    });

    // let promises flush
    await Promise.resolve();

    // ensure that the final callback was called
    expect(onGetKey).toBeCalledWith({
      region: 'westus',
      key: 'mockedKey',
    });
  });

  it('it should navigate to the create page', async () => {
    const createService = jest.fn(async () => 'mockedKey');
    const onDismiss = jest.fn();
    const onGetKey = jest.fn();
    const onNext = jest.fn();
    const onToggleVisibility = jest.fn();

    const { baseElement, findByText, findByTestId, findByRole } = renderWithRecoil(
      <ManageService
        createService={createService}
        handoffInstructions={handoffInstructions}
        hidden={false}
        introText={introtext}
        learnMore={learnMore}
        regions={regions}
        serviceKeyType={serviceKeyType}
        serviceName={serviceName}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    // test the default option (choose existing)
    // change selection
    const createOption = await findByText('Create and configure new Azure resources');
    await act(async () => {
      await fireEvent.click(createOption);
    });

    // click the next button, ensure the title changes
    const nextButton = await findByRole('button', { name: 'Next' });
    expect(nextButton).toBeDefined();
    await act(async () => {
      await fireEvent.click(nextButton);
    });
    expect(baseElement).toHaveTextContent(`Create ${serviceName} resources`);

    // ensure that since a subscription hasn't been selected
    // this button is disabled
    const nextButton2 = await findByRole('button', { name: 'Next' });
    expect(nextButton2).toBeDefined();
    expect(nextButton2).toBeDisabled();

    const subscriptionOption = await findByTestId('service-create-subscription-selection');
    expect(subscriptionOption).toBeDefined();
    expect(subscriptionOption).toBeEnabled();

    // choose subscription
    await act(async () => {
      await fireEvent.keyDown(subscriptionOption, DOWN_ARROW);
    });

    const mySub = await findByText('mockSubscription');
    expect(mySub).toBeDefined();

    await act(async () => {
      await fireEvent.click(mySub);
    });

    // next button should now be enabled
    expect(nextButton2).toBeEnabled();

    await act(async () => {
      await fireEvent.click(nextButton2);
    });

    const nextButton3 = await findByRole('button', { name: 'Next' });
    expect(nextButton3).toBeDefined();
    expect(nextButton3).toBeDisabled();

    const resourceOption = await findByTestId('service-create-resource-selection');
    expect(resourceOption).toBeDefined();
    expect(resourceOption).toBeEnabled();

    const resourceName = await findByTestId('resourceName');
    expect(resourceName).toBeDefined();
    expect(resourceName).toBeEnabled();

    // choose subscription
    await act(async () => {
      await fireEvent.click(resourceOption);
    });

    const myGroup = await findByText('mockedGroup');
    expect(myGroup).toBeDefined();

    await act(async () => {
      await fireEvent.click(myGroup);
      await fireEvent.change(resourceName, { target: { value: 'mockedResource' } });
    });

    // select region
    const regionOption = await findByTestId('rootRegion');
    expect(regionOption).toBeDefined();
    expect(regionOption).toBeEnabled();
    // choose subscription
    await act(async () => {
      await fireEvent.keyDown(regionOption, DOWN_ARROW);
    });

    const myRegion = await findByText('West US');
    expect(myRegion).toBeDefined();

    await act(async () => {
      await fireEvent.click(myRegion);
    });

    expect(nextButton3).toBeEnabled();
    await act(async () => {
      await fireEvent.click(nextButton3);
    });

    // let promises flush
    await Promise.resolve();

    expect(createService).toBeCalledWith(
      expect.anything(),
      'mockSubscription',
      'mockedGroup',
      'mockedResource',
      'westus',
      expect.anything()
    );

    // ensure that the final callback was called
    expect(onGetKey).toBeCalledWith({
      region: 'westus',
      key: 'mockedKey',
    });
  });

  it('it should handle tier option during creation', async () => {
    const createService = jest.fn(async () => 'mockedKey');
    const onDismiss = jest.fn();
    const onGetKey = jest.fn();
    const onNext = jest.fn();
    const onToggleVisibility = jest.fn();

    const { baseElement, findByText, findByTestId, findByRole } = renderWithRecoil(
      <ManageService
        createService={createService}
        handoffInstructions={handoffInstructions}
        hidden={false}
        introText={introtext}
        learnMore={learnMore}
        regions={regions}
        serviceKeyType={serviceKeyType}
        serviceName={serviceName}
        tiers={tiers}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    // test the default option (choose existing)
    // change selection
    const createOption = await findByText('Create and configure new Azure resources');
    await act(async () => {
      await fireEvent.click(createOption);
    });

    // click the next button, ensure the title changes
    const nextButton = await findByRole('button', { name: 'Next' });
    expect(nextButton).toBeDefined();
    await act(async () => {
      await fireEvent.click(nextButton);
    });
    expect(baseElement).toHaveTextContent(`Create ${serviceName} resources`);

    // ensure that since a subscription hasn't been selected
    // this button is disabled
    const nextButton2 = await findByRole('button', { name: 'Next' });
    expect(nextButton2).toBeDefined();
    expect(nextButton2).toBeDisabled();

    const subscriptionOption = await findByTestId('service-create-subscription-selection');
    expect(subscriptionOption).toBeDefined();
    expect(subscriptionOption).toBeEnabled();

    // choose subscription
    await act(async () => {
      await fireEvent.keyDown(subscriptionOption, DOWN_ARROW);
    });

    const mySub = await findByText('mockSubscription');
    expect(mySub).toBeDefined();

    await act(async () => {
      await fireEvent.click(mySub);
    });

    // next button should now be enabled
    expect(nextButton2).toBeEnabled();

    await act(async () => {
      await fireEvent.click(nextButton2);
    });

    const nextButton3 = await findByRole('button', { name: 'Next' });
    expect(nextButton3).toBeDefined();
    expect(nextButton3).toBeDisabled();

    const resourceOption = await findByTestId('service-create-resource-selection');
    expect(resourceOption).toBeDefined();
    expect(resourceOption).toBeEnabled();

    const resourceName = await findByTestId('resourceName');
    expect(resourceName).toBeDefined();
    expect(resourceName).toBeEnabled();

    // choose subscription
    await act(async () => {
      await fireEvent.click(resourceOption);
    });

    const myGroup = await findByText('mockedGroup');
    expect(myGroup).toBeDefined();

    await act(async () => {
      await fireEvent.click(myGroup);
      await fireEvent.change(resourceName, { target: { value: 'mockedResource' } });
    });

    // select region
    const regionOption = await findByTestId('rootRegion');
    expect(regionOption).toBeDefined();
    expect(regionOption).toBeEnabled();
    // choose subscription
    await act(async () => {
      await fireEvent.keyDown(regionOption, DOWN_ARROW);
    });

    const myRegion = await findByText('West US');
    expect(myRegion).toBeDefined();

    await act(async () => {
      await fireEvent.click(myRegion);
    });

    // NEXT BUTTON SHOULD STILL BE DISABLED! need to do tier selection!
    expect(nextButton3).toBeDisabled();

    const tierOption = await findByTestId('tier');
    expect(tierOption).toBeDefined();
    expect(tierOption).toBeEnabled();
    // choose subscription
    await act(async () => {
      await fireEvent.keyDown(tierOption, DOWN_ARROW);
    });

    const myTier = await findByText('mockedTier');
    expect(myTier).toBeDefined();

    await act(async () => {
      await fireEvent.click(myTier);
    });

    // finally the button should now be enabled
    expect(nextButton3).toBeEnabled();

    await act(async () => {
      await fireEvent.click(nextButton3);
    });

    // let promises flush
    await Promise.resolve();

    expect(createService).toBeCalledWith(
      expect.anything(),
      'mockSubscription',
      'mockedGroup',
      'mockedResource',
      'westus',
      'mockedTier'
    );

    // ensure that the final callback was called
    expect(onGetKey).toBeCalledWith({
      region: 'westus',
      key: 'mockedKey',
    });
  });

  it('it should handle tier + dynamic regions option during creation', async () => {
    const createService = jest.fn(async () => 'mockedKey');
    const onDismiss = jest.fn();
    const onGetKey = jest.fn();
    const onNext = jest.fn();
    const onToggleVisibility = jest.fn();

    const { baseElement, findByText, findByTestId, findByRole } = renderWithRecoil(
      <ManageService
        createService={createService}
        handoffInstructions={handoffInstructions}
        hidden={false}
        introText={introtext}
        learnMore={learnMore}
        serviceKeyType={serviceKeyType}
        serviceName={serviceName}
        tiers={tiers}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    // test the default option (choose existing)
    // change selection
    const createOption = await findByText('Create and configure new Azure resources');
    await act(async () => {
      await fireEvent.click(createOption);
    });

    // click the next button, ensure the title changes
    const nextButton = await findByRole('button', { name: 'Next' });
    expect(nextButton).toBeDefined();
    await act(async () => {
      await fireEvent.click(nextButton);
    });
    expect(baseElement).toHaveTextContent(`Create ${serviceName} resources`);

    // ensure that since a subscription hasn't been selected
    // this button is disabled
    const nextButton2 = await findByRole('button', { name: 'Next' });
    expect(nextButton2).toBeDefined();
    expect(nextButton2).toBeDisabled();

    const subscriptionOption = await findByTestId('service-create-subscription-selection');
    expect(subscriptionOption).toBeDefined();
    expect(subscriptionOption).toBeEnabled();

    // choose subscription
    await act(async () => {
      await fireEvent.keyDown(subscriptionOption, DOWN_ARROW);
    });

    const mySub = await findByText('mockSubscription');
    expect(mySub).toBeDefined();

    await act(async () => {
      await fireEvent.click(mySub);
    });

    // next button should now be enabled
    expect(nextButton2).toBeEnabled();

    await act(async () => {
      await fireEvent.click(nextButton2);
    });

    const nextButton3 = await findByRole('button', { name: 'Next' });
    expect(nextButton3).toBeDefined();
    expect(nextButton3).toBeDisabled();

    const resourceOption = await findByTestId('service-create-resource-selection');
    expect(resourceOption).toBeDefined();
    expect(resourceOption).toBeEnabled();

    const resourceName = await findByTestId('resourceName');
    expect(resourceName).toBeDefined();
    expect(resourceName).toBeEnabled();

    // choose subscription
    await act(async () => {
      await fireEvent.click(resourceOption);
    });

    const myGroup = await findByText('mockedGroup');
    expect(myGroup).toBeDefined();

    await act(async () => {
      await fireEvent.click(myGroup);
      await fireEvent.change(resourceName, { target: { value: 'mockedResource' } });
    });

    // select region
    const regionOption = await findByTestId('rootRegion');
    expect(regionOption).toBeDefined();
    expect(regionOption).toBeEnabled();
    // choose subscription
    await act(async () => {
      await fireEvent.keyDown(regionOption, DOWN_ARROW);
    });

    const myRegion = await findByText('West US');
    expect(myRegion).toBeDefined();

    await act(async () => {
      await fireEvent.click(myRegion);
    });

    // NEXT BUTTON SHOULD STILL BE DISABLED! need to do tier selection!
    expect(nextButton3).toBeDisabled();

    const tierOption = await findByTestId('tier');
    expect(tierOption).toBeDefined();
    expect(tierOption).toBeEnabled();
    // choose subscription
    await act(async () => {
      await fireEvent.keyDown(tierOption, DOWN_ARROW);
    });

    const myTier = await findByText('mockedTier');
    expect(myTier).toBeDefined();

    await act(async () => {
      await fireEvent.click(myTier);
    });

    // finally the button should now be enabled
    expect(nextButton3).toBeEnabled();

    await act(async () => {
      await fireEvent.click(nextButton3);
    });

    // let promises flush
    await Promise.resolve();

    expect(createService).toBeCalledWith(
      expect.anything(),
      'mockSubscription',
      'mockedGroup',
      'mockedResource',
      'westus',
      'mockedTier'
    );

    // ensure that the final callback was called
    expect(onGetKey).toBeCalledWith({
      region: 'westus',
      key: 'mockedKey',
    });
  });

  it('it should show handoff instructions', async () => {
    const createService = jest.fn();
    const onDismiss = jest.fn();
    const onGetKey = jest.fn();
    const onNext = jest.fn();
    const onToggleVisibility = jest.fn();

    const { baseElement, findByText, findByRole } = renderWithRecoil(
      <ManageService
        createService={createService}
        handoffInstructions={handoffInstructions}
        hidden={false}
        introText={introtext}
        learnMore={learnMore}
        regions={regions}
        serviceKeyType={serviceKeyType}
        serviceName={serviceName}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    // test the default option (choose existing)
    // change selection
    const generateOption = await findByText('Generate instructions for Azure administrator');
    await act(async () => {
      await fireEvent.click(generateOption);
    });

    // click the next button, ensure the title changes
    const nextButton = await findByRole('button', { name: 'Next' });
    expect(nextButton).toBeDefined();
    await act(async () => {
      await fireEvent.click(nextButton);
    });

    expect(baseElement).toHaveTextContent(
      `I am creating a conversational experience using Microsoft Bot Framework project.`
    );
    expect(baseElement).toHaveTextContent(handoffInstructions);
  });
});
