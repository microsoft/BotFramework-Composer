// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, Fragment } from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { useRecoilValue } from 'recoil';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { TokenCredentials } from '@azure/ms-rest-js';
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { SearchManagementClient } from '@azure/arm-search';
import { ResourceManagementClient } from '@azure/arm-resources';
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { ProvisionHandoff } from '@bfc/ui-shared';

import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { armScopes } from '../../constants';
import { getTokenFromCache, isShowAuthDialog, userShouldProvideTokens } from '../../utils/auth';
import { dispatcherState } from '../../recoilModel/atoms';

type ManageQNAProps = {
  hidden: boolean;
  setDisplayManageQna: (value: any) => void;
  onDismiss: () => void;
  onGetKey: (settings: { subscriptionKey: string }) => void;
  onNext?: () => void;
};

type KeyRec = {
  name: string;
  region: string;
  resourceGroup: string;
  key: string;
};

// QnA is only available in westus
const QNA_REGIONS = [{ key: 'westus', text: 'westus' }];

const dropdownStyles = { dropdown: { width: '100%' } };
const summaryLabelStyles = { display: 'block', color: '#605E5C', fontSize: '14' };
const summaryStyles = { background: '#F3F2F1', padding: '1px 1rem' };
const mainElementStyle = { marginBottom: 20 };
const CREATE_NEW_KEY = 'CREATE_NEW';

const handoffInstructions = formatMessage(
  'Using the Azure portal, create a Language Understanding resource. Create these in a subscription that the developer has accesss to. This will result in an authoring key and an endpoint key.  Provide these keys to the developer in a secure manner.'
);

export const ManageQNA = (props: ManageQNAProps) => {
  const [localRootQNAKey, setLocalRootQNAKey] = useState<string>('');

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [token, setToken] = useState<string | undefined>();

  const { setApplicationLevelError } = useRecoilValue(dispatcherState);
  const [subscriptionId, setSubscription] = useState<string>('');
  const [resourceGroups, setResourceGroups] = useState<any[]>([]);
  const [createResourceGroup, setCreateResourceGroup] = useState<boolean>(false);
  const [newResourceGroupName, setNewResourceGroupName] = useState<string>('');
  const [resourceGroupKey, setResourceGroupKey] = useState<string>('');
  const [resourceGroup, setResourceGroup] = useState<string>('');

  const [showHandoff, setShowHandoff] = useState<boolean>(false);
  const [qnaResourceName, setQNAResourceName] = useState<string>('');
  const [loadingQNA, setLoadingQNA] = useState<boolean>(false);
  const [noKeys, setNoKeys] = useState<boolean>(false);
  const [nextAction, setNextAction] = useState<string>('create');
  const [actionOptions, setActionOptions] = useState<IChoiceGroupOption[]>([]);
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [qnaKeys, setQNAKeys] = useState<KeyRec[]>([]);
  const [localRootQNARegion, setLocalRootQNARegion] = useState<string>('westus');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [outcomeDescription, setOutcomeDescription] = useState<string>('');
  const [outcomeSummary, setOutcomeSummary] = useState<any>();
  const [outcomeError, setOutcomeError] = useState<boolean>(false);

  /* Copied from Azure Publishing extension */
  const getSubscriptions = async (token: string): Promise<Array<Subscription>> => {
    const tokenCredentials = new TokenCredentials(token);
    try {
      const subscriptionClient = new SubscriptionClient(tokenCredentials);
      const subscriptionsResult = await subscriptionClient.subscriptions.list();
      // eslint-disable-next-line no-underscore-dangle
      return subscriptionsResult._response.parsedBody;
    } catch (err) {
      setApplicationLevelError(err);
      return [];
    }
  };

  const hasAuth = async () => {
    let newtoken = '';
    if (userShouldProvideTokens()) {
      if (isShowAuthDialog(false)) {
        setShowAuthDialog(true);
      }
      newtoken = getTokenFromCache('accessToken');
    } else {
      newtoken = await AuthClient.getAccessToken(armScopes);
    }

    setToken(newtoken);

    if (newtoken) {
      // reset the list
      setAvailableSubscriptions([]);

      // fetch list of available subscriptions
      setAvailableSubscriptions(await getSubscriptions(newtoken));
    }
  };

  useEffect(() => {
    // reset the ui
    setSubscription('');
    setQNAKeys([]);
    setCurrentPage(1);
    setActionOptions([
      { key: 'create', text: formatMessage('Create a new QnA MAker resource'), disabled: true },
      { key: 'handoff', text: formatMessage('Generate a resource request'), disabled: true },
      { key: 'choose', text: formatMessage('Choose from existing'), disabled: true },
    ]);
    if (!props.hidden) {
      hasAuth();
    }
  }, [props.hidden]);

  const handleRootQNARegionOnChange = (e, value: IDropdownOption | undefined) => {
    if (value != null) {
      setLocalRootQNARegion(value.key as string);
    } else {
      setLocalRootQNARegion('');
    }
  };

  const fetchKeys = async (cognitiveServicesManagementClient, accounts) => {
    const keyList: KeyRec[] = [];
    for (const account in accounts) {
      const resourceGroup = accounts[account].id?.replace(/.*?\/resourceGroups\/(.*?)\/.*/, '$1');
      const name = accounts[account].name;
      if (resourceGroup && name) {
        const keys = await cognitiveServicesManagementClient.accounts.listKeys(resourceGroup, name);
        if (keys?.key1) {
          keyList.push({
            name: name,
            resourceGroup: resourceGroup,
            region: accounts[account].location || '',
            key: keys?.key1 || '',
          });
        }
      }
    }
    return keyList;
  };

  const fetchQNA = async (subscriptionId) => {
    if (token) {
      setLoadingQNA(true);
      setNoKeys(false);
      const tokenCredentials = new TokenCredentials(token);
      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);
      const accounts = await cognitiveServicesManagementClient.accounts.list();

      const keys: KeyRec[] = await fetchKeys(
        cognitiveServicesManagementClient,
        accounts.filter((a) => a.kind === 'QnAMaker')
      );
      setLoadingQNA(false);
      if (keys.length == 0) {
        setNoKeys(true);
        setActionOptions([
          { key: 'create', text: formatMessage('Create a new QnA Maker resource') },
          { key: 'handoff', text: formatMessage('Generate a resource request'), disabled: false },
          { key: 'choose', text: formatMessage('Choose from existing'), disabled: true },
        ]);
      } else {
        setNoKeys(false);
        setQNAKeys(keys);
        setActionOptions([
          { key: 'create', text: formatMessage('Create a new QnA Maker resource') },
          { key: 'handoff', text: formatMessage('Generate a resource request'), disabled: false },
          { key: 'choose', text: formatMessage('Choose from existing'), disabled: false },
        ]);
      }
    }
  };

  const fetchResourceGroups = async (subscriptionId) => {
    if (token) {
      const tokenCredentials = new TokenCredentials(token);
      const resourceClient = new ResourceManagementClient(tokenCredentials, subscriptionId);
      const groups = await resourceClient.resourceGroups.list();

      setResourceGroups([
        {
          id: CREATE_NEW_KEY,
          data: { icon: 'Add' },
          name: formatMessage('Create new'),
        },
        ...groups,
      ]);
    }
  };

  const createQNA = async () => {
    let qnaKey = '';
    if (token) {
      setLoadingQNA(true);
      const tokenCredentials = new TokenCredentials(token);

      const resourceGroupName = resourceGroupKey === CREATE_NEW_KEY ? newResourceGroupName : resourceGroup;
      if (resourceGroupKey === CREATE_NEW_KEY) {
        try {
          const resourceClient = new ResourceManagementClient(tokenCredentials, subscriptionId);
          await resourceClient.resourceGroups.createOrUpdate(resourceGroupName, {
            location: localRootQNARegion,
          });
        } catch (err) {
          setOutcomeDescription(
            formatMessage(
              'Due to the following error, we were unable to successfully add your selected QnA keys to your bot project:'
            )
          );
          setOutcomeSummary(<p>{err.message}</p>);
          setOutcomeError(true);
          setCurrentPage(3);
          setLoadingQNA(false);
          return;
        }
      }

      try {
        const qnaMakerSearchName = `${qnaResourceName}-search`.toLowerCase().replace('_', '');
        const qnaMakerWebAppName = `${qnaResourceName}-qnahost`.toLowerCase().replace('_', '');
        const qnaMakerServiceName = `${qnaResourceName}-qna`;

        const searchManagementClient = new SearchManagementClient(tokenCredentials as any, subscriptionId);
        await searchManagementClient.services.createOrUpdate(resourceGroupName, qnaMakerSearchName, {
          location: localRootQNARegion,
          sku: {
            name: 'standard',
          },
          replicaCount: 1,
          partitionCount: 1,
          hostingMode: 'default',
        });

        const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, subscriptionId);
        await webSiteManagementClient.appServicePlans.createOrUpdate(resourceGroupName, resourceGroupName, {
          location: localRootQNARegion,
          sku: {
            name: 'S1',
            tier: 'Standard',
            size: 'S1',
            family: 'S',
            capacity: 1,
          },
        });
        // deploy or update exisiting app insights component
        const applicationInsightsManagementClient = new ApplicationInsightsManagementClient(
          tokenCredentials,
          subscriptionId
        );
        await applicationInsightsManagementClient.components.createOrUpdate(resourceGroupName, resourceGroupName, {
          location: localRootQNARegion,
          applicationType: 'web',
          kind: 'web',
        });
        // deploy qna host webapp
        const webAppResult = await webSiteManagementClient.webApps.createOrUpdate(
          resourceGroupName,
          qnaMakerWebAppName,
          {
            name: qnaMakerWebAppName,
            serverFarmId: resourceGroupName,
            location: localRootQNARegion,
            siteConfig: {
              cors: {
                allowedOrigins: ['*'],
              },
            },
            enabled: true,
          }
        );

        // add web config for websites
        const azureSearchAdminKey = (await searchManagementClient.adminKeys.get(resourceGroupName, qnaMakerSearchName))
          .primaryKey;
        const appInsightsComponent = await applicationInsightsManagementClient.components.get(
          resourceGroupName,
          resourceGroupName
        );
        const userAppInsightsKey = appInsightsComponent.instrumentationKey;
        const userAppInsightsName = resourceGroupName;
        const userAppInsightsAppId = appInsightsComponent.appId;
        const primaryEndpointKey = `${qnaMakerWebAppName}-PrimaryEndpointKey`;
        const secondaryEndpointKey = `${qnaMakerWebAppName}-SecondaryEndpointKey`;
        const defaultAnswer = 'No good match found in KB.';
        const QNAMAKER_EXTENSION_VERSION = 'latest';

        await webSiteManagementClient.webApps.createOrUpdateConfiguration(resourceGroupName, qnaMakerWebAppName, {
          appSettings: [
            {
              name: 'AzureSearchName',
              value: qnaMakerSearchName,
            },
            {
              name: 'AzureSearchAdminKey',
              value: azureSearchAdminKey,
            },
            {
              name: 'UserAppInsightsKey',
              value: userAppInsightsKey,
            },
            {
              name: 'UserAppInsightsName',
              value: userAppInsightsName,
            },
            {
              name: 'UserAppInsightsAppId',
              value: userAppInsightsAppId,
            },
            {
              name: 'PrimaryEndpointKey',
              value: primaryEndpointKey,
            },
            {
              name: 'SecondaryEndpointKey',
              value: secondaryEndpointKey,
            },
            {
              name: 'DefaultAnswer',
              value: defaultAnswer,
            },
            {
              name: 'QNAMAKER_EXTENSION_VERSION',
              value: QNAMAKER_EXTENSION_VERSION,
            },
          ],
        });

        // Create qna account
        const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(
          tokenCredentials,
          subscriptionId
        );
        await cognitiveServicesManagementClient.accounts.create(resourceGroupName, qnaMakerServiceName, {
          kind: 'QnAMaker',
          sku: {
            name: 'S0',
          },
          location: localRootQNARegion,
          properties: {
            apiProperties: {
              qnaRuntimeEndpoint: `https://${webAppResult.hostNames?.[0]}`,
            },
          },
        });

        const keys = await cognitiveServicesManagementClient.accounts.listKeys(resourceGroupName, qnaMakerServiceName);
        if (!keys?.key1) {
          throw new Error('No key found for newly created authoring resource');
        } else {
          qnaKey = keys.key1;
          setLocalRootQNAKey(keys.key1);
        }
      } catch (err) {
        setOutcomeDescription(
          formatMessage(
            'Due to the following error, we were unable to successfully add your selected LUIS keys to your bot project:'
          )
        );
        setOutcomeSummary(<p>{err.message}</p>);
        setOutcomeError(true);
        setCurrentPage(3);
        setLoadingQNA(false);
        return;
      }

      setLoadingQNA(false);

      setOutcomeDescription(
        formatMessage('The following LUIS resource was successfully created and added to your bot project:')
      );
      setOutcomeSummary(
        <div>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Subscription')}</label>
            {subscriptionId}
          </p>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Resource Group')}</label>
            {resourceGroupName}
          </p>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Region')}</label>
            {localRootQNARegion}
          </p>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Resource name')}</label>
            {qnaResourceName}
          </p>
        </div>
      );
      setOutcomeError(false);

      // ALL DONE!
      // this will pass the new values back to the caller
      props.onGetKey({
        subscriptionKey: qnaKey,
      });

      setCurrentPage(3);
    }
  };

  // allow a user to provide a subscription id if one is missing
  const onChangeSubscription = async (_, opt) => {
    // get list of qna keys for this subscription
    setSubscription(opt.key);
    fetchQNA(opt.key);
    fetchResourceGroups(opt.key);
  };

  const onChangeQNAKey = async (_, opt) => {
    // get list of luis keys for this subscription
    setLocalRootQNAKey(opt.key);
  };

  const onChangeAction = async (_, opt) => {
    setNextAction(opt.key);
  };

  const onChangeResourceGroup = async (_, opt) => {
    setResourceGroupKey(opt.key);
    setResourceGroup(opt.text);
    if (opt.key === CREATE_NEW_KEY) {
      setCreateResourceGroup(true);
    } else {
      setCreateResourceGroup(false);
    }
  };

  const performNextAction = () => {
    if (nextAction === 'choose') {
      props.onGetKey({
        subscriptionKey: localRootQNAKey,
      });
      setOutcomeDescription(formatMessage('The following QnA key has been successfully added to your bot project:'));
      setOutcomeSummary(
        <div>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Key')}</label>
            {localRootQNAKey}
          </p>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Region')}</label>
            {localRootQNARegion}
          </p>
        </div>
      );
      setOutcomeError(false);

      setCurrentPage(3);
    } else if (nextAction === 'handoff') {
      setShowHandoff(true);
      props.onDismiss();
    } else {
      setCurrentPage(2);
    }
  };

  const iconStyles = { marginRight: '8px' };
  const onRenderOption = (option) => {
    return (
      <div>
        {option.data && option.data.icon && (
          <Icon aria-hidden="true" iconName={option.data.icon} style={iconStyles} title={option.data.icon} />
        )}
        <span>{option.text}</span>
      </div>
    );
  };

  return (
    <Fragment>
      {showAuthDialog && (
        <AuthDialog
          needGraph={false}
          next={hasAuth}
          onDismiss={() => {
            setShowAuthDialog(false);
          }}
        />
      )}
      <ProvisionHandoff
        developerInstructions={formatMessage(
          'Copy and share this information with your Azure admin. After your QNA key is provisioned, you will be ready to test your bot with qna.'
        )}
        handoffInstructions={handoffInstructions}
        hidden={!showHandoff}
        title={formatMessage('Share resource request')}
        onBack={() => {
          setShowHandoff(false);
          props.setDisplayManageQna(true);
        }}
        onDismiss={() => setShowHandoff(false)}
      />
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: currentPage === 2 ? formatMessage('Create new QNA resources') : formatMessage('Select QNA keys'),
        }}
        hidden={props.hidden}
        minWidth={480}
        modalProps={{
          isBlocking: false,
        }}
        onDismiss={props.onDismiss}
      >
        <div>
          {currentPage === 1 && (
            <div>
              <p>
                {formatMessage(
                  'Select your Azure subscription and choose from existing QNA keys, or create a new QNA resource. Learn more'
                )}
              </p>
              <div css={mainElementStyle}>
                <Dropdown
                  disabled={!(availableSubscriptions?.length > 0)}
                  label={formatMessage('Select subscription')}
                  options={
                    availableSubscriptions
                      ?.filter((p) => p.subscriptionId && p.displayName)
                      .map((p) => {
                        return { key: p.subscriptionId ?? '', text: p.displayName ?? 'Unnamed' };
                      }) ?? []
                  }
                  placeholder={formatMessage('Select one')}
                  selectedKey={subscriptionId}
                  styles={dropdownStyles}
                  onChange={onChangeSubscription}
                />
              </div>
              <div css={mainElementStyle}>
                {subscriptionId && (
                  <ChoiceGroup options={actionOptions} selectedKey={nextAction} onChange={onChangeAction} />
                )}

                <div style={{ marginLeft: 26 }}>
                  {noKeys && subscriptionId && (
                    <span style={{ color: 'rgb(161, 159, 157)' }}>
                      {formatMessage(
                        'No existing QNA resource found in this subscription. Click “Next” to create new.'
                      )}
                    </span>
                  )}
                  {!noKeys && subscriptionId && (
                    <div>
                      <Dropdown
                        disabled={!(qnaKeys?.length > 0) || nextAction !== 'choose'}
                        label={formatMessage('QnA Maker key')}
                        options={
                          qnaKeys.map((p) => {
                            return { text: p.name, ...p };
                          }) ?? []
                        }
                        placeholder={formatMessage('Select one')}
                        styles={dropdownStyles}
                        onChange={onChangeQNAKey}
                      />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                {loadingQNA && (
                  <Spinner label="Loading keys..." labelPosition="right" styles={{ root: { float: 'left' } }} />
                )}
                <PrimaryButton
                  disabled={
                    loadingQNA ||
                    (nextAction === 'choose' && !localRootQNAKey) ||
                    (nextAction === 'create' && !subscriptionId)
                  }
                  text={formatMessage('Next')}
                  onClick={performNextAction}
                />
                <DefaultButton
                  disabled={loadingQNA || showAuthDialog}
                  text={formatMessage('Cancel')}
                  onClick={props.onDismiss}
                />
              </DialogFooter>
            </div>
          )}
          {currentPage === 2 && (
            <div>
              <div css={mainElementStyle}>
                <p>
                  {formatMessage(
                    'Input your details below to create a new QNA resource. You will be able to manage your new resource in the Azure portal. Learn more'
                  )}
                </p>
                <Dropdown
                  disabled={resourceGroups.length === 0}
                  label={formatMessage('Resource group:')}
                  options={
                    resourceGroups.map((p) => {
                      return { key: p.id, text: p.name, data: p.data };
                    }) ?? []
                  }
                  placeholder={formatMessage('Select one')}
                  selectedKey={resourceGroupKey}
                  styles={dropdownStyles}
                  onChange={onChangeResourceGroup}
                  onRenderOption={onRenderOption}
                />
                {createResourceGroup && (
                  <TextField
                    required
                    aria-label={formatMessage('Resource group name')}
                    data-testid={'qnaResourceGroupName'}
                    id={'qnaResourceGroupName'}
                    label={formatMessage('Resource group name')}
                    placeholder={formatMessage('Enter name for new resource group')}
                    styles={{ root: { marginTop: 10 } }}
                    value={newResourceGroupName}
                    onChange={(e, val) => {
                      setNewResourceGroupName(val || '');
                    }}
                  />
                )}
                <Dropdown
                  required
                  aria-label={formatMessage('QnA region')}
                  data-testid={'rootqnaRegion'}
                  id={'qnaRegion'}
                  label={formatMessage('QnA region')}
                  options={QNA_REGIONS}
                  placeholder={formatMessage('Enter QnA region')}
                  selectedKey={localRootQNARegion}
                  styles={dropdownStyles}
                  onChange={handleRootQNARegionOnChange}
                />
                <TextField
                  required
                  aria-label={formatMessage('Resource name')}
                  data-testid={'qnaResourceName'}
                  id={'qnaResourceName'}
                  label={formatMessage('Resource name')}
                  placeholder={formatMessage('Enter name for new QnA resources')}
                  styles={{ root: { marginTop: 10 } }}
                  value={qnaResourceName}
                  onChange={(e, val) => setQNAResourceName(val || '')}
                />
              </div>
              <DialogFooter>
                <DefaultButton text={formatMessage('Back')} onClick={() => setCurrentPage(1)} />
                <PrimaryButton
                  disabled={
                    !qnaResourceName ||
                    !resourceGroupKey ||
                    (resourceGroupKey == CREATE_NEW_KEY && !newResourceGroupName)
                  }
                  text={formatMessage('Next')}
                  onClick={createQNA}
                />
                <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
              </DialogFooter>
            </div>
          )}
          {currentPage === 3 && (
            <div>
              <p>{outcomeDescription}</p>
              <div css={summaryStyles}>{outcomeSummary}</div>
              {outcomeError && (
                <p>
                  {formatMessage(
                    'If you would like to try again, or select from existing resources, please click “Back”.'
                  )}
                </p>
              )}
              <DialogFooter>
                {outcomeError && <DefaultButton text={formatMessage('Back')} onClick={() => setCurrentPage(1)} />}
                <PrimaryButton text={formatMessage('Done')} onClick={props.onNext} />
              </DialogFooter>
            </div>
          )}
        </div>
      </Dialog>
    </Fragment>
  );
};
