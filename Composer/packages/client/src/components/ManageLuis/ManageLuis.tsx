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
import { useRecoilValue } from 'recoil';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import get from 'lodash/get';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { TokenCredentials } from '@azure/ms-rest-js';
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';

import { LoadingSpinner } from '../LoadingSpinner';
import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { armScopes } from '../../constants';
import { getTokenFromCache, isShowAuthDialog, isGetTokenFromUser } from '../../utils/auth';
import { LUIS_REGIONS } from '../../constants';
import settingStorage from '../../utils/dialogSettingStorage';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { dispatcherState } from '../../recoilModel/atoms';

type ManageLuisProps = {
  hidden: boolean;
  onDismiss: () => void;
  onGetKey: (settings: any) => void;
};

type KeyRec = {
  name: string;
  region: string;
  resourceGroup: string;
  key: string;
};

const dropdownStyles = { dropdown: { width: '100%' } };

const CREATE_NEW_KEY = 'CREATE_NEW';

export const ManageLuis = (props: ManageLuisProps) => {
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const sensitiveGroupManageProperty = settingStorage.get(rootBotProjectId);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [token, setToken] = useState<string | undefined>();

  const groupLUISAuthoringKey = get(sensitiveGroupManageProperty, 'luis.authoringKey', {});
  const rootLuisKey = groupLUISAuthoringKey.root;
  const groupLUISEndpointKey = get(sensitiveGroupManageProperty, 'luis.endpointKey', {});
  const rootLuisEndpointKey = groupLUISEndpointKey.root;
  const groupLUISRegion = get(sensitiveGroupManageProperty, 'luis.authoringRegion', {});
  const rootLuisRegion = groupLUISRegion.root;
  const { setApplicationLevelError } = useRecoilValue(dispatcherState);
  const [subscriptionId, setSubscription] = useState<string>('');
  const [resourceGroups, setResourceGroups] = useState<any[]>([]);
  const [createResourceGroup, setCreateResourceGroup] = useState<boolean>(false);
  const [newResourceGroupName, setNewResourceGroupName] = useState<string>('');
  const [resourceGroupKey, setResourceGroupKey] = useState<string>('');
  const [resourceGroup, setResourceGroup] = useState<string>('');

  const [luisResourceName, setLuisResourceName] = useState<string>('');
  const [loadingLUIS, setLoadingLUIS] = useState<boolean>(false);
  const [showCreateKeyUI, setShowCreateKeyUI] = useState<boolean>(false);
  const [noKeys, setNoKeys] = useState<boolean>(false);
  const [nextAction, setNextAction] = useState<string>('create');
  const [actionOptions, setActionOptions] = useState<IChoiceGroupOption[]>([]);
  const [localRootLuisKey, setLocalRootLuisKey] = useState<string>(''); // rootLuisKey ??
  const [localRootLuisEndpointKey, setLocalRootLuisEndpointKey] = useState<string>(''); //rootLuisEndpointKey ??
  const [localRootLuisRegion, setLocalRootLuisRegion] = useState<string>(''); // rootLuisRegion ??
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [predictionKeys, setPredictionKeys] = useState<KeyRec[]>([]);
  const [authoringKeys, setAuthoringKeys] = useState<KeyRec[]>([]);

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
    if (isGetTokenFromUser()) {
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
    setAuthoringKeys([]);
    setPredictionKeys([]);
    setShowCreateKeyUI(false);
    setActionOptions([
      { key: 'create', text: formatMessage('Create a new LUIS resource'), disabled: true },
      { key: 'handoff', text: formatMessage('Generate a resource request'), disabled: true },
      { key: 'choose', text: formatMessage('Choose from existing'), disabled: true },
    ]);
    if (!props.hidden) {
      hasAuth();
    }
  }, [props.hidden]);

  const closeDialog = () => {
    props.onDismiss();
    props.onGetKey({
      authoringKey: localRootLuisKey,
      endpointKey: localRootLuisEndpointKey,
      authoringRegion: localRootLuisRegion,
    });
  };

  const handleRootLuisRegionOnChange = (e, value: IDropdownOption | undefined) => {
    if (value != null) {
      setLocalRootLuisRegion(value.key as string);
    } else {
      setLocalRootLuisRegion('');
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

  const fetchLUIS = async (subscriptionId) => {
    if (token) {
      setLoadingLUIS(true);
      setNoKeys(false);
      const tokenCredentials = new TokenCredentials(token);
      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);
      const accounts = await cognitiveServicesManagementClient.accounts.list();

      const authoring: KeyRec[] = await fetchKeys(
        cognitiveServicesManagementClient,
        accounts.filter((a) => a.kind === 'LUIS.Authoring')
      );
      const prediction: KeyRec[] = await fetchKeys(
        cognitiveServicesManagementClient,
        accounts.filter((a) => a.kind === 'LUIS')
      );
      setLoadingLUIS(false);
      if (authoring.length == 0 || prediction.length == 0) {
        setNoKeys(true);
        setActionOptions([
          { key: 'create', text: formatMessage('Create a new LUIS resource') },
          { key: 'handoff', text: formatMessage('Generate a resource request'), disabled: false },
          { key: 'choose', text: formatMessage('Choose from existing'), disabled: true },
        ]);
      } else {
        setNoKeys(false);
        setAuthoringKeys(authoring);
        setPredictionKeys(prediction);
        setActionOptions([
          { key: 'create', text: formatMessage('Create a new LUIS resource') },
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

  const createLUIS = async () => {
    let endpointKey = '';
    let authoringKey = '';
    if (token) {
      setLoadingLUIS(true);
      const tokenCredentials = new TokenCredentials(token);

      const resourceGroupName = resourceGroupKey === CREATE_NEW_KEY ? newResourceGroupName : resourceGroup;
      if (resourceGroupKey === CREATE_NEW_KEY) {
        try {
          const resourceClient = new ResourceManagementClient(tokenCredentials, subscriptionId);
          await resourceClient.resourceGroups.createOrUpdate(resourceGroupName, {
            location: localRootLuisRegion,
          });
        } catch (err) {
          setApplicationLevelError(err);
          setLoadingLUIS(false);
          return;
        }
      }

      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);
      try {
        const authoringResult = await cognitiveServicesManagementClient.accounts.create(
          resourceGroupName,
          `${luisResourceName}-authoring`,
          {
            kind: 'LUIS.Authoring',
            sku: {
              name: 'F0',
            },
            location: localRootLuisRegion,
          }
        );

        const keys = await cognitiveServicesManagementClient.accounts.listKeys(
          resourceGroupName,
          `${luisResourceName}-authoring`
        );
        if (!keys?.key1) {
          throw new Error('No key found for newly created authoring resource');
        } else {
          authoringKey = keys.key1;
          setLocalRootLuisKey(keys.key1);
        }
      } catch (err) {
        setApplicationLevelError(err);
        setLoadingLUIS(false);
        return;
      }
      try {
        const predictionResult = await cognitiveServicesManagementClient.accounts.create(
          resourceGroupName,
          `${luisResourceName}`,
          {
            kind: 'LUIS',
            sku: {
              name: 'S0',
            },
            location: localRootLuisRegion,
          }
        );

        const keys = await cognitiveServicesManagementClient.accounts.listKeys(
          resourceGroupName,
          `${luisResourceName}`
        );
        if (!keys?.key1) {
          throw new Error('No key found for newly created authoring resource');
        } else {
          endpointKey = keys.key1;
          setLocalRootLuisEndpointKey(keys.key1);
        }
      } catch (err) {
        setApplicationLevelError(err);
        setLoadingLUIS(false);
        return;
      }

      setLoadingLUIS(false);

      // ALL DONE!
      // this will pass the new values back to the caller
      props.onGetKey({
        authoringKey: authoringKey,
        endpointKey: endpointKey,
        authoringRegion: localRootLuisRegion,
      });
      props.onDismiss();
    }
  };

  // allow a user to provide a subscription id if one is missing
  const onChangeSubscription = async (_, opt) => {
    // get list of luis keys for this subscription
    setSubscription(opt.key);
    fetchLUIS(opt.key);
    fetchResourceGroups(opt.key);
  };

  const onChangeLUISAuthoring = async (_, opt) => {
    // get list of luis keys for this subscription
    setLocalRootLuisKey(opt.key);
    setLocalRootLuisRegion(opt.region);
  };
  const onChangeLUISPrediction = async (_, opt) => {
    // get list of luis keys for this subscription
    setLocalRootLuisEndpointKey(opt.key);
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
      // close the modal!
      closeDialog();
    } else {
      setShowCreateKeyUI(true);
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
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: showCreateKeyUI ? formatMessage('Create new LUIS resources') : formatMessage('Select LUIS keys'),
        }}
        hidden={props.hidden}
        minWidth={480}
        modalProps={{
          isBlocking: false,
        }}
        onDismiss={props.onDismiss}
      >
        <div>
          {!showCreateKeyUI && (
            <div>
              <p>
                {formatMessage(
                  'Select your Azure subscription and choose from existing LUIS keys, or create a new LUIS resource. Learn more'
                )}
              </p>
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

              <ChoiceGroup options={actionOptions} selectedKey={nextAction} onChange={onChangeAction} />

              <div style={{ marginLeft: 26 }}>
                {noKeys && (
                  <p>
                    {formatMessage('No existing LUIS resource found in this subscription. Click “Next” to create new.')}
                  </p>
                )}
                {loadingLUIS && <LoadingSpinner message="Loading keys..." />}
                {!loadingLUIS && !noKeys && (
                  <div>
                    <Dropdown
                      disabled={!(authoringKeys?.length > 0) || nextAction !== 'choose'}
                      label={formatMessage('Authoring key')}
                      options={
                        authoringKeys.map((p) => {
                          return { text: p.name, ...p };
                        }) ?? []
                      }
                      placeholder={formatMessage('Select one')}
                      styles={dropdownStyles}
                      onChange={onChangeLUISAuthoring}
                    />
                    <Dropdown
                      disabled={!(predictionKeys?.length > 0) || nextAction !== 'choose'}
                      label={formatMessage('Prediction key')}
                      options={
                        predictionKeys.map((p) => {
                          return { text: p.name, ...p };
                        }) ?? []
                      }
                      placeholder={formatMessage('Select one')}
                      styles={dropdownStyles}
                      onChange={onChangeLUISPrediction}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {showCreateKeyUI && (
            <div>
              <p>
                {formatMessage(
                  'Input your details below to create a new LUIS resource. You will be able to manage your new resource in the Azure portal. Learn more'
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
                  data-testid={'luisResourceGroupName'}
                  id={'luisResourceGroupName'}
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
                aria-label={formatMessage('LUIS region')}
                data-testid={'rootLUISRegion'}
                id={'luisRegion'}
                label={formatMessage('LUIS region')}
                options={LUIS_REGIONS}
                placeholder={formatMessage('Enter LUIS region')}
                selectedKey={localRootLuisRegion}
                styles={dropdownStyles}
                onChange={handleRootLuisRegionOnChange}
              />
              <TextField
                required
                aria-label={formatMessage('Resource name')}
                data-testid={'luisResourceName'}
                id={'luisResourceName'}
                label={formatMessage('Resource name')}
                placeholder={formatMessage('Enter name for new LUIS resources')}
                styles={{ root: { marginTop: 10 } }}
                value={luisResourceName}
                onChange={(e, val) => setLuisResourceName(val || '')}
              />
              {loadingLUIS && <LoadingSpinner message={formatMessage('Creating resources...')} />}
            </div>
          )}
        </div>
        {showCreateKeyUI && (
          <DialogFooter>
            <DefaultButton text={formatMessage('Back')} onClick={() => setShowCreateKeyUI(false)} />
            <PrimaryButton
              disabled={
                !luisResourceName ||
                !localRootLuisRegion ||
                !resourceGroupKey ||
                (resourceGroupKey == CREATE_NEW_KEY && !newResourceGroupName)
              }
              text={formatMessage('Next')}
              onClick={createLUIS}
            />
            <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
          </DialogFooter>
        )}
        {!showCreateKeyUI && (
          <DialogFooter>
            <PrimaryButton
              disabled={
                loadingLUIS ||
                (nextAction === 'choose' &&
                  !(localRootLuisRegion != '' && localRootLuisKey != '' && localRootLuisEndpointKey != '')) ||
                (nextAction === 'create' && !subscriptionId)
              }
              text={formatMessage('Next')}
              onClick={performNextAction}
            />
          </DialogFooter>
        )}
      </Dialog>
    </Fragment>
  );
};
