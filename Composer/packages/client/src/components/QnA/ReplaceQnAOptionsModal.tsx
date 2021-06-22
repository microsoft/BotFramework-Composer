// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect, Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { TokenCredentials } from '@azure/ms-rest-js';
import { AzureTenant } from '@botframework-composer/types';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { ResourceManagementClient } from '@azure/arm-resources';
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { QnAMakerClient } from '@azure/cognitiveservices-qnamaker';
import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js';

import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import jwtDecode from 'jwt-decode';
import sortBy from 'lodash/sortBy';
import { NeutralColors } from '@uifabric/fluent-theme';

// import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { dispatcherState, settingsState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { getTokenFromCache, isShowAuthDialog, userShouldProvideTokens } from '../../utils/auth';

import { ReplaceQnAOptionsModalFormData, ReplaceQnAOptionsModalProps, knowledgeBaseSourceUrl } from './constants';
import { subText, styles, contentBox, formContainer, choiceContainer, replaceWithQnAportalHeader } from './styles';
import { ImportQnAFromUrl } from './ImportQnAFromUrl';

const DialogTitle = () => {
  return (
    <div>
      {formatMessage('Add QnA Maker knowledge base')}
      <p>
        <span css={subText}>
          {formatMessage('Use Azure QnA Maker to extract question-and-answer pairs from an online FAQ. ')}
          <Link href={knowledgeBaseSourceUrl} target={'_blank'}>
            {formatMessage('Learn more')}
          </Link>
        </span>
      </p>
    </div>
  );
};

type Step = 'option' | 'subscription' | 'resourceCreation' | 'knowledge-base';

type KeyRec = {
  name: string;
  region: string;
  resourceGroup: string;
  key: string;
  endpoint: string;
};

type KBRec = {
  name: string;
  language: string;
  id: string;
  lastChangedTimestamp: string;
};

const CREATE_NEW_KEY = 'CREATE_NEW';
const SERVICE_NAME = 'QnAMaker';
const summaryLabelStyles = { display: 'block', color: '#605E5C', fontSize: 14 };
export const ReplaceQnAOptionsModal: React.FC<ReplaceQnAOptionsModalProps> = (props) => {
  const { qnaFile, onDismiss, containerId, projectId, dialogId, hidden } = props;
  const actions = useRecoilValue(dispatcherState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  // const settings = useRecoilValue(settingsState(projectId));
  // const locales = settings.languages;
  // const defaultLocale = settings.defaultLanguage;
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [qnaSource, setQnASource] = useState<string>('url');
  const [formData, setFormData] = useState<ReplaceQnAOptionsModalFormData>({});
  const [disabled, setDisabled] = useState(true);
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
  const [key, setKey] = useState<KeyRec>();
  const [keys, setKeys] = useState<KeyRec[]>([]);
  const [noKeys, setNoKeys] = useState<boolean>(false);
  const [kbs, setKbs] = useState<KBRec[]>([]);
  const [selectedKb, setSelectedKb] = useState<KBRec>();
  const [nextAction, setNextAction] = useState<string>('choose');
  const [region, setRegion] = useState<string>('');
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsErrorMessage, setSubscriptionsErrorMessage] = useState<string>();
  const [dialogTitle, setDialogTitle] = useState<string>('');

  const [userProvidedTokens, setUserProvidedTokens] = useState<boolean>(false);
  const [outcomeDescription, setOutcomeDescription] = useState<string>('');
  const [outcomeSummary, setOutcomeSummary] = useState<any>();
  const [outcomeError, setOutcomeError] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<Step>('option');

  useEffect(() => {
    if (currentStep === 'subscription' && !userShouldProvideTokens()) {
      AuthClient.getTenants()
        .then((tenants) => {
          setAllTenants(tenants);
          if (tenants.length === 0) {
            setTenantsErrorMessage(formatMessage('No Azure Directories were found.'));
          } else if (tenants.length >= 1) {
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
  }, [currentStep]);

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

  const actionOptions: IChoiceGroupOption[] = [
    { key: 'url', text: formatMessage('Replace KB from URL or file ') },
    {
      key: 'portal',
      text: formatMessage('Replace with an existing KB from QnA maker portal'),
    },
  ];

  const onChangeAction = async (_, opt) => {
    setQnASource(opt.key);
  };

  const handleDismiss = () => {
    onDismiss?.();
    actions.createQnADialogCancel({ projectId });
    TelemetryClient.track('ReplaceKnowledgeBaseCanceled');
  };

  const updateQNASettings = (newQNASettings) => {
    actions.setSettings(projectId, {
      ...mergedSettings,
      qna: { ...mergedSettings.qna, subscriptionKey: newQNASettings.key },
    });
    actions.setQnASettings(projectId, newQNASettings.key);
  };

  const handleReplaceQnAFromUrl = async ({ url, multiTurn }: { url: string; multiTurn: boolean }) => {
    actions.importQnAFromUrl({
      containerId,
      dialogId,
      url,
      multiTurn,
      projectId,
    });
    onDismiss?.();
  };

  const decodeToken = (token: string) => {
    try {
      return jwtDecode<any>(token);
    } catch (err) {
      console.error('decode token error in ', err);
      return null;
    }
  };

  const hasAuth = async () => {
    let newtoken = '';
    if (userShouldProvideTokens()) {
      if (isShowAuthDialog(false)) {
        setShowAuthDialog(true);
      }
      newtoken = getTokenFromCache('accessToken');
      if (newtoken) {
        const decoded = decodeToken(newtoken);
        if (decoded) {
          setToken(newtoken);
          setUserProvidedTokens(true);
        } else {
          setTenantsErrorMessage(
            formatMessage(
              'There was a problem with the authentication access token. Close this dialog and try again. To be prompted to provide the access token again, clear it from application local storage.'
            )
          );
        }
      }
    } else {
      setUserProvidedTokens(false);
    }
    setCurrentStep('subscription');
  };

  const onClickNext = () => {
    // if (disabled || !formData) {
    //   return;
    // }
    if (!formData) return;
    if (qnaSource === 'url') {
      handleReplaceQnAFromUrl({ url: formData.url ?? '', multiTurn: formData.multiTurn ?? false });
      TelemetryClient.track('ReplaceKnowledgeBaseCompleted');
    } else {
      setCurrentStep('subscription');
      hasAuth();
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
            endpoint: accounts[account]?.properties?.endpoint ?? '',
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
        accounts.filter((a) => a.kind === SERVICE_NAME)
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

  const chooseExistingKey = () => {
    TelemetryClient.track('SettingsGetKeysExistingResourceSelected', {
      subscriptionId,
      resourceType: SERVICE_NAME,
    });
    fetchKBGroups();
    setCurrentStep('knowledge-base');
  };

  const fetchKBGroups = async () => {
    if (token && key) {
      const cognitiveServicesCredentials = new CognitiveServicesCredentials(key.key);
      const resourceClient = new QnAMakerClient(cognitiveServicesCredentials, key.endpoint);

      const result = await resourceClient.knowledgebase.listAll();
      console.log(result);
      if (result.knowledgebases) {
        const kblist: KBRec[] = result.knowledgebases.map((item: any) => {
          return {
            id: item.id || '',
            name: item.name || '',
            language: item.language || '',
            lastChangedTimestamp: item.lastChangedTimestamp || '',
          };
        });
        if (kblist && kblist.length) {
          setKbs(kblist);
        }
        console.log(kbs);
      }
    }
  };

  // allow a user to provide a subscription id if one is missing
  const onChangeSubscription = async (_, opt) => {
    // get list of keys for this subscription
    setSubscription(opt.key);
    fetchAccounts(opt.key);
    setLoading(formatMessage('Loading subscription...'));
    fetchResourceGroups(opt.key);
  };

  const onChangeKey = async (_, opt) => {
    // get list of keys for this subscription
    setKey(opt);
    setRegion(opt.region);
  };

  const renderOptionStep = () => {
    return (
      <div>
        <div css={contentBox}>
          <div css={choiceContainer}>
            <ChoiceGroup options={actionOptions} selectedKey={qnaSource} onChange={onChangeAction} />
          </div>
          <div css={formContainer}>
            {qnaSource === 'url' ? (
              qnaFile ? (
                <ImportQnAFromUrl qnaFile={qnaFile} />
              ) : null
            ) : (
              <div style={replaceWithQnAportalHeader}>
                {formatMessage('Replace with an existing KB from QnA maker portal')}
                {formatMessage('Select this option when you want to Import existing KB from QnA maker portal. ')}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DefaultButton
            text={formatMessage('Back')}
            onClick={() => {
              handleDismiss();
            }}
          />
          <PrimaryButton
            data-testid={'ReplaceKnowledgeBase'}
            //disabled={disabled}
            text={formatMessage('Next')}
            onClick={onClickNext}
          />
          <DefaultButton
            text={formatMessage('Cancel')}
            onClick={() => {
              handleDismiss();
            }}
          />
        </DialogFooter>
      </div>
    );
  };

  const renderSubscriptionSelectionStep = () => {
    const dropdownStyles = { dropdown: { width: '100%', marginBottom: 10 } };
    return (
      <div>
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
          label={formatMessage('Azure subscription')}
          options={
            availableSubscriptions
              ?.filter((p) => p.subscriptionId && p.displayName)
              .map((p) => {
                return { key: p.subscriptionId ?? '', text: p.displayName ?? formatMessage('Unnamed') };
              }) ?? []
          }
          placeholder={formatMessage('Select a subscription')}
          selectedKey={subscriptionId}
          styles={dropdownStyles}
          onChange={onChangeSubscription}
        />

        <div>
          {noKeys && subscriptionId && (
            <span style={{ color: NeutralColors.gray100 }}>
              {formatMessage(
                'No existing {service} resources were found in this subscription. Select a different subscription, or click “Back” to create a new resource or generate a resource request to handoff to your Azure admin.',
                {
                  service: SERVICE_NAME,
                }
              )}
            </span>
          )}
          {!noKeys && subscriptionId && (
            <div>
              <Dropdown
                disabled={!(keys?.length > 0) || nextAction !== 'choose'}
                label={formatMessage('{service} resource name', { service: SERVICE_NAME })}
                options={
                  keys.map((p) => {
                    return { text: p.name, ...p };
                  }) ?? []
                }
                placeholder={formatMessage('Select resource')}
                styles={dropdownStyles}
                onChange={onChangeKey}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          {loading && <Spinner label={loading} labelPosition="right" styles={{ root: { float: 'left' } }} />}
          <DefaultButton disabled={!!loading} text={formatMessage('Back')} onClick={() => setCurrentStep('option')} />
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

  const renderOutcomeStep = () => {
    return null;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'option':
        return renderOptionStep();
      case 'subscription': {
        return renderSubscriptionSelectionStep();
      }
      case 'knowledge-base':
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
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: <DialogTitle />,
          styles: styles.dialog,
        }}
        hidden={hidden || showAuthDialog}
        modalProps={{
          isBlocking: false,
          styles: styles.modalCreateFromUrl,
        }}
        onDismiss={handleDismiss}
      >
        {renderCurrentStep()}
      </Dialog>
    </Fragment>
  );
};

export default ReplaceQnAOptionsModal;
