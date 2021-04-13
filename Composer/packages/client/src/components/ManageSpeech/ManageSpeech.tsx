// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect, Fragment } from 'react';
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
import { ResourceManagementClient } from '@azure/arm-resources';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { ProvisionHandoff } from '@bfc/ui-shared';

import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../Auth/AuthDialog';
import { armScopes } from '../../constants';
import { getTokenFromCache, isShowAuthDialog, userShouldProvideTokens } from '../../utils/auth';
import { dispatcherState } from '../../recoilModel/atoms';

type ManageSpeechProps = {
  hidden: boolean;
  onDismiss: () => void;
  setVisibility: (visible: boolean) => void;
  onGetKey: (settings: { subscriptionKey: string; region: string }) => void;
  onNext?: () => void;
};

type KeyRec = {
  name: string;
  region: string;
  resourceGroup: string;
  key: string;
};

const dropdownStyles = { dropdown: { width: '100%' } };
const summaryLabelStyles = { display: 'block', color: '#605E5C', fontSize: 14 };
const summaryStyles = { background: '#F3F2F1', padding: '1px 1rem' };
const mainElementStyle = { marginBottom: 20 };
const CREATE_NEW_KEY = 'CREATE_NEW';
const iconStyles = { marginRight: '8px' };

export const ManageSpeech = (props: ManageSpeechProps) => {
  const [localKey, setLocalKey] = useState<string>('');

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [token, setToken] = useState<string | undefined>();

  const { setApplicationLevelError } = useRecoilValue(dispatcherState);
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [resourceGroups, setResourceGroups] = useState<any[]>([]);
  const [createResourceGroup, setCreateResourceGroup] = useState<boolean>(false);
  const [newResourceGroupName, setNewResourceGroupName] = useState<string>('');
  const [resourceGroupKey, setResourceGroupKey] = useState<string>('');
  const [resourceGroup, setResourceGroup] = useState<string>('');
  const [locationList, setLocationList] = useState<{ key: string; text: string }[]>([]);

  const [showHandoff, setShowHandoff] = useState<boolean>(false);
  const [resourceName, setResourceName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [noKeys, setNoKeys] = useState<boolean>(false);
  const [nextAction, setNextAction] = useState<string>('create');
  const [actionOptions, setActionOptions] = useState<IChoiceGroupOption[]>([]);
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [keys, setKeys] = useState<KeyRec[]>([]);
  const [localRegion, setLocalRegion] = useState<string>('westus');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [outcomeDescription, setOutcomeDescription] = useState<string>('');
  const [outcomeSummary, setOutcomeSummary] = useState<React.ReactNode>();
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
    setSubscriptionId('');
    setKeys([]);
    setCurrentPage(1);
    setActionOptions([
      { key: 'create', text: formatMessage('Create a new Speech resource'), disabled: true },
      { key: 'handoff', text: formatMessage('Handoff to admin'), disabled: true },
      { key: 'choose', text: formatMessage('Choose from existing'), disabled: true },
    ]);
    if (!props.hidden) {
      hasAuth();
    }
  }, [props.hidden]);

  const handleRegionOnChange = (e, value?: IDropdownOption) => {
    if (value) {
      setLocalRegion(value.key as string);
    } else {
      setLocalRegion('');
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

  const fetchAccounts = async (subscriptionId) => {
    if (token) {
      setLoading(true);
      setNoKeys(false);
      const tokenCredentials = new TokenCredentials(token);
      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);
      const accounts = await cognitiveServicesManagementClient.accounts.list();

      const keys: KeyRec[] = await fetchKeys(
        cognitiveServicesManagementClient,
        accounts.filter((a) => a.kind === 'SpeechServices')
      );
      setLoading(false);
      if (keys.length === 0) {
        setNoKeys(true);
        setActionOptions([
          { key: 'create', text: formatMessage('Create a new Speech resource') },
          { key: 'handoff', text: formatMessage('Handoff to admin'), disabled: false },
          { key: 'choose', text: formatMessage('Choose from existing'), disabled: true },
        ]);
      } else {
        setNoKeys(false);
        setKeys(keys);
        setActionOptions([
          { key: 'create', text: formatMessage('Create a new Speech resource') },
          { key: 'handoff', text: formatMessage('Handoff to admin'), disabled: false },
          { key: 'choose', text: formatMessage('Choose from existing'), disabled: false },
        ]);
      }
    }
  };

  const fetchLocations = async (subscriptionId) => {
    if (token) {
      const tokenCredentials = new TokenCredentials(token);
      const subscriptionClient = new SubscriptionClient(tokenCredentials);
      const locations = await subscriptionClient.subscriptions.listLocations(subscriptionId);
      setLocationList(
        locations.map((location) => {
          return { key: location.name || '', text: location.displayName || '' };
        })
      );
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

  const createResources = async () => {
    let key = '';
    const serviceName = `${resourceName}`;

    if (token) {
      setLoading(true);
      const tokenCredentials = new TokenCredentials(token);

      const resourceGroupName = resourceGroupKey === CREATE_NEW_KEY ? newResourceGroupName : resourceGroup;
      if (resourceGroupKey === CREATE_NEW_KEY) {
        try {
          const resourceClient = new ResourceManagementClient(tokenCredentials, subscriptionId);
          await resourceClient.resourceGroups.createOrUpdate(resourceGroupName, {
            location: localRegion,
          });
        } catch (err) {
          setOutcomeDescription(
            formatMessage(
              'Due to the following error, we were unable to successfully add your selected Speech keys to your bot project:'
            )
          );
          setOutcomeSummary(<p>{err.message}</p>);
          setOutcomeError(true);
          setCurrentPage(3);
          setLoading(false);
          return;
        }
      }

      try {
        const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(
          tokenCredentials,
          subscriptionId
        );
        await cognitiveServicesManagementClient.accounts.create(resourceGroupName, serviceName, {
          kind: 'SpeechServices',
          sku: {
            name: 'S0',
          },
          location: localRegion,
        });

        const keys = await cognitiveServicesManagementClient.accounts.listKeys(resourceGroupName, serviceName);
        if (!keys?.key1) {
          throw new Error('No key found for newly created authoring resource');
        } else {
          key = keys.key1;
          setLocalKey(keys.key1);
        }
      } catch (err) {
        setOutcomeDescription(
          formatMessage(
            'Due to the following error, we were unable to successfully add your selected Speech keys to your bot project:'
          )
        );
        setOutcomeSummary(<p>{err.message}</p>);
        setOutcomeError(true);
        setCurrentPage(3);
        setLoading(false);
        return;
      }

      setOutcomeDescription(
        formatMessage('The following Speech resource was successfully created and added to your bot project:')
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
            {localRegion}
          </p>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Resource name')}</label>
            {resourceName}
          </p>
        </div>
      );
      setOutcomeError(false);

      // ALL DONE!
      // this will pass the new values back to the caller
      // have to wait a second for the key to be available to use
      // otherwise the ARM api will throw an "unknown error"
      setTimeout(() => {
        setLoading(false);

        props.onGetKey({
          subscriptionKey: key,
          region: localRegion,
        });

        setCurrentPage(3);
      }, 3000);
    }
  };

  // allow a user to provide a subscription id if one is missing
  const onChangeSubscription = async (_, opt) => {
    // get list of keys for this subscription
    setSubscriptionId(opt.key);
    fetchLocations(opt.key);
    fetchAccounts(opt.key);
    fetchResourceGroups(opt.key);
  };

  const onChangeKey = async (_, opt) => {
    setLocalKey(opt.key);
    setLocalRegion(opt.data.region);
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
        subscriptionKey: localKey,
        region: localRegion,
      });
      setOutcomeDescription(formatMessage('The following Speech key has been successfully added to your bot project:'));
      setOutcomeSummary(
        <div>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Key')}</label>
            {localKey}
          </p>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Region')}</label>
            {localRegion}
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

  const onRenderOption = (option) => {
    return (
      <div>
        {option.data?.icon && <Icon aria-hidden="true" iconName={option.data.icon} style={iconStyles} />}
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
          'Copy and share this information with your Azure admin to provision resources on your behalf.'
        )}
        handoffInstructions={formatMessage(
          'I am working on a Microsoft Bot Framework project, and I now require some Azure resources to be created. Please follow the instructions below to create these resources and provide them to me.\n\n1. Using the Azure portal, please create a Speech resource on my behalf.\n2. Once provisioned, securely share the resulting credentials with me as described in the link below.\n\nDetailed instructions:\nhttps://aka.ms/bfcomposerhandoffdls'
        )}
        hidden={!showHandoff}
        title={formatMessage('Share resource request')}
        onBack={() => {
          setShowHandoff(false);
          props.setVisibility(true);
        }}
        onDismiss={() => setShowHandoff(false)}
      />
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: currentPage === 2 ? formatMessage('Create new Speech resources') : formatMessage('Select Speech keys'),
        }}
        hidden={props.hidden}
        minWidth={480}
        modalProps={{
          isBlocking: true,
        }}
        onDismiss={props.onDismiss}
      >
        <div>
          {currentPage === 1 && (
            <div>
              <p>
                {formatMessage(
                  'Select your Azure subscription and choose from existing Speech keys, or create a new Speech resource. Learn more'
                )}
              </p>
              <div css={mainElementStyle}>
                <Dropdown
                  disabled={!availableSubscriptions?.length}
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
                        'No existing Speech resource found in this subscription. Click “Next” to create a new one.'
                      )}
                    </span>
                  )}
                  {!noKeys && subscriptionId && (
                    <div>
                      <Dropdown
                        disabled={!keys?.length || nextAction !== 'choose'}
                        label={formatMessage('Speech key')}
                        options={
                          keys.map((p) => {
                            return { text: p.name, ...p, data: p };
                          }) ?? []
                        }
                        placeholder={formatMessage('Select one')}
                        styles={dropdownStyles}
                        onChange={onChangeKey}
                      />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                {loading && (
                  <Spinner
                    label={formatMessage('Loading keys...')}
                    labelPosition="right"
                    styles={{ root: { float: 'left' } }}
                  />
                )}
                <PrimaryButton
                  disabled={
                    loading || (nextAction === 'choose' && !localKey) || (nextAction === 'create' && !subscriptionId)
                  }
                  text={formatMessage('Next')}
                  onClick={performNextAction}
                />
                <DefaultButton
                  disabled={loading || showAuthDialog}
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
                    'Input your details below to create a new Speech resource. You will be able to manage your new resource in the Azure portal. Learn more'
                  )}
                </p>
                <Dropdown
                  disabled={!resourceGroups.length || loading}
                  label={formatMessage('Resource group')}
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
                    data-testid={'resourceGroupName'}
                    disabled={loading}
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
                  aria-label={formatMessage('Speech region')}
                  data-testid={'rootRegion'}
                  disabled={loading || !locationList}
                  label={formatMessage('Speech region')}
                  options={locationList}
                  placeholder={formatMessage('Enter Speech region')}
                  selectedKey={localRegion}
                  styles={dropdownStyles}
                  onChange={handleRegionOnChange}
                />
                <TextField
                  required
                  aria-label={formatMessage('Resource name')}
                  data-testid={'resourceName'}
                  disabled={loading}
                  label={formatMessage('Resource name')}
                  placeholder={formatMessage('Enter name for new Speech resources')}
                  styles={{ root: { marginTop: 10 } }}
                  value={resourceName}
                  onChange={(e, val) => setResourceName(val || '')}
                />
              </div>
              <DialogFooter>
                {loading && (
                  <Spinner
                    label={formatMessage('Creating resources...')}
                    labelPosition="right"
                    styles={{ root: { float: 'left' } }}
                  />
                )}
                <DefaultButton disabled={loading} text={formatMessage('Back')} onClick={() => setCurrentPage(1)} />
                <PrimaryButton
                  disabled={
                    loading ||
                    !resourceName ||
                    !resourceGroupKey ||
                    (resourceGroupKey == CREATE_NEW_KEY && !newResourceGroupName)
                  }
                  text={formatMessage('Next')}
                  onClick={createResources}
                />
                <DefaultButton disabled={loading} text={formatMessage('Cancel')} onClick={props.onDismiss} />
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
