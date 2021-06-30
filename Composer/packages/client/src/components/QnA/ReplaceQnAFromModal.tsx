// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import {
  DetailsList,
  SelectionMode,
  DetailsListLayoutMode,
  IColumn,
  Selection,
  IDetailsRowProps,
  DetailsRow,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { TokenCredentials } from '@azure/ms-rest-js';
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js';
import { QnAMakerClient } from '@azure/cognitiveservices-qnamaker';
import sortBy from 'lodash/sortBy';
import { NeutralColors } from '@uifabric/fluent-theme';
import { AzureTenant } from '@botframework-composer/types';
import jwtDecode from 'jwt-decode';
import { IRenderFunction } from '@uifabric/utilities';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../Auth/AuthDialog';
import { getTokenFromCache, isShowAuthDialog, userShouldProvideTokens } from '../../utils/auth';
import { dispatcherState } from '../../recoilModel';
import { getKBName, getFileLocale } from '../../utils/qnaUtil';

import { localeToLanguage } from './utilities';
import { ReplaceQnAModalFormData, ReplaceQnAModalProps } from './constants';
import {
  styles,
  contentBox,
  formContainer,
  choiceContainer,
  titleStyle,
  descriptionStyle,
  signInButton,
  accountInfo,
} from './styles';
import { ImportQnAFromUrl } from './ImportQnAFromUrl';

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

type Step = 'intro' | 'resource' | 'knowledge-base' | 'outcome';

const dropdownStyles = { dropdown: { width: 245, marginBottom: 10 } };
const mainElementStyle = { marginBottom: 20 };
const dialogBodyStyles = { height: 464, width: 920 };
const serviceName = 'QnA Maker';
const serviceKeyType = 'QnAMaker';

export const ReplaceQnAFromModal: React.FC<ReplaceQnAModalProps> = (props) => {
  const { onDismiss, onSubmit, hidden, qnaFile, projectId, containerId } = props;
  const actions = useRecoilValue(dispatcherState);
  const [formData, setFormData] = useState<ReplaceQnAModalFormData>();
  const [disabled, setDisabled] = useState(true);

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [token, setToken] = useState<string | undefined>();

  const { setApplicationLevelError } = useRecoilValue(dispatcherState);
  const [subscriptionId, setSubscription] = useState<string>('');
  const [tenantId, setTenantId] = useState<string>('');
  const [allTenants, setAllTenants] = useState<AzureTenant[]>([]);
  const [signedInAccount, setSignedInAccount] = useState('');
  const [tenantsErrorMessage, setTenantsErrorMessage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [noKeys, setNoKeys] = useState<boolean>(false);
  const [nextAction, setNextAction] = useState<string>('url');
  const [key, setKey] = useState<KeyRec>();
  const [region, setRegion] = useState<string>('');
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsErrorMessage, setSubscriptionsErrorMessage] = useState<string>();
  const [keys, setKeys] = useState<KeyRec[]>([]);
  const [kbs, setKbs] = useState<KBRec[]>([]);
  const [kbLoading, setKbLoading] = useState<string | undefined>(undefined);
  const [selectedKb, setSelectedKb] = useState<KBRec>();
  const [dialogTitle, setDialogTitle] = useState<string>('');

  const [userProvidedTokens, setUserProvidedTokens] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<Step>('intro');

  const currentLocale = getFileLocale(containerId);
  const currentAuthoringLanuage = localeToLanguage(currentLocale);

  const actionOptions: IChoiceGroupOption[] = [
    { key: 'url', text: formatMessage('Replace KB from URL or file ') },
    {
      key: 'portal',
      text: formatMessage('Replace with an existing KB from QnA maker portal'),
    },
  ];

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
  const decodeToken = (token: string) => {
    try {
      return jwtDecode<any>(token);
    } catch (err) {
      console.error('decode token error in ', err);
      return null;
    }
  };

  const selectedKB = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const t = selectedKB.getSelection()[0] as KBRec;

        if (t) {
          setSelectedKb(t);
        }
      },
    });
  }, []);

  useEffect(() => {
    if (currentStep === 'resource' && !userShouldProvideTokens()) {
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
    setCurrentStep('resource');
  };

  useEffect(() => {
    // reset the ui
    if (!hidden) {
      setSubscription('');
      setKeys([]);
      setCurrentStep('intro');
    }
  }, [hidden]);

  const fetchKeys = async (cognitiveServicesManagementClient, accounts) => {
    const keyList: KeyRec[] = [];
    for (const account in accounts) {
      const resourceGroup = accounts[account].id?.replace(/.*?\/resourceGroups\/(.*?)\/.*/, '$1');
      const name = accounts[account].name;
      if (resourceGroup && name) {
        try {
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
        } catch (_err) {
          // pass, filter no authorization resource
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
        accounts.filter((a) => a.kind === serviceKeyType)
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

  const fetchKBGroups = async () => {
    if (token && key) {
      setKbLoading(formatMessage('Loading knowledge base...'));
      const cognitiveServicesCredentials = new CognitiveServicesCredentials(key.key);
      const resourceClient = new QnAMakerClient(cognitiveServicesCredentials, key.endpoint);
      const result = await resourceClient.knowledgebase.listAll();
      if (result.knowledgebases) {
        const kblist: KBRec[] = result.knowledgebases.map((item: any) => {
          return {
            id: item.id || '',
            name: item.name || '',
            language: item.language || '',
            lastChangedTimestamp: item.lastChangedTimestamp || '',
          };
        });

        if (kblist?.length) {
          setKbs(kblist);
        }
      }
      setKbLoading(undefined);
    }
  };

  // allow a user to provide a subscription id if one is missing
  const onChangeSubscription = async (_, opt) => {
    // get list of keys for this subscription
    setSubscription(opt.key);
    fetchAccounts(opt.key);
    setLoading(formatMessage('Loading subscription...'));
  };

  const onChangeKey = async (_, opt) => {
    // get list of keys for this subscription
    setKey(opt);
    setRegion(opt.region);
  };

  const onChangeAction = async (_, opt) => {
    setNextAction(opt.key);
    if (opt.key === 'url') {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  };

  const chooseExistingKey = () => {
    TelemetryClient.track('SettingsGetKeysExistingResourceSelected', {
      subscriptionId,
      resourceType: serviceName,
    });
    fetchKBGroups();
    setCurrentStep('knowledge-base');
  };

  const performNextAction = () => {
    if (nextAction !== 'portal') {
      onSubmitFormData();
    } else {
      hasAuth();
    }
  };

  const renderIntroStep = () => {
    const shouldProvideTokens = userShouldProvideTokens();
    if (!shouldProvideTokens) {
      AuthClient.getAccount().then((account) => {
        setSignedInAccount(account.loginName);
      });
    }
    return (
      <div>
        <div css={contentBox}>
          <div css={choiceContainer}>
            <ChoiceGroup options={actionOptions} selectedKey={nextAction} onChange={onChangeAction} />
          </div>
          <div css={formContainer}>
            {nextAction === 'url' ? (
              qnaFile && <ImportQnAFromUrl qnaFile={qnaFile} onChange={onFormDataChange} />
            ) : (
              <div>
                <div style={titleStyle}>{formatMessage('Replace with an existing KB from QnA maker portal')}</div>
                <div style={descriptionStyle}>
                  {formatMessage('Select this option when you want to import existing KB from QnA maker portal. ')}
                </div>
                {!shouldProvideTokens &&
                  (signedInAccount ? (
                    <div style={accountInfo}>
                      <span>{`Signed in as ${signedInAccount}. Click `}</span>
                      <span style={signInButton} onClick={performNextAction}>
                        {'next '}
                      </span>
                      <span>{'to select KBs'}</span>
                    </div>
                  ) : (
                    <div style={signInButton} onClick={performNextAction}>
                      {formatMessage('Sign in to Azure to continue')}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <PrimaryButton
            data-testid={'ReplaceKnowledgeBase'}
            disabled={disabled}
            text={formatMessage('Next')}
            onClick={performNextAction}
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

  const renderChooseResourceStep = () => {
    return (
      <div>
        <div css={dialogBodyStyles}>
          <p css={{ marginTop: 0 }}>
            {formatMessage('Select the Azure directory and resource you want to choose a knowledge base from')}
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
          </div>
          <div>
            {noKeys && subscriptionId && (
              <span style={{ color: NeutralColors.gray100 }}>
                {formatMessage(
                  'No existing QnA Maker resources were found in this subscription. Select a different subscription, or click “Back” to create a new resource or generate a resource request to handoff to your Azure admin.'
                )}
              </span>
            )}
            {!noKeys && subscriptionId && (
              <div>
                <Dropdown
                  disabled={!(keys?.length > 0)}
                  label={formatMessage('QnA Maker resource name')}
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

  const renderKnowledgeBaseSelectionStep = () => {
    const columns: IColumn[] = [
      {
        key: 'column1',
        name: 'Name',
        fieldName: 'name',
        minWidth: 50,
        maxWidth: 150,
        isRowHeader: true,
        isResizable: true,
        isSorted: true,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'Sorted A to Z',
        sortDescendingAriaLabel: 'Sorted Z to A',
        data: 'string',
        isPadded: true,
      },
      {
        key: 'column2',
        name: 'Last modified',
        fieldName: 'lastModified',
        minWidth: 200,
        maxWidth: 300,
        isResizable: true,
        data: 'string',
        isPadded: true,
        onRender: (item) => {
          const dt = new Date(item.lastChangedTimestamp);
          return (
            <span>
              {' '}
              {dt.toDateString()} {dt.toLocaleTimeString()}{' '}
            </span>
          );
        },
      },
      {
        key: 'column3',
        name: 'Language',
        fieldName: 'language',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        isCollapsible: true,
        data: 'string',
        isPadded: true,
      },
    ];

    const currentLanguageKbs: KBRec[] = [];
    const disabledLanguageKbs: KBRec[] = [];

    kbs.forEach((item) => {
      if (item.language === currentAuthoringLanuage) {
        currentLanguageKbs.push(item);
      } else {
        disabledLanguageKbs.push(item);
      }
    });

    const sortedKbs = [...currentLanguageKbs, ...disabledLanguageKbs];

    const onRenderRow: IRenderFunction<IDetailsRowProps> = (props) => {
      if (!props) return null;
      if (props.item.language === currentAuthoringLanuage) {
        return <DetailsRow {...props} />;
      } else {
        return (
          <span data-selection-disabled style={{ cursor: 'not-allowed' }}>
            <DetailsRow {...props} />
          </span>
        );
      }
    };

    const kbName = getKBName(containerId);
    const language = localeToLanguage(getFileLocale(containerId));
    return (
      <div>
        <div css={dialogBodyStyles}>
          <p css={{ marginTop: 0 }}>
            {`Select a KB to to replace content for ${kbName} (${language}). This will replace all current content in your knowledge base.`}
          </p>
          <div css={mainElementStyle}>
            <DetailsList
              enterModalSelectionOnTouch
              isHeaderVisible
              selectionPreservedOnEmptyClick
              ariaLabelForSelectAllCheckbox="Toggle selection for all items"
              ariaLabelForSelectionColumn="Toggle selection"
              checkButtonAriaLabel="select row"
              columns={columns}
              getKey={(item) => item.name}
              items={sortedKbs}
              layoutMode={DetailsListLayoutMode.justified}
              selection={selectedKB}
              selectionMode={SelectionMode.single}
              onRenderRow={onRenderRow}
            />
            {kbLoading && <Spinner label={kbLoading} labelPosition="bottom" />}
            {kbs.length === 0 && !kbLoading && (
              <p style={{ textAlign: 'center' }}> {formatMessage('No avaliable knowledge base')} </p>
            )}
          </div>
        </div>
        <DialogFooter>
          {loading && <Spinner label={loading} labelPosition="right" styles={{ root: { float: 'left' } }} />}
          <DefaultButton disabled={!!loading} text={formatMessage('Back')} onClick={() => setCurrentStep('resource')} />
          <PrimaryButton
            disabled={!!loading || (!userProvidedTokens && !tenantId) || !subscriptionId}
            text={formatMessage('Next')}
            onClick={onSubmitImportKB}
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
      case 'resource': {
        if (nextAction === 'portal') {
          return renderChooseResourceStep();
        }
        break;
      }
      case 'knowledge-base':
        return renderKnowledgeBaseSelectionStep();
      default:
        return null;
    }
  };

  useEffect(() => {
    switch (currentStep) {
      case 'intro':
        setDialogTitle(formatMessage('Replace knowledge base content'));
        break;
      case 'resource':
        if (nextAction === 'portal') {
          setDialogTitle(formatMessage('Choose QnA resources'));
        }
        break;
      case 'knowledge-base':
        setDialogTitle(formatMessage('Choose a knowledge base to import'));
        break;
    }
  }, [currentStep]);

  const handleDismiss = () => {
    onDismiss?.();
    actions.createQnADialogCancel({ projectId });
    TelemetryClient.track('UpdateKnowledgeBaseCanceled');
  };

  const onFormDataChange = (data, disabled) => {
    setFormData(data);
    setDisabled(disabled);
  };

  const onSubmitFormData = () => {
    if (disabled || !formData) {
      return;
    }
    onSubmit(formData);
    TelemetryClient.track('UpdateKnowledgeBaseCompleted', { source: formData.url ? 'url' : 'none' });
  };

  const onSubmitImportKB = async () => {
    if (key && token && selectedKb && formData) {
      onSubmit({ ...formData, endpoint: key.endpoint, kbId: selectedKb.id, subscriptionKey: key.key });
      TelemetryClient.track('UpdateKnowledgeBaseCompleted', { source: 'kb' });
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
          title: dialogTitle,
        }}
        hidden={hidden || showAuthDialog}
        minWidth={480}
        modalProps={{
          isBlocking: true,
          isClickableOutsideFocusTrap: true,
          styles: styles.modalCreateFromUrl,
        }}
        onDismiss={loading ? () => {} : handleDismiss}
      >
        {renderCurrentStep()}
      </Dialog>
    </Fragment>
  );
};

export default ReplaceQnAFromModal;
