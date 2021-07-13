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
  CheckboxVisibility,
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
import { IRenderFunction } from '@uifabric/utilities';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { getKBName, getFileLocale } from '../../utils/qnaUtil';
import { dispatcherState, currentUserState, isAuthenticatedState, showAuthDialogState } from '../../recoilModel';

import { localeToLanguage } from './utilities';
import { ReplaceQnAModalFormData, ReplaceQnAModalProps } from './constants';
import {
  styles,
  subText,
  contentBox,
  formContainer,
  choiceContainer,
  titleStyle,
  descriptionStyle,
  resourceDropdown,
  dialogBodyStyles,
} from './styles';
import { ImportQnAFromUrl } from './ImportQnAFromUrl';
import { PersonaCard } from './PersonaCard';

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

const mainElementStyle = { marginBottom: 20 };
const serviceName = 'QnA Maker';
const serviceKeyType = 'QnAMaker';

export const ReplaceQnAFromModal: React.FC<ReplaceQnAModalProps> = (props) => {
  const { onDismiss, onSubmit, hidden, qnaFile, projectId, containerId } = props;
  const actions = useRecoilValue(dispatcherState);
  const [formData, setFormData] = useState<ReplaceQnAModalFormData>();
  const [disabled, setDisabled] = useState(true);
  const { setApplicationLevelError, requireUserLogin } = useRecoilValue(dispatcherState);
  const currentUser = useRecoilValue(currentUserState);
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  const showAuthDialog = useRecoilValue(showAuthDialogState);

  const [subscriptionId, setSubscription] = useState<string>('');
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [noKeys, setNoKeys] = useState<boolean>(false);
  const [nextAction, setNextAction] = useState<string>('url');
  const [key, setKey] = useState<KeyRec>();
  const [region, setRegion] = useState<string>('');
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsErrorMessage, setSubscriptionsErrorMessage] = useState<string>();
  const [keys, setKeys] = useState<KeyRec[]>([]);
  const [kbs, setKbs] = useState<{ [key: string]: KBRec[] }>({});

  const [selectedKb, setSelectedKb] = useState<KBRec>();
  const [dialogTitle, setDialogTitle] = useState<string>('');

  const [currentStep, setCurrentStep] = useState<Step>('intro');

  const currentLocale = getFileLocale(containerId);
  const currentAuthoringLanuage = localeToLanguage(currentLocale);

  const actionOptions: IChoiceGroupOption[] = [
    { key: 'url', text: formatMessage('Replace knowledge base from URL') },
    {
      key: 'portal',
      text: formatMessage('Replace with an existing knowledge base from QnA maker portal'),
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
    if (isAuthenticated) {
      setAvailableSubscriptions([]);
      setSubscriptionsErrorMessage(undefined);
      getSubscriptions(currentUser.token)
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
  }, [currentUser, isAuthenticated]);

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
    if (isAuthenticated) {
      setLoading(formatMessage('Loading keys...'));
      setNoKeys(false);
      const tokenCredentials = new TokenCredentials(currentUser.token);
      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);
      const accounts = await cognitiveServicesManagementClient.accounts.list();
      const keylist: KeyRec[] = await fetchKeys(
        cognitiveServicesManagementClient,
        accounts.filter((a) => a.kind === serviceKeyType)
      );

      const kbsMap = {};
      const avaliableKeys: KeyRec[] = [];
      for (const keyItem of keylist) {
        const kbGroups = await fetchKBGroups(keyItem);
        kbsMap[keyItem.name] = kbGroups;
        if (kbGroups.length) {
          avaliableKeys.push(keyItem);
        }
      }
      setKbs(kbsMap);
      setLoading(undefined);
      if (avaliableKeys.length == 0) {
        setNoKeys(true);
      } else {
        setNoKeys(false);
        setKeys(avaliableKeys);
      }
    }
  };

  const fetchKBGroups = async (key: KeyRec) => {
    let kblist: KBRec[] = [];
    if (isAuthenticated && key) {
      const cognitiveServicesCredentials = new CognitiveServicesCredentials(key.key);
      const resourceClient = new QnAMakerClient(cognitiveServicesCredentials, key.endpoint);
      const result = await resourceClient.knowledgebase.listAll();
      if (result.knowledgebases) {
        kblist = result.knowledgebases.map((item: any) => {
          return {
            id: item.id || '',
            name: item.name || '',
            language: item.language || '',
            lastChangedTimestamp: item.lastChangedTimestamp || '',
          };
        });
      }
    }
    return kblist;
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
    setCurrentStep('knowledge-base');
  };

  const performNextAction = () => {
    if (nextAction !== 'portal') {
      onSubmitFormData();
    } else {
      requireUserLogin();
      setCurrentStep('resource');
    }
  };

  const renderIntroStep = () => {
    return (
      <div>
        <div style={{ marginBottom: 14 }}>
          <span css={subText}>
            {formatMessage('Create a knowledge base from a URL or import content from an existing knowledge base')}
          </span>
        </div>
        <div css={contentBox}>
          <div css={choiceContainer}>
            <ChoiceGroup options={actionOptions} selectedKey={nextAction} onChange={onChangeAction} />
          </div>
          <div css={formContainer}>
            {nextAction === 'url' ? (
              qnaFile && <ImportQnAFromUrl qnaFile={qnaFile} onChange={onFormDataChange} />
            ) : (
              <div>
                <div style={titleStyle}>
                  {formatMessage('Replace with an existing knowledge base from QnA maker portal')}
                </div>
                <div style={descriptionStyle}>
                  {formatMessage(
                    'Select this option when you want to import existing knowledge base from QnA maker portal. '
                  )}
                </div>
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
          <div style={{ marginBottom: 14 }}>
            {formatMessage('Select the subscription and resource you want to choose a knowledge base from')}
          </div>
          <div css={mainElementStyle}>
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
              styles={resourceDropdown}
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
                  styles={resourceDropdown}
                  onChange={onChangeKey}
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <div style={{ float: 'left' }}>
            <PersonaCard />
          </div>
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

    const currentKbs = key ? kbs[key.name] : [];
    currentKbs.forEach((item) => {
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
            {`Select a knowledge base to to replace content for ${kbName} (${language}). This will replace all current content in your knowledge base.`}
          </p>
          <div css={mainElementStyle}>
            <DetailsList
              enterModalSelectionOnTouch
              isHeaderVisible
              selectionPreservedOnEmptyClick
              ariaLabelForSelectAllCheckbox="Toggle selection for all items"
              ariaLabelForSelectionColumn="Toggle selection"
              checkboxVisibility={CheckboxVisibility.hidden}
              checkButtonAriaLabel="select row"
              columns={columns}
              getKey={(item) => item.name}
              items={sortedKbs}
              layoutMode={DetailsListLayoutMode.justified}
              selection={selectedKB}
              selectionMode={SelectionMode.single}
              onRenderRow={onRenderRow}
            />
          </div>
        </div>
        <DialogFooter>
          {loading && <Spinner label={loading} labelPosition="right" styles={{ root: { float: 'left' } }} />}
          <DefaultButton disabled={!!loading} text={formatMessage('Back')} onClick={() => setCurrentStep('resource')} />
          <PrimaryButton
            disabled={!!loading || !isAuthenticated || !subscriptionId}
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
    if (key && isAuthenticated && selectedKb && formData) {
      onSubmit({
        ...formData,
        endpoint: key.endpoint,
        kbId: selectedKb.id,
        kbName: selectedKb.name,
        subscriptionKey: key.key,
      });
      TelemetryClient.track('UpdateKnowledgeBaseCompleted', { source: 'kb' });
    }
  };

  return (
    <Fragment>
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
