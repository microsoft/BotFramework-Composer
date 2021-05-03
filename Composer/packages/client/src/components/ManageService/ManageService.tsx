// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, Fragment } from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
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
import sortBy from 'lodash/sortBy';
import { NeutralColors } from '@uifabric/fluent-theme';
import { AzureTenant } from '@botframework-composer/types';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { getTokenFromCache, isShowAuthDialog, userShouldProvideTokens } from '../../utils/auth';
import { dispatcherState } from '../../recoilModel/atoms';

type ManageServiceProps = {
  createService: (
    tokenCredentials: TokenCredentials,
    subscriptionId: string,
    resourceGroupName: string,
    resourceName: string,
    region: string,
    tier?: string
  ) => Promise<string>;
  createServiceInBackground?: boolean;
  handoffInstructions: string;
  hidden: boolean;
  learnMore?: string;
  onDismiss: () => void;
  onGetKey: (settings: { key: string; region: string }) => void;
  onNext?: () => void;
  serviceName: string;
  regions?: IDropdownOption[];
  serviceKeyType: string;
  tiers?: IDropdownOption[];
  onToggleVisibility: (visible: boolean) => void;
};

type KeyRec = {
  name: string;
  region: string;
  resourceGroup: string;
  key: string;
};

type Step = 'intro' | 'subscription' | 'resourceCreation' | 'outcome';

const dropdownStyles = { dropdown: { width: '100%', marginBottom: 10 } };
const inputStyles = { root: { width: '100%', marginBottom: 10 } };
const summaryLabelStyles = { display: 'block', color: '#605E5C', fontSize: 14 };
const summaryStyles = { background: '#F3F2F1', padding: '1px 1rem' };
const mainElementStyle = { marginBottom: 20 };
const dialogBodyStyles = { height: 480 };
const CREATE_NEW_KEY = 'CREATE_NEW';

export const ManageService = (props: ManageServiceProps) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [token, setToken] = useState<string | undefined>();

  const { setApplicationLevelError } = useRecoilValue(dispatcherState);
  const [subscriptionId, setSubscription] = useState<string>('');
  const [tenantId, setTenantId] = useState<string>('');
  const [resourceGroups, setResourceGroups] = useState<any[]>([]);
  const [createResourceGroup, setCreateResourceGroup] = useState<boolean>(false);
  const [newResourceGroupName, setNewResourceGroupName] = useState<string>('');
  const [resourceGroupKey, setResourceGroupKey] = useState<string>('');
  const [resourceGroup, setResourceGroup] = useState<string>('');
  const [tier, setTier] = useState<string>('');
  const [allTenants, setAllTenants] = useState<AzureTenant[]>([]);
  const [tenantsErrorMessage, setTenantsErrorMessage] = useState<string | undefined>(undefined);
  const [showHandoff, setShowHandoff] = useState<boolean>(false);
  const [resourceName, setResourceName] = useState<string>('');
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [noKeys, setNoKeys] = useState<boolean>(false);
  const [nextAction, setNextAction] = useState<string>('choose');
  const [key, setKey] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsErrorMessage, setSubscriptionsErrorMessage] = useState<string>();
  const [keys, setKeys] = useState<KeyRec[]>([]);

  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [outcomeDescription, setOutcomeDescription] = useState<string>('');
  const [outcomeSummary, setOutcomeSummary] = useState<any>();
  const [outcomeError, setOutcomeError] = useState<boolean>(false);
  const [locationList, setLocationList] = useState<IDropdownOption[]>(props.regions || []);

  const actionOptions: IChoiceGroupOption[] = [
    { key: 'choose', text: formatMessage('Choose from existing') },
    {
      key: 'create',
      text: formatMessage('Create a new {service} resource', { service: props.serviceName }),
    },
    { key: 'handoff', text: formatMessage('Handoff to admin') },
  ];

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

  /* Copied from Azure Publishing extension */
  const getSubscriptions = async (token: string): Promise<Array<Subscription>> => {
    const tokenCredentials = new TokenCredentials(token);
    try {
      const subscriptionClient = new SubscriptionClient(tokenCredentials);
      const subscriptionsResult = await subscriptionClient.subscriptions.list();
      // eslint-disable-next-line no-underscore-dangle
      return sortBy(subscriptionsResult._response.parsedBody, ['displayName']);
    } catch (err) {
      setApplicationLevelError(err);
      return [];
    }
  };

  useEffect(() => {
    if (!userShouldProvideTokens()) {
      AuthClient.getTenants()
        .then((tenants) => {
          setAllTenants(tenants);
          if (tenants.length === 0) {
            setTenantsErrorMessage(formatMessage('No Azure Directories were found.'));
          } else if (tenants.length === 1) {
            setTenantId(tenants[0].tenantId);
          } else {
            setTenantsErrorMessage(undefined);
          }
        })
        .catch((err) => {
          setTenantsErrorMessage(
            formatMessage('There was a problem loading Azure directories. {errMessage}', {
              errMessage: err.message || err.toString(),
            })
          );
        });
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      AuthClient.getARMTokenForTenant(tenantId)
        .then((token) => {
          setToken(token);
          setTenantsErrorMessage(undefined);
        })
        .catch((err) => {
          setTenantsErrorMessage(
            formatMessage(
              'There was a problem getting the access token for the current Azure directory. {errMessage}',
              {
                errMessage: err.message || err.toString(),
              }
            )
          );
          setTenantsErrorMessage(err.message || err.toString());
        });
    }
  }, [tenantId]);

  useEffect(() => {
    if (token) {
      setAvailableSubscriptions([]);
      setSubscriptionsErrorMessage(undefined);
      getSubscriptions(token)
        .then((data) => {
          setAvailableSubscriptions(data);
          if (data.length === 0) {
            setSubscriptionsErrorMessage(
              formatMessage(
                'Your subscription list is empty, please add your subscription, or login with another account.'
              )
            );
          }
        })
        .catch((err) => {
          setSubscriptionsErrorMessage(err.message);
        });
    }
  }, [token]);

  const hasAuth = async () => {
    let newtoken = '';
    if (userShouldProvideTokens()) {
      if (isShowAuthDialog(false)) {
        setShowAuthDialog(true);
      }
      newtoken = getTokenFromCache('accessToken');
    }
    if (newtoken) {
      setToken(newtoken);
    }
    setCurrentStep('subscription');
  };

  useEffect(() => {
    // reset the ui
    setSubscription('');
    setKeys([]);
    setCurrentStep('intro');
  }, [props.hidden]);

  const handleRegionOnChange = (e, value: IDropdownOption | undefined) => {
    if (value != null) {
      setRegion(value.key as string);
    } else {
      setRegion('');
    }
  };

  const handleTierOnChange = (e, value: IDropdownOption | undefined) => {
    if (value != null) {
      setTier(value.key as string);
    } else {
      setTier('');
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
      setLoading(formatMessage('Loading keys...'));
      setNoKeys(false);
      const tokenCredentials = new TokenCredentials(token);
      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);
      const accounts = await cognitiveServicesManagementClient.accounts.list();

      const keylist: KeyRec[] = await fetchKeys(
        cognitiveServicesManagementClient,
        accounts.filter((a) => a.kind === props.serviceKeyType)
      );
      setLoading(undefined);
      if (keylist.length == 0) {
        setNoKeys(true);
      } else {
        setNoKeys(false);
        setKeys(keylist);
      }
    }
  };

  const fetchResourceGroups = async (subscriptionId) => {
    if (token) {
      const tokenCredentials = new TokenCredentials(token);
      const resourceClient = new ResourceManagementClient(tokenCredentials, subscriptionId);
      const groups = sortBy(await resourceClient.resourceGroups.list(), ['name']);

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

  const createService = async () => {
    if (token) {
      setLoading(formatMessage('Creating resources...'));

      const tokenCredentials = new TokenCredentials(token);

      const resourceGroupName = resourceGroupKey === CREATE_NEW_KEY ? newResourceGroupName : resourceGroup;
      if (resourceGroupKey === CREATE_NEW_KEY) {
        try {
          const resourceClient = new ResourceManagementClient(tokenCredentials, subscriptionId);
          await resourceClient.resourceGroups.createOrUpdate(resourceGroupName, {
            location: region,
          });
        } catch (err) {
          setOutcomeDescription(
            formatMessage(
              'Due to the following error, we were unable to successfully add your selected {service} keys to your bot project:',
              { service: props.serviceName }
            )
          );
          setOutcomeSummary(<p>{err.message}</p>);
          setOutcomeError(true);
          setCurrentStep('outcome');
          setLoading(undefined);
          return;
        }
      }

      TelemetryClient.track('SettingsGetKeysCreateNewResourceStarted', {
        subscriptionId,
        region,
        resourceType: props.serviceName,
        createNewResourceGroup: resourceGroupKey === CREATE_NEW_KEY,
      });

      try {
        if (props.createServiceInBackground) {
          props.createService(tokenCredentials, subscriptionId, resourceGroupName, resourceName, region, tier);
        } else {
          const newKey = await props.createService(
            tokenCredentials,
            subscriptionId,
            resourceGroupName,
            resourceName,
            region,
            tier
          );

          TelemetryClient.track('SettingsGetKeysCreateNewResourceCompleted', {
            subscriptionId,
            region,
            resourceType: props.serviceName,
            createNewResourceGroup: resourceGroupKey === CREATE_NEW_KEY,
          });

          setKey(newKey);
          // ALL DONE!
          // this will pass the new values back to the caller
          props.onGetKey({
            key: newKey,
            region: region,
          });
        }
      } catch (err) {
        setOutcomeDescription(
          formatMessage(
            'Due to the following error, we were unable to successfully add your selected {service} keys to your bot project:',
            { service: props.serviceName }
          )
        );
        setOutcomeSummary(<p>{err.message}</p>);
        setOutcomeError(true);
        setCurrentStep('outcome');
        setLoading(undefined);
        return;
      }

      setLoading(undefined);

      setOutcomeDescription(
        formatMessage('The following {service} resource was successfully created and added to your bot project:', {
          service: props.serviceName,
        })
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
            {region}
          </p>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Resource name')}</label>
            {resourceName}
          </p>
        </div>
      );
      setOutcomeError(false);

      setCurrentStep('outcome');
    }
  };

  // allow a user to provide a subscription id if one is missing
  const onChangeSubscription = async (_, opt) => {
    // get list of keys for this subscription
    setSubscription(opt.key);
    fetchAccounts(opt.key);
    setLoading(formatMessage('Loading subscription...'));
    // if we don't have a list of regions already passed in
    if (!props.regions) {
      fetchLocations(opt.key);
    }
    fetchResourceGroups(opt.key);
  };

  const onChangeKey = async (_, opt) => {
    // get list of keys for this subscription
    setKey(opt.key);
    setRegion(opt.region);
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

  const chooseExistingKey = () => {
    TelemetryClient.track('SettingsGetKeysExistingResourceSelected', {
      subscriptionId,
      resourceType: props.serviceName,
    });

    // close the modal!
    props.onGetKey({
      key: key,
      region: region,
    });
    setOutcomeDescription(
      formatMessage('The following {service} keys have been successfully added to your bot project:', {
        service: props.serviceName,
      })
    );
    setOutcomeSummary(
      <div>
        <p>
          <label css={summaryLabelStyles}>{formatMessage('Key')}</label>
          {key}
        </p>
        <p>
          <label css={summaryLabelStyles}>{formatMessage('Region')}</label>
          {region}
        </p>
      </div>
    );
    setOutcomeError(false);

    setCurrentStep('outcome');
  };

  const performNextAction = () => {
    if (nextAction === 'handoff') {
      TelemetryClient.track('SettingsGetKeysResourceRequestSelected', {
        subscriptionId,
        resourceType: props.serviceName,
      });
      setShowHandoff(true);
      props.onDismiss();
    } else {
      hasAuth();
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

  const renderIntroStep = () => {
    return (
      <div>
        <div css={dialogBodyStyles}>
          <p css={{ marginTop: 0 }}>
            {formatMessage(
              'Select your Azure directory, then choose the subscription where your existing resource is located and the keys you want to use.',
              { service: props.serviceName }
            )}
            {props.learnMore ? (
              <Link href={props.learnMore} target={'_blank'}>
                {formatMessage('Learn more')}
              </Link>
            ) : null}
          </p>
          <div css={mainElementStyle}>
            <ChoiceGroup options={actionOptions} selectedKey={nextAction} onChange={onChangeAction} />
          </div>
        </div>
        <DialogFooter>
          <PrimaryButton disabled={!!loading} text={formatMessage('Next')} onClick={performNextAction} />
          <DefaultButton
            disabled={!!loading || showAuthDialog}
            text={formatMessage('Cancel')}
            onClick={props.onDismiss}
          />
        </DialogFooter>
      </div>
    );
  };

  const renderChooseResourceStep = () => {
    return (
      <div>
        <div css={dialogBodyStyles}>
          <p css={{ marginTop: 0 }}>
            {formatMessage(
              'Select your Azure directory, then choose the subscription where you’d like your new {service} resource.',
              { service: props.serviceName }
            )}
            {props.learnMore ? (
              <Link href={props.learnMore} target={'_blank'}>
                {formatMessage('Learn more')}
              </Link>
            ) : null}
          </p>
          <div css={mainElementStyle}>
            <Dropdown
              required
              disabled={allTenants.length === 1 || !tenantId || tenantId.trim().length === 0}
              errorMessage={tenantsErrorMessage}
              label={formatMessage('Azure directory')}
              options={allTenants.map((t) => ({ key: t.tenantId, text: t.displayName }))}
              selectedKey={tenantId}
              styles={dropdownStyles}
              onChange={(_e, o) => {
                setTenantId(o?.key as string);
              }}
            />
            <Dropdown
              required
              disabled={!(availableSubscriptions?.length > 0)}
              errorMessage={subscriptionsErrorMessage}
              label={formatMessage('Subscription')}
              options={
                availableSubscriptions
                  ?.filter((p) => p.subscriptionId && p.displayName)
                  .map((p) => {
                    return { key: p.subscriptionId ?? '', text: p.displayName ?? formatMessage('Unnamed') };
                  }) ?? []
              }
              placeholder={formatMessage('Select one')}
              selectedKey={subscriptionId}
              styles={dropdownStyles}
              onChange={onChangeSubscription}
            />
          </div>
          <div>
            {noKeys && subscriptionId && (
              <span style={{ color: NeutralColors.gray100 }}>
                {formatMessage(
                  'No existing {service} resources were found in this subscription. Select a different subscription, or click “Back” to create a new resource or generate a resource request to handoff to your Azure admin.',
                  {
                    service: props.serviceName,
                  }
                )}
              </span>
            )}
            {!noKeys && subscriptionId && (
              <div>
                <Dropdown
                  disabled={!(keys?.length > 0) || nextAction !== 'choose'}
                  label={formatMessage('{service} Key', { service: props.serviceName })}
                  options={
                    keys.map((p) => {
                      return { text: p.name, ...p };
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
          {loading && <Spinner label={loading} labelPosition="right" styles={{ root: { float: 'left' } }} />}
          <DefaultButton disabled={!!loading} text={formatMessage('Back')} onClick={() => setCurrentStep('intro')} />
          <PrimaryButton
            disabled={!!loading || !(region && key)}
            text={formatMessage('Next')}
            onClick={chooseExistingKey}
          />
          <DefaultButton disabled={!!loading} text={formatMessage('Cancel')} onClick={props.onDismiss} />
        </DialogFooter>
      </div>
    );
  };

  const renderResourseCreatorStep = () => {
    return (
      <div>
        <div css={dialogBodyStyles}>
          <p css={{ marginTop: 0 }}>
            {formatMessage(
              'Input your details below to create a new {service} resource. You will be able to manage your new resource in the Azure portal.',
              { service: props.serviceName }
            )}
          </p>

          <div css={mainElementStyle}>
            <Dropdown
              disabled={!subscriptionId || resourceGroups.length === 0 || !!loading}
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
                disabled={!subscriptionId || !!loading}
                id={'resourceGroupName'}
                label={formatMessage('Resource group name')}
                placeholder={formatMessage('Enter name for new resource group')}
                styles={inputStyles}
                value={newResourceGroupName}
                onChange={(e, val) => {
                  setNewResourceGroupName(val || '');
                }}
              />
            )}
            <Dropdown
              required
              aria-label={formatMessage('Region')}
              data-testid={'rootRegion'}
              disabled={!subscriptionId || !!loading}
              id={'region'}
              label={formatMessage('Region')}
              options={locationList}
              placeholder={formatMessage('Enter region')}
              selectedKey={region}
              styles={dropdownStyles}
              onChange={handleRegionOnChange}
            />
            <TextField
              required
              aria-label={formatMessage('Resource name')}
              data-testid={'resourceName'}
              disabled={!subscriptionId || !!loading}
              id={'resourceName'}
              label={formatMessage('Resource name')}
              placeholder={formatMessage('Enter name for new resources')}
              styles={inputStyles}
              value={resourceName}
              onChange={(e, val) => setResourceName(val || '')}
            />
            {props.tiers && (
              <Dropdown
                required
                aria-label={formatMessage('Pricing tier')}
                data-testid={'tier'}
                disabled={!subscriptionId || !!loading}
                id={'tier'}
                label={formatMessage('Pricing tier')}
                options={props.tiers}
                placeholder={formatMessage('Select one')}
                selectedKey={tier}
                styles={dropdownStyles}
                onChange={handleTierOnChange}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          {loading && <Spinner label={loading} labelPosition="right" styles={{ root: { float: 'left' } }} />}
          <DefaultButton
            disabled={!!loading}
            text={formatMessage('Back')}
            onClick={() => setCurrentStep('subscription')}
          />
          <PrimaryButton
            disabled={
              !!loading ||
              !resourceName ||
              !region ||
              !resourceGroupKey ||
              (props.tiers && !tier) ||
              (resourceGroupKey == CREATE_NEW_KEY && !newResourceGroupName)
            }
            text={formatMessage('Next')}
            onClick={createService}
          />
          <DefaultButton disabled={!!loading} text={formatMessage('Cancel')} onClick={props.onDismiss} />
        </DialogFooter>
      </div>
    );
  };

  const renderOutcomeStep = () => {
    return (
      <div>
        <div css={dialogBodyStyles}>
          <p>{outcomeDescription}</p>
          <div css={summaryStyles}>{outcomeSummary}</div>
          {outcomeError && (
            <p>
              {formatMessage('If you would like to try again, or select from existing resources, please click “Back”.')}
            </p>
          )}
        </div>
        <DialogFooter>
          {outcomeError && <DefaultButton text={formatMessage('Back')} onClick={() => setCurrentStep('intro')} />}
          <PrimaryButton text={formatMessage('Done')} onClick={props.onNext} />
        </DialogFooter>
      </div>
    );
  };

  const renderSubscriptionSelectionStep = () => {
    return (
      <div>
        <div css={dialogBodyStyles}>
          <p css={{ marginTop: 0 }}>
            {formatMessage(
              'Select your Azure directory, then choose the subscription where you’d like your new {service} resource.',
              { service: props.serviceName }
            )}
            {props.learnMore ? (
              <Link href={props.learnMore} target={'_blank'}>
                {formatMessage('Learn more')}
              </Link>
            ) : null}
          </p>
          <div css={mainElementStyle}>
            <Dropdown
              required
              disabled={allTenants.length === 1 || !tenantId}
              errorMessage={tenantsErrorMessage}
              label={formatMessage('Azure directory')}
              options={allTenants.map((t) => ({ key: t.tenantId, text: t.displayName }))}
              selectedKey={tenantId}
              styles={dropdownStyles}
              onChange={(_e, o) => {
                setTenantId(o?.key as string);
              }}
            />
            <Dropdown
              required
              disabled={availableSubscriptions?.length === 0}
              errorMessage={subscriptionsErrorMessage}
              label={formatMessage('Subscription')}
              options={
                availableSubscriptions
                  ?.filter((p) => p.subscriptionId && p.displayName)
                  .map((p) => {
                    return { key: p.subscriptionId ?? '', text: p.displayName ?? formatMessage('Unnamed') };
                  }) ?? []
              }
              placeholder={formatMessage('Select one')}
              selectedKey={subscriptionId}
              styles={dropdownStyles}
              onChange={onChangeSubscription}
            />
          </div>
        </div>
        <DialogFooter>
          {loading && <Spinner label={loading} labelPosition="right" styles={{ root: { float: 'left' } }} />}
          <DefaultButton disabled={!!loading} text={formatMessage('Back')} onClick={() => setCurrentStep('intro')} />
          <PrimaryButton
            disabled={!!loading || !tenantId || !subscriptionId}
            text={formatMessage('Next')}
            onClick={() => setCurrentStep('resourceCreation')}
          />
          <DefaultButton disabled={!!loading} text={formatMessage('Cancel')} onClick={props.onDismiss} />
        </DialogFooter>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro':
        return renderIntroStep();
      case 'subscription': {
        if (nextAction === 'choose') {
          return renderChooseResourceStep();
        }
        return renderSubscriptionSelectionStep();
      }
      case 'resourceCreation':
        return renderResourseCreatorStep();
      case 'outcome':
        return renderOutcomeStep();
      default:
        return null;
    }
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
          'I am working on a Microsoft Bot Framework project, and I now require some Azure resources to be created. Please follow the instructions below to create these resources and provide them to me.\n\n{instructions}',
          { instructions: props.handoffInstructions }
        )}
        hidden={!showHandoff}
        title={formatMessage('Share resource request')}
        onBack={() => {
          setShowHandoff(false);
          props.onToggleVisibility(true);
        }}
        onDismiss={() => setShowHandoff(false)}
      />
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title:
            nextAction === 'create'
              ? formatMessage('Create new {service} resource', { service: props.serviceName })
              : formatMessage('Select {service} keys', { service: props.serviceName }),
        }}
        hidden={props.hidden || showAuthDialog}
        minWidth={480}
        modalProps={{
          isBlocking: true,
        }}
        onDismiss={loading ? () => {} : props.onDismiss}
      >
        {renderCurrentStep()}
      </Dialog>
    </Fragment>
  );
};
