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
import { ResourceManagementClient } from '@azure/arm-resources';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { ProvisionHandoff } from '@bfc/ui-shared';

import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { armScopes } from '../../constants';
import { getTokenFromCache, isShowAuthDialog, userShouldProvideTokens } from '../../utils/auth';
import { LUIS_REGIONS } from '../../constants';
import { dispatcherState } from '../../recoilModel/atoms';

type ManageLuisProps = {
  hidden: boolean;
  onDismiss: () => void;
  onGetKey: (settings: { authoringKey: string; endpointKey: string; authoringRegion: string }) => void;
  onNext?: () => void;
  setDisplayManageLuis: (value: any) => void;
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

export const ManageLuis = (props: ManageLuisProps) => {
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
  const [luisResourceName, setLuisResourceName] = useState<string>('');
  const [loadingLUIS, setLoadingLUIS] = useState<boolean>(false);
  const [noKeys, setNoKeys] = useState<boolean>(false);
  const [nextAction, setNextAction] = useState<string>('create');
  const [actionOptions, setActionOptions] = useState<IChoiceGroupOption[]>([]);
  const [localRootLuisKey, setLocalRootLuisKey] = useState<string>('');
  const [localRootLuisEndpointKey, setLocalRootLuisEndpointKey] = useState<string>('');
  const [localRootLuisRegion, setLocalRootLuisRegion] = useState<string>('');
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [predictionKeys, setPredictionKeys] = useState<KeyRec[]>([]);
  const [authoringKeys, setAuthoringKeys] = useState<KeyRec[]>([]);

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
    setAuthoringKeys([]);
    setPredictionKeys([]);
    setCurrentPage(1);
    setActionOptions([
      { key: 'create', text: formatMessage('Create a new LUIS resource'), disabled: true },
      { key: 'handoff', text: formatMessage('Generate a resource request'), disabled: true },
      { key: 'choose', text: formatMessage('Choose from existing'), disabled: true },
    ]);
    if (!props.hidden) {
      hasAuth();
    }
  }, [props.hidden]);

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
          setOutcomeDescription(
            formatMessage(
              'Due to the following error, we were unable to successfully add your selected LUIS keys to your bot project:'
            )
          );
          setOutcomeSummary(
            <div>
              <p>{err.message}</p>
            </div>
          );
          setOutcomeError(true);
          setCurrentPage(3);
          setLoadingLUIS(false);
          return;
        }
      }

      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);
      try {
        await cognitiveServicesManagementClient.accounts.create(resourceGroupName, `${luisResourceName}-authoring`, {
          kind: 'LUIS.Authoring',
          sku: {
            name: 'F0',
          },
          location: localRootLuisRegion,
        });

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
        setOutcomeDescription(
          formatMessage(
            'Due to the following error, we were unable to successfully add your selected LUIS keys to your bot project:'
          )
        );
        setOutcomeSummary(
          <div>
            <p>{err.message}</p>
          </div>
        );
        setOutcomeError(true);
        setCurrentPage(3);
        setLoadingLUIS(false);
        return;
      }
      try {
        await cognitiveServicesManagementClient.accounts.create(resourceGroupName, `${luisResourceName}`, {
          kind: 'LUIS',
          sku: {
            name: 'S0',
          },
          location: localRootLuisRegion,
        });

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
        setOutcomeDescription(
          formatMessage(
            'Due to the following error, we were unable to successfully add your selected LUIS keys to your bot project:'
          )
        );
        setOutcomeSummary(
          <div>
            <p>{err.message}</p>
          </div>
        );
        setOutcomeError(true);
        setCurrentPage(3);
        setLoadingLUIS(false);
        return;
      }

      setLoadingLUIS(false);

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
            {localRootLuisRegion}
          </p>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Resource name')}</label>
            {luisResourceName}
          </p>
        </div>
      );
      setOutcomeError(false);

      // ALL DONE!
      // this will pass the new values back to the caller
      props.onGetKey({
        authoringKey: authoringKey,
        endpointKey: endpointKey,
        authoringRegion: localRootLuisRegion,
      });

      setCurrentPage(3);
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
      props.onGetKey({
        authoringKey: localRootLuisKey,
        endpointKey: localRootLuisEndpointKey,
        authoringRegion: localRootLuisRegion,
      });
      setOutcomeDescription(formatMessage('The following LUIS keys have been successfully added to your bot project:'));
      setOutcomeSummary(
        <div>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Authoring key')}</label>
            {localRootLuisKey}
          </p>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Endpoint Key')}</label>
            {localRootLuisEndpointKey}
          </p>
          <p>
            <label css={summaryLabelStyles}>{formatMessage('Region')}</label>
            {localRootLuisRegion}
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

  const renderPageOne = () => {
    return (
      <div>
        <p>
          {formatMessage(
            'Select your Azure subscription and choose from existing LUIS keys, or create a new LUIS resource. Learn more'
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
          {subscriptionId && <ChoiceGroup options={actionOptions} selectedKey={nextAction} onChange={onChangeAction} />}

          <div style={{ marginLeft: 26 }}>
            {noKeys && subscriptionId && (
              <span style={{ color: 'rgb(161, 159, 157)' }}>
                {formatMessage('No existing LUIS resource found in this subscription. Click “Next” to create new.')}
              </span>
            )}
            {!noKeys && subscriptionId && (
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
        <DialogFooter>
          {loadingLUIS && (
            <Spinner label="Loading keys..." labelPosition="right" styles={{ root: { float: 'left' } }} />
          )}
          <PrimaryButton
            disabled={
              loadingLUIS ||
              (nextAction === 'choose' && !(localRootLuisRegion && localRootLuisKey && localRootLuisEndpointKey)) ||
              (nextAction === 'create' && !subscriptionId)
            }
            text={formatMessage('Next')}
            onClick={performNextAction}
          />
          <DefaultButton
            disabled={loadingLUIS || showAuthDialog}
            text={formatMessage('Cancel')}
            onClick={props.onDismiss}
          />
        </DialogFooter>
      </div>
    );
  };

  const renderPageTwo = () => {
    return (
      <div>
        <div css={mainElementStyle}>
          <p>
            {formatMessage(
              'Input your details below to create a new LUIS resource. You will be able to manage your new resource in the Azure portal. Learn more'
            )}
          </p>
          <Dropdown
            disabled={resourceGroups.length === 0 || loadingLUIS}
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
              disabled={loadingLUIS}
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
            disabled={loadingLUIS}
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
            disabled={loadingLUIS}
            id={'luisResourceName'}
            label={formatMessage('Resource name')}
            placeholder={formatMessage('Enter name for new LUIS resources')}
            styles={{ root: { marginTop: 10 } }}
            value={luisResourceName}
            onChange={(e, val) => setLuisResourceName(val || '')}
          />
        </div>
        <DialogFooter>
          {loadingLUIS && (
            <Spinner
              label={formatMessage('Creating resources...')}
              labelPosition="right"
              styles={{ root: { float: 'left' } }}
            />
          )}
          <DefaultButton disabled={loadingLUIS} text={formatMessage('Back')} onClick={() => setCurrentPage(1)} />
          <PrimaryButton
            disabled={
              loadingLUIS ||
              !luisResourceName ||
              !localRootLuisRegion ||
              !resourceGroupKey ||
              (resourceGroupKey == CREATE_NEW_KEY && !newResourceGroupName)
            }
            text={formatMessage('Next')}
            onClick={createLUIS}
          />
          <DefaultButton disabled={loadingLUIS} text={formatMessage('Cancel')} onClick={props.onDismiss} />
        </DialogFooter>
      </div>
    );
  };

  const renderPageThree = () => {
    return (
      <div>
        <p>{outcomeDescription}</p>
        <div css={summaryStyles}>{outcomeSummary}</div>
        {outcomeError && (
          <p>
            {formatMessage('If you would like to try again, or select from existing resources, please click “Back”.')}
          </p>
        )}
        <DialogFooter>
          {outcomeError && <DefaultButton text={formatMessage('Back')} onClick={() => setCurrentPage(1)} />}
          <PrimaryButton text={formatMessage('Done')} onClick={props.onNext} />
        </DialogFooter>
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
          'Copy and share this information with your Azure admin. After your Luis key is provisioned, you will be ready to test your bot.'
        )}
        handoffInstructions={formatMessage(
          'Using the Azure portal, create a Language Understanding resource. Create these in a subscription that the developer has accesss to. This will result in an authoring key and an endpoint key.  Provide these keys to the developer in a secure manner.'
        )}
        hidden={!showHandoff}
        title={formatMessage('Share resource request')}
        onBack={() => {
          setShowHandoff(false);
          props.setDisplayManageLuis(true);
        }}
        onDismiss={() => setShowHandoff(false)}
      />
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: currentPage === 2 ? formatMessage('Create new LUIS resources') : formatMessage('Select LUIS keys'),
        }}
        hidden={props.hidden}
        minWidth={480}
        modalProps={{
          isBlocking: false,
        }}
        onDismiss={props.onDismiss}
      >
        {currentPage === 1 && renderPageOne()}
        {currentPage === 2 && renderPageTwo()}
        {currentPage === 3 && renderPageThree()}
      </Dialog>
    </Fragment>
  );
};
