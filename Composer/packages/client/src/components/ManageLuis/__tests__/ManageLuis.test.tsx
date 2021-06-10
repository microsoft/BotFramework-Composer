// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fireEvent, act } from '@botframework-composer/test-utils';
import React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils';
import { ManageLuis } from '../ManageLuis';

const serviceName = 'Language Understanding';
const DOWN_ARROW = { keyCode: 40 };

// token creds
jest.mock('@azure/ms-rest-js');

jest.mock('@azure/arm-resources', () => ({
  ResourceManagementClient: () => {
    return {
      resourceGroups: {
        list: async () => {
          return [
            {
              id: 'mockedGroup',
              name: 'mockedGroup',
              region: 'westus',
            },
          ];
        },
      },
    };
  },
}));

jest.mock('@azure/arm-cognitiveservices', () => ({
  CognitiveServicesManagementClient: () => {
    return {
      accounts: {
        create: async () => {},
        list: async () => {
          return [
            {
              kind: 'LUIS.Authoring',
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

// subscription client
jest.mock('@azure/arm-subscriptions', () => ({
  SubscriptionClient: () => {
    return {
      subscriptions: {
        list: async () => {
          return {
            _response: {
              parsedBody: [
                {
                  subscriptionId: 'mockSubscription',
                  displayName: 'mockSubscription',
                },
              ],
            },
          };
        },
        listLocations: async () => {
          return [{ name: 'westus', displayName: 'West US' }];
        },
      },
    };
  },
}));

jest.mock('../../../components/Auth/AuthDialog', () => ({
  AuthDialog: ({ children, onClick }) => <div />,
}));

jest.mock('../../../utils/authClient', () => ({
  AuthClient: {
    getTenants: async () => {
      return [
        {
          displayName: 'mockTenant',
          tenantId: 'mockTenant',
        },
      ];
    },
    getARMTokenForTenant: async () => 'armtoken',
  },
}));

jest.mock('../../../utils/auth');

const onDismiss = jest.fn();
const onGetKey = jest.fn();
const onNext = jest.fn();
const onToggleVisibility = jest.fn();

describe('<ManageLuis />', () => {
  it('displays correct ui copy', async () => {
    const { baseElement } = renderWithRecoil(
      <ManageLuis
        hidden={false}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    // confirm the text of the UI contains the dynamic values
    expect(baseElement).toHaveTextContent(`Set up ${serviceName}`);
  });

  it('calls close method when closed', async () => {
    const { findByText } = renderWithRecoil(
      <ManageLuis
        hidden={false}
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
    const { baseElement, findByText, findByTestId } = renderWithRecoil(
      <ManageLuis
        hidden={false}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    // test the default option (choose existing)
    // click the next button, ensure the title changes
    const nextButton = await findByText('Next');
    expect(nextButton).toBeDefined();
    await act(async () => {
      await fireEvent.click(nextButton);
    });

    const tenantOption = await findByTestId('service-useexisting-tenant-selection');
    expect(tenantOption).toBeDefined();
    expect(tenantOption).toBeEnabled();

    const subscriptionOption = await findByTestId('service-useexisting-subscription-selection');
    expect(subscriptionOption).toBeDefined();
    expect(subscriptionOption).toBeEnabled();

    expect(baseElement).toHaveTextContent(`Select ${serviceName} resources`);
    expect(baseElement).toHaveTextContent(
      `Select your Azure directory, then choose the subscription where your existing ${serviceName} resource is located.`
    );

    // ensure that since a subscription hasn't been selected
    // this button is disabled
    const nextButton2 = await findByText('Next');
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

    // ensure that the final callback was called
    expect(onGetKey).toBeCalledWith({
      region: 'westus',
      key: 'mockedKey',
    });
  });

  it('it should navigate to the create page', async () => {
    const { baseElement, findByText, findByTestId } = renderWithRecoil(
      <ManageLuis
        hidden={false}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    // test the default option (choose existing)
    // change selection
    const createOption = await findByText('Create and configure new Azure resources');
    fireEvent.click(createOption);

    // click the next button, ensure the title changes
    const nextButton = await findByText('Next');
    expect(nextButton).toBeDefined();
    await act(async () => {
      await fireEvent.click(nextButton);
    });
    expect(baseElement).toHaveTextContent(`Create ${serviceName} resources`);

    // ensure that since a subscription hasn't been selected
    // this button is disabled
    const nextButton2 = await findByText('Next');
    expect(nextButton2).toBeDefined();
    expect(nextButton2).toBeDisabled();

    const tenantOption = await findByTestId('service-create-tenant-selection');
    expect(tenantOption).toBeDefined();
    expect(tenantOption).toBeEnabled();

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

    const nextButton3 = await findByText('Next');
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

    // ensure that the final callback was called
    expect(onGetKey).toBeCalledWith({
      region: 'westus',
      key: 'mockedKey',
    });
  });

  it('it should show handoff instructions', async () => {
    const { baseElement, findByText } = renderWithRecoil(
      <ManageLuis
        hidden={false}
        onDismiss={onDismiss}
        onGetKey={onGetKey}
        onNext={onNext}
        onToggleVisibility={onToggleVisibility}
      />
    );

    // test the default option (choose existing)
    // change selection
    const generateOption = await findByText('Generate instructions for Azure administrator');
    fireEvent.click(generateOption);

    // click the next button, ensure the title changes
    const nextButton = await findByText('Next');
    expect(nextButton).toBeDefined();
    await act(async () => {
      await fireEvent.click(nextButton);
    });

    expect(baseElement).toHaveTextContent(
      `I am creating a conversational experience using Microsoft Bot Framework project.`
    );
  });
});
