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
import { Link } from 'office-ui-fabric-react/lib/Link';
import {
  DetailsList,
  SelectionMode,
  DetailsListLayoutMode,
  IColumn,
  Selection,
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

import TelemetryClient from '../../telemetry/TelemetryClient';
import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { getTokenFromCache, isShowAuthDialog, userShouldProvideTokens } from '../../utils/auth';
import { createQnAOnState, showCreateQnADialogState, settingsState, dispatcherState } from '../../recoilModel';

import { CreateQnAFormData, CreateQnAModalProps, QnAMakerLearnMoreUrl } from './constants';
import { subText, styles, contentBox, formContainer, choiceContainer } from './styles';
import { CreateQnAFromUrl } from './CreateQnAFromUrl';
import { CreateQnAFromScratch } from './CreateQnAFromScratch';
import { CreateQnAFromQnAMaker } from './CreateQnAFromQnAMaker';

// const qnaBuild = require('@microsoft/bf-lu/lib/parser/qnabuild/builder.js');
// const KB = require('@microsoft/bf-lu/lib/parser/qna/qnamaker/kb.js');

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

const dropdownStyles = { dropdown: { width: '100%', marginBottom: 10 } };
const mainElementStyle = { marginBottom: 20 };
const dialogBodyStyles = { height: 400, width: 960 };
const serviceName = 'QnA Maker';
const serviceKeyType = 'QnAMaker';

export const CreateQnAModal: React.FC<CreateQnAModalProps> = (props) => {
  const { onDismiss, onSubmit } = props;
  const { projectId } = useRecoilValue(createQnAOnState);
  const settings = useRecoilValue(settingsState(projectId));
  const actions = useRecoilValue(dispatcherState);
  const locales = settings.languages;
  const defaultLocale = settings.defaultLanguage;
  const showCreateQnAFrom = useRecoilValue(showCreateQnADialogState(projectId));
  const [initialName, setInitialName] = useState<string>('');
  const [formData, setFormData] = useState<CreateQnAFormData>();
  const [disabled, setDisabled] = useState(true);

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [token, setToken] = useState<string | undefined>();

  const { setApplicationLevelError } = useRecoilValue(dispatcherState);
  const [subscriptionId, setSubscription] = useState<string>('');
  const [tenantId, setTenantId] = useState<string>('');
  const [allTenants, setAllTenants] = useState<AzureTenant[]>([]);
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
  const [selectedKb, setSelectedKb] = useState<KBRec>();
  const [dialogTitle, setDialogTitle] = useState<string>('');

  const [userProvidedTokens, setUserProvidedTokens] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<Step>('intro');

  const actionOptions: IChoiceGroupOption[] = [
    { key: 'url', text: formatMessage('Create new KB from URL or file ') },
    {
      key: 'portal',
      text: formatMessage('Import existing KB from QnA maker portal'),
    },
    { key: 'scratch', text: formatMessage('Create an empty KB') },
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
    setSubscription('');
    setKeys([]);
    setCurrentStep('intro');
  }, [showCreateQnAFrom]);

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
  };

  const onChangeKey = async (_, opt) => {
    // get list of keys for this subscription
    setKey(opt);
    setRegion(opt.region);
  };

  const onChangeAction = async (_, opt) => {
    setNextAction(opt.key);
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
    return (
      <div>
        <p>
          <span css={subText}>
            {formatMessage('Use Azure QnA Maker to extract question-and-answer pairs from an online FAQ. ')}
            <Link href={QnAMakerLearnMoreUrl} target={'_blank'}>
              {formatMessage('Learn more')}
            </Link>
          </span>
        </p>
        <div css={contentBox}>
          <div css={choiceContainer}>
            <ChoiceGroup options={actionOptions} selectedKey={nextAction} onChange={onChangeAction} />
          </div>
          <div css={formContainer}>
            {nextAction === 'url' ? (
              <CreateQnAFromUrl
                {...props}
                defaultLocale={defaultLocale}
                initialName={initialName}
                locales={locales}
                onChange={onFormDataChange}
                onUpdateInitialName={setInitialName}
              />
            ) : nextAction === 'scratch' ? (
              <CreateQnAFromScratch
                {...props}
                defaultLocale={defaultLocale}
                initialName={initialName}
                locales={locales}
                onChange={onFormDataChange}
                onUpdateInitialName={setInitialName}
              />
            ) : (
              <CreateQnAFromQnAMaker
                {...props}
                defaultLocale={defaultLocale}
                initialName={initialName}
                locales={locales}
                onChange={onFormDataChange}
                onUpdateInitialName={setInitialName}
              />
            )}
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
        key: 'column2',
        name: 'Name',
        fieldName: 'name',
        minWidth: 50,
        maxWidth: 350,
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
        key: 'column3',
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
        key: 'column4',
        name: 'Locale',
        fieldName: 'language',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        isCollapsible: true,
        data: 'string',
        isPadded: true,
      },
    ];

    return (
      <div>
        <div css={dialogBodyStyles}>
          <p css={{ marginTop: 0 }}>{formatMessage('Select one or more KB to import into your bot project')}</p>
          <div css={mainElementStyle}>
            <DetailsList
              items={kbs}
              columns={columns}
              getKey={(item) => item.name}
              selection={selectedKB}
              selectionMode={SelectionMode.single}
              layoutMode={DetailsListLayoutMode.justified}
              isHeaderVisible={true}
              selectionPreservedOnEmptyClick={true}
              enterModalSelectionOnTouch={true}
              ariaLabelForSelectionColumn="Toggle selection"
              ariaLabelForSelectAllCheckbox="Toggle selection for all items"
              checkButtonAriaLabel="select row"
            />
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
        setDialogTitle(formatMessage('Add QnA Maker knowledge base'));
        break;
      case 'resource':
        if (nextAction === 'portal') {
          setDialogTitle(formatMessage('Select source knowledge base location'));
        }
        break;
      case 'knowledge-base':
        setDialogTitle(formatMessage('Choose a knowledge base to import'));
        break;
    }
  }, [currentStep]);

  const handleDismiss = () => {
    onDismiss?.();
    setInitialName('');
    actions.createQnADialogCancel({ projectId });
    TelemetryClient.track('AddNewKnowledgeBaseCanceled');
  };

  const onFormDataChange = (data, disabled) => {
    console.log(data, disabled);
    setFormData(data);
    setDisabled(disabled);
  };

  const onSubmitFormData = () => {
    if (disabled || !formData) {
      return;
    }
    onSubmit(formData);
    setInitialName('');
    TelemetryClient.track('AddNewKnowledgeBaseCompleted', { scratch: true });
  };

  const onSubmitImportKB = async () => {
    console.log(selectedKb, formData);
    if (key && token && selectedKb) {
      const cognitiveServicesCredentials = new CognitiveServicesCredentials(key.key);
      const resourceClient = new QnAMakerClient(cognitiveServicesCredentials, key.endpoint);

      const result = await resourceClient.knowledgebase.download(selectedKb.id, 'Prod');
      console.log(result);
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
        hidden={!showCreateQnAFrom || showAuthDialog}
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

export default CreateQnAModal;
