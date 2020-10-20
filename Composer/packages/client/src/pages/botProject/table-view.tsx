// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { PublishTarget } from '@bfc/shared';
import { TextField, ITextFieldProps, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ActionButton, Button } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import get from 'lodash/get';

import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { navigateTo } from '../../utils/navigation';
import {
  settingsState,
  localeState,
  showAddLanguageModalState,
  publishTypesState,
  botDisplayNameState,
} from '../../recoilModel/atoms';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { dispatcherState } from '../../recoilModel';
import { botProjectSpaceSelector } from '../../recoilModel/selectors/project';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { AddLanguageModal } from '../../components/MultiLanguage';
import { languageListTemplates } from '../../components/MultiLanguage';
import { CreatePublishTarget } from '../publish/createPublishTarget';
import settingStorage from '../../utils/dialogSettingStorage';

import { RuntimeSettings } from './runtime-settings/RuntimeSettings';
import {
  container,
  titleStyle,
  labelContainer,
  customerLabel,
  appIdOrPassWordStyle,
  botLanguageDescriptionStyle,
  botLanguageFieldStyle,
  manageBotLanguage,
  languageItem,
  botLanguageContainerStyle,
  customRuntimeStyle,
  deleteBotText,
  deleteBotButton,
  publishTargetsContainer,
  publishTargetsHeader,
  publishTargetsHeaderText,
  publishTargetsItem,
  publishTargetsItemText,
  addPublishProfile,
  editPublishProfile,
  publishTargetsStyle,
  publishTargetsEditButton,
  marginBottom,
  luiskeyStyle,
  luisregionStyle,
  unknownIconStyle,
} from './styles';

// const CodeEditor = React.lazy(() => import('./code-editor'));
interface BotProjectSettingsProps extends RouteComponentProps<{}> {
  projectId?: string;
  hasSkills: boolean;
}

interface ErrorMsg {
  MicrosoftAppId?: string;
  MicrosoftPassword?: string;
}

const TableView: React.FC<BotProjectSettingsProps> = (props) => {
  const { projectId = '', hasSkills = false } = props;

  const {
    addLanguageDialogCancel,
    addLanguages,
    addLanguageDialogBegin,
    deleteBot,
    setSettings,
    setPublishTargets,
    getPublishTargetTypes,
  } = useRecoilValue(dispatcherState);
  const botProjectsMetaData = useRecoilValue(botProjectSpaceSelector);
  const botProject = botProjectsMetaData.find((b) => b.projectId === projectId);
  const isRootBot = botProject?.isRootBot;
  const settings = useRecoilValue(settingsState(projectId));
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const sensitiveGroupManageProperty = settingStorage.get(rootBotProjectId);
  const groupLUISAuthoringKey = get(sensitiveGroupManageProperty, 'luis.authoringKey', {});
  const rootLuisKey = groupLUISAuthoringKey[rootBotProjectId];
  const skillLuisKey = groupLUISAuthoringKey[projectId];
  const groupLUISRegion = get(sensitiveGroupManageProperty, 'luis.authoringRegion', {});
  const rootLuisRegion = groupLUISRegion[rootBotProjectId];
  const skillLuisRegion = groupLUISRegion[projectId];
  const groupQnAKey = get(sensitiveGroupManageProperty, 'qna.subscriptionKey', {});
  const rootqnaKey = groupQnAKey[rootBotProjectId];
  const skillqnaKey = groupQnAKey[projectId];
  const {
    languages,
    defaultLanguage,
    publishTargets,
    MicrosoftAppId,
    MicrosoftAppPassword,
    skillHostEndpoint,
  } = useRecoilValue(settingsState(projectId));
  const publishTypes = useRecoilValue(publishTypesState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const showAddLanguageModal = useRecoilValue(showAddLanguageModalState(projectId));
  const [addDialogHidden, setAddDialogHidden] = useState(true);
  const [editDialogHidden, setEditDialogHidden] = useState(true);
  const botName = useRecoilValue(botDisplayNameState(projectId));

  const [dialogProps, setDialogProps] = useState({
    title: formatMessage('Title'),
    type: DialogType.normal,
    children: {},
  });

  const luisKeyComponentRef = useRef<ITextField>(null);
  const luisRegionComponentRef = useRef<ITextField>(null);
  const qnASubscriptionKeyComponentRef = useRef<ITextField>(null);
  const [isluisKeyComponentDisabled, setLuisKeyComponentDisabled] = useState<boolean>(!isRootBot && !skillLuisKey);
  const [isluisregionComponentDisabled, setluisregionComponentDisabled] = useState<boolean>(
    !isRootBot && !skillLuisRegion
  );
  const [isQnASubscriptionKeyComponentDisabled, setQnASubscriptionKeyComponentDisabled] = useState<boolean>(
    !isRootBot && !skillqnaKey
  );
  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    setLuisKeyComponentDisabled(!isRootBot && !skillLuisKey);
    setluisregionComponentDisabled(!isRootBot && !skillLuisRegion);
    setQnASubscriptionKeyComponentDisabled(!isRootBot && !skillqnaKey);
  }, [projectId]);

  const [editDialogProps, setEditDialogProps] = useState({
    title: formatMessage('Title'),
    type: DialogType.normal,
    children: {},
  });

  const [editTarget, setEditTarget] = useState<{ index: number; item: PublishTarget } | null>(null);

  const [errorsMsg, setErrorsMsg] = useState<ErrorMsg>({});

  const onEdit = async (index: number, item: PublishTarget) => {
    const newItem = { item: item, index: index };
    setEditTarget(newItem);
    setEditDialogHidden(false);
  };

  const savePublishTarget = useCallback(
    async (name: string, type: string, configuration: string) => {
      const targets = (publishTargets || []).concat([
        {
          name,
          type,
          configuration,
        },
      ]);
      await setPublishTargets(targets, projectId);
    },
    [publishTargets, projectId, botName]
  );

  const updatePublishTarget = useCallback(
    async (name: string, type: string, configuration: string) => {
      if (!editTarget) {
        return;
      }

      const targets = publishTargets ? [...publishTargets] : [];

      targets[editTarget.index] = {
        name,
        type,
        configuration,
      };

      await setPublishTargets(targets, projectId);
    },
    [publishTargets, projectId, botName, editTarget]
  );

  useEffect(() => {
    setDialogProps({
      title: formatMessage('Add a publish profile'),
      type: DialogType.normal,
      children: (
        <CreatePublishTarget
          closeDialog={() => setAddDialogHidden(true)}
          current={null}
          targets={publishTargets || []}
          types={publishTypes}
          updateSettings={savePublishTarget}
        />
      ),
    });
  }, [publishTypes, savePublishTarget, publishTargets]);

  useEffect(() => {
    setEditDialogProps({
      title: formatMessage('Edit a publish profile'),
      type: DialogType.normal,
      children: (
        <CreatePublishTarget
          closeDialog={() => setEditDialogHidden(true)}
          current={editTarget ? editTarget.item : null}
          targets={(publishTargets || []).filter((item) => editTarget && item.name != editTarget.item.name)}
          types={publishTypes}
          updateSettings={updatePublishTarget}
        />
      ),
    });
  }, [editTarget, publishTypes, updatePublishTarget]);

  const onAddLangModalSubmit = async (formData) => {
    await addLanguages({
      ...formData,
      projectId,
    });
  };

  const languageListOptions = useMemo(() => {
    const languageList = languageListTemplates(languages, locale, defaultLanguage);
    const enableLanguages = languageList.filter(({ isEnabled }) => !!isEnabled);
    return enableLanguages.map((item) => {
      const { language, locale } = item;
      return {
        key: locale,
        title: locale,
        text: language,
      };
    });
  }, [languages]);

  const onRenderLabel = (props: ITextFieldProps | undefined) => {
    return (
      <div css={labelContainer}>
        <div css={customerLabel}> {props?.label} </div>
        <TooltipHost content={props?.label}>
          <Icon iconName={'Unknown'} styles={unknownIconStyle(props?.required)} />
        </TooltipHost>
      </div>
    );
  };

  const SkillHostEndPoint = useMemo(() => {
    return (
      <TextField
        aria-labelledby={'SkillHostEndPoint'}
        label={formatMessage('Skill host endpoint url')}
        placeholder={'Enter Skill host endpoint url'}
        value={skillHostEndpoint}
        onChange={async (e, value) =>
          await setSettings(projectId, {
            ...settings,
            skillHostEndpoint: value,
          })
        }
        onRenderLabel={onRenderLabel}
      />
    );
  }, [projectId]);

  const AppIdOrPassWord = useMemo(() => {
    return (
      <div css={appIdOrPassWordStyle}>
        <TextField
          aria-labelledby={'Microsoft AppId'}
          errorMessage={hasSkills ? errorsMsg.MicrosoftAppId : ''}
          label={formatMessage('Microsoft AppId')}
          placeholder={'Enter Microsoft AppId'}
          required={hasSkills}
          value={MicrosoftAppId}
          onChange={async (e, value) => {
            await setSettings(projectId, {
              ...settings,
              MicrosoftAppId: value,
            });
            if (value) {
              setErrorsMsg({ ...errorsMsg, MicrosoftAppId: '' });
            } else {
              setErrorsMsg({ ...errorsMsg, MicrosoftAppId: formatMessage('Microsoft App Id is needed') });
            }
          }}
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'Microsoft Password'}
          errorMessage={hasSkills ? errorsMsg.MicrosoftPassword : ''}
          label={formatMessage('Microsoft Password')}
          placeholder={'Enter Microsoft Password'}
          required={hasSkills}
          styles={{ root: { marginTop: 15 } }}
          value={MicrosoftAppPassword}
          onChange={async (e, value) => {
            await setSettings(projectId, {
              ...settings,
              MicrosoftAppPassword: value,
            });
            if (value) {
              setErrorsMsg({ ...errorsMsg, MicrosoftPassword: '' });
            } else {
              setErrorsMsg({ ...errorsMsg, MicrosoftPassword: formatMessage('Microsoft App Password is needed') });
            }
          }}
          onRenderLabel={onRenderLabel}
        />
      </div>
    );
  }, [projectId, MicrosoftAppId, MicrosoftAppPassword]);

  const ExternalService = useMemo(() => {
    return (
      <div css={appIdOrPassWordStyle}>
        <TextField
          aria-labelledby={'LUIS key'}
          componentRef={luisKeyComponentRef}
          disabled={isluisKeyComponentDisabled}
          label={formatMessage('LUIS key')}
          placeholder={isRootBot ? 'Enter LUIS key' : "<---- Same as root bot's LUIS key ---->"}
          styles={luiskeyStyle(isluisKeyComponentDisabled)}
          value={isRootBot ? rootLuisKey : skillLuisKey}
          onChange={async (e, value) => {
            await setSettings(projectId, {
              ...settings,
              luis: { ...settings.luis, authoringKey: value ? value : '' },
            });
            if (!isRootBot && !value) {
              setLuisKeyComponentDisabled(true);
            }
          }}
          onRenderLabel={onRenderLabel}
        />
        {!isRootBot && (
          <ActionButton
            styles={manageBotLanguage}
            onClick={() => {
              setLuisKeyComponentDisabled(false);
              luisKeyComponentRef.current?.focus();
            }}
          >
            {formatMessage('Use custom LUIS key')}
          </ActionButton>
        )}
        <TextField
          aria-labelledby={'LUIS region'}
          componentRef={luisRegionComponentRef}
          disabled={isluisregionComponentDisabled}
          label={formatMessage('LUIS region')}
          placeholder={isRootBot ? 'Enter LUIS key' : "<---- Same as root bot's LUIS region ---->"}
          styles={luisregionStyle(isluisregionComponentDisabled)}
          value={isRootBot ? rootLuisRegion : skillLuisRegion}
          onChange={async (e, value) => {
            await setSettings(projectId, {
              ...settings,
              luis: { ...settings.luis, authoringRegion: value ? value : '' },
            });
            if (!isRootBot && !value) {
              setluisregionComponentDisabled(true);
            }
          }}
          onRenderLabel={onRenderLabel}
        />
        {!isRootBot && (
          <ActionButton
            styles={manageBotLanguage}
            onClick={() => {
              setluisregionComponentDisabled(false);
              luisRegionComponentRef.current?.focus();
            }}
          >
            {formatMessage('Use custom LUIS region')}
          </ActionButton>
        )}
        <TextField
          aria-labelledby={'QnA Maker Subscription key'}
          componentRef={qnASubscriptionKeyComponentRef}
          disabled={isQnASubscriptionKeyComponentDisabled}
          label={formatMessage('QnA Maker Subscription key')}
          placeholder={isRootBot ? 'Enter QnA Maker Subscription key' : "<---- Same as root bot's QnA key ---->"}
          styles={luisregionStyle(isQnASubscriptionKeyComponentDisabled)}
          value={isRootBot ? rootqnaKey : skillqnaKey}
          onChange={async (e, value) => {
            await setSettings(projectId, {
              ...settings,
              qna: { ...settings.qna, subscriptionKey: value ? value : '' },
            });
            if (!isRootBot && !value) {
              setQnASubscriptionKeyComponentDisabled(true);
            }
          }}
          onRenderLabel={onRenderLabel}
        />
        {!isRootBot && (
          <ActionButton
            styles={manageBotLanguage}
            onClick={() => {
              setQnASubscriptionKeyComponentDisabled(false);
              qnASubscriptionKeyComponentRef.current?.focus();
            }}
          >
            {formatMessage('Use custom QnA Maker Subscription key')}
          </ActionButton>
        )}
      </div>
    );
  }, [
    projectId,
    isluisKeyComponentDisabled,
    isluisregionComponentDisabled,
    isQnASubscriptionKeyComponentDisabled,
    isRootBot,
    rootLuisKey,
    skillLuisKey,
    rootLuisRegion,
    skillLuisRegion,
    rootqnaKey,
    skillqnaKey,
  ]);

  const BotLanguage = useMemo(() => {
    return (
      <div css={appIdOrPassWordStyle}>
        <div css={botLanguageDescriptionStyle}>
          {formatMessage(
            'List of languages that bot will be able to understand (User input) and respond to (Bot responses). To make this bot available in other languages, click ‘Manage bot languages’ to create a copy of the default language, and translate the content into the new language.'
          )}
        </div>
        <div css={botLanguageFieldStyle}>
          {languageListOptions.map((l) => (
            <div key={l.key} css={languageItem}>
              {l.text}
            </div>
          ))}
        </div>
        <ActionButton styles={manageBotLanguage} onClick={() => addLanguageDialogBegin(projectId, () => {})}>
          {formatMessage('Manage bot languages')}
        </ActionButton>
      </div>
    );
  }, [projectId, languageListOptions]);

  const DeleteBotButton = useMemo(() => {
    const openDeleteBotModal = async () => {
      const boldWarningText = formatMessage(
        'Warning: the action you are about to take cannot be undone. Going further will delete this bot and any related files in the bot project folder.'
      );
      const warningText = formatMessage('External resources will not be changed.');
      const title = formatMessage('Delete Bot');
      const checkboxLabel = formatMessage('I want to delete this bot');
      const settings = {
        onRenderContent: () => {
          return (
            <div
              style={{
                background: '#ffddcc',
                display: 'flex',
                flexDirection: 'row',
                marginBottom: '24px',
              }}
            >
              <FontIcon
                iconName="Warning12"
                style={{
                  color: '#DD4400',
                  fontSize: 36,
                  padding: '32px',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Text
                  block
                  style={{
                    fontWeight: 'bold',
                    marginTop: '24px',
                    marginRight: '24px',
                    marginBottom: '24px',
                  }}
                >
                  {boldWarningText}
                </Text>
                <Text
                  block
                  style={{
                    marginRight: '24px',
                    marginBottom: '24px',
                  }}
                >
                  {warningText}
                </Text>
              </div>
            </div>
          );
        },
        disabled: true,
        checkboxLabel,
        confirmBtnText: formatMessage('Delete'),
      };
      const res = await OpenConfirmModal(title, null, settings);
      if (res) {
        await deleteBot(projectId);
        navigateTo('home');
      }
    };
    return (
      <div css={marginBottom}>
        <div css={deleteBotText}> {formatMessage('Delete this bot')}</div>
        <Button styles={deleteBotButton} onClick={openDeleteBotModal}>
          {formatMessage('Delete')}
        </Button>
      </div>
    );
  }, [projectId]);

  const PublishTargets = useMemo(() => {
    return (
      <div css={publishTargetsContainer}>
        <div css={publishTargetsHeader}>
          <div css={publishTargetsHeaderText}>{formatMessage('Name')} </div>
          <div css={publishTargetsHeaderText}>{formatMessage('Type')} </div>
          <div css={publishTargetsHeaderText}> </div>
        </div>
        {publishTargets?.map((p, index) => {
          return (
            <div key={index} css={publishTargetsItem}>
              <div css={publishTargetsItemText}>{p.name} </div>
              <div css={publishTargetsItemText}>{p.type} </div>
              <div css={publishTargetsEditButton}>
                <ActionButton styles={editPublishProfile} onClick={async () => await onEdit(index, p)}>
                  {formatMessage('Edit')}
                </ActionButton>
              </div>
            </div>
          );
        })}
        <ActionButton styles={addPublishProfile} onClick={() => setAddDialogHidden(false)}>
          {formatMessage('Add new publish profile')}
        </ActionButton>
      </div>
    );
  }, [projectId, publishTargets]);

  return (
    <div css={container}>
      {isRootBot && (
        <CollapsableWrapper title={formatMessage('Skill host endpoint')} titleStyle={titleStyle}>
          {SkillHostEndPoint}
        </CollapsableWrapper>
      )}
      <CollapsableWrapper title={formatMessage('App Id / Password')} titleStyle={titleStyle}>
        {AppIdOrPassWord}
      </CollapsableWrapper>
      <CollapsableWrapper title={formatMessage('External services')} titleStyle={titleStyle}>
        {ExternalService}
      </CollapsableWrapper>
      <CollapsableWrapper
        containerStyle={botLanguageContainerStyle}
        title={formatMessage('Bot Language')}
        titleStyle={titleStyle}
      >
        {BotLanguage}
      </CollapsableWrapper>
      <CollapsableWrapper
        containerStyle={customRuntimeStyle}
        title={formatMessage('Custom runtime')}
        titleStyle={titleStyle}
      >
        <RuntimeSettings projectId={projectId} />
      </CollapsableWrapper>
      <CollapsableWrapper
        containerStyle={publishTargetsStyle}
        title={formatMessage('Publish targets')}
        titleStyle={titleStyle}
      >
        {PublishTargets}
      </CollapsableWrapper>
      {DeleteBotButton}
      <AddLanguageModal
        defaultLanguage={defaultLanguage}
        isOpen={showAddLanguageModal}
        languages={languages}
        locale={locale}
        onDismiss={() => addLanguageDialogCancel(projectId)}
        onSubmit={onAddLangModalSubmit}
      />
      <Dialog
        dialogContentProps={dialogProps}
        hidden={addDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true }}
        onDismiss={() => setAddDialogHidden(true)}
      >
        {dialogProps.children}
      </Dialog>
      <Dialog
        dialogContentProps={editDialogProps}
        hidden={editDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true }}
        onDismiss={() => setEditDialogHidden(true)}
      >
        {editDialogProps.children}
      </Dialog>
    </div>
  );
};

export default TableView;
