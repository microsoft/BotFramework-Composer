// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useMemo, useState, useEffect, useCallback, Fragment } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { PublishTarget } from '@bfc/shared';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ActionButton, Button } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { QnAFile, DialogInfo, LuFile } from '@bfc/shared';
import { mergeStyleSets } from '@uifabric/styling';

import { getBaseName } from '../../utils/fileUtil';
import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { navigateTo } from '../../utils/navigation';
import {
  settingsState,
  localeState,
  showAddLanguageModalState,
  publishTypesState,
  botDisplayNameState,
  luFilesState,
  qnaFilesState,
} from '../../recoilModel/atoms';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { dispatcherState, validateDialogSelectorFamily } from '../../recoilModel';
import { botProjectSpaceSelector } from '../../recoilModel/selectors/project';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { AddLanguageModal } from '../../components/MultiLanguage';
import { languageListTemplates } from '../../components/MultiLanguage';
import { CreatePublishTarget } from '../publish/createPublishTarget';
import settingStorage from '../../utils/dialogSettingStorage';
import ClickOnFocusTextField from '../../components/ClickOnFocusTextField';
import { isLUISnQnARecognizerType } from '../../utils/dialogValidator';

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
  unknownIconStyle,
  defaultLanguageTextStyle,
  languageItemContainer,
  languageTextStyle,
  languageButton,
  languageRowContainer,
  languageButtonContainer,
  errorContainer,
  customError,
  errorIcon,
  errorTextStyle,
} from './styles';

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
    deleteLanguages,
    setLocale,
  } = useRecoilValue(dispatcherState);
  const botProjectsMetaData = useRecoilValue(botProjectSpaceSelector);
  const botProject = botProjectsMetaData.find((b) => b.projectId === projectId);
  const isRootBot = botProject?.isRootBot;
  const settings = useRecoilValue(settingsState(projectId));
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const sensitiveGroupManageProperty = settingStorage.get(rootBotProjectId);
  const groupLUISAuthoringKey = get(sensitiveGroupManageProperty, 'luis.authoringKey', {});
  const rootLuisKey = groupLUISAuthoringKey.root;
  const skillLuisKey = groupLUISAuthoringKey[projectId];
  const groupLUISRegion = get(sensitiveGroupManageProperty, 'luis.authoringRegion', {});
  const rootLuisRegion = groupLUISRegion.root;
  const skillLuisRegion = groupLUISRegion[projectId];
  const groupQnAKey = get(sensitiveGroupManageProperty, 'qna.subscriptionKey', {});
  const rootqnaKey = groupQnAKey.root;
  const skillqnaKey = groupQnAKey[projectId];
  console.log(rootLuisKey, skillLuisKey, rootLuisRegion, skillLuisRegion, rootqnaKey, skillqnaKey);
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
  const dialogs = useRecoilValue(validateDialogSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesState(projectId));

  const [dialogProps, setDialogProps] = useState({
    title: formatMessage('Title'),
    type: DialogType.normal,
    children: {},
  });

  useEffect(() => {
    if (projectId) {
      getPublishTargetTypes(projectId);
    }
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

  const errorElement = (errorText: string) => {
    if (!errorText) return '';
    return (
      <div css={errorContainer}>
        <Icon iconName={'ErrorBadge'} styles={errorIcon} />
        <div css={errorTextStyle}>{errorText}</div>
      </div>
    );
  };

  const AppIdOrPassWord = useMemo(() => {
    return (
      <div css={appIdOrPassWordStyle}>
        <TextField
          aria-labelledby={'Microsoft AppId'}
          errorMessage={hasSkills ? errorElement(errorsMsg[projectId]?.MicrosoftAppId) : ''}
          label={formatMessage('Microsoft AppId')}
          placeholder={'Enter Microsoft AppId'}
          required={hasSkills}
          styles={customError}
          value={MicrosoftAppId}
          onChange={async (e, value) => {
            await setSettings(projectId, {
              ...settings,
              MicrosoftAppId: value,
            });
            if (value) {
              setErrorsMsg({
                ...errorsMsg,
                [projectId]: {
                  ...errorsMsg[projectId],
                  MicrosoftAppId: '',
                },
              });
            } else {
              setErrorsMsg({
                ...errorsMsg,
                [projectId]: {
                  ...errorsMsg[projectId],
                  MicrosoftAppId: formatMessage('Microsoft App Id is required for this bot to call skills'),
                },
              });
            }
          }}
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'Microsoft Password'}
          errorMessage={hasSkills ? errorElement(errorsMsg[projectId]?.MicrosoftAppPassword) : ''}
          label={formatMessage('Microsoft Password')}
          placeholder={'Enter Microsoft Password'}
          required={hasSkills}
          styles={mergeStyleSets({ root: { marginTop: 15 } }, customError)}
          value={MicrosoftAppPassword}
          onChange={async (e, value) => {
            await setSettings(projectId, {
              ...settings,
              MicrosoftAppPassword: value,
            });
            if (value) {
              setErrorsMsg({
                ...errorsMsg,
                [projectId]: {
                  ...errorsMsg[projectId],
                  MicrosoftAppPassword: '',
                },
              });
            } else {
              setErrorsMsg({
                ...errorsMsg,
                [projectId]: {
                  ...errorsMsg[projectId],
                  MicrosoftAppPassword: formatMessage(
                    'Microsoft App Password is required for this bot too call skills'
                  ),
                },
              });
            }
          }}
          onRenderLabel={onRenderLabel}
        />
      </div>
    );
  }, [projectId, MicrosoftAppId, MicrosoftAppPassword, errorsMsg, hasSkills]);

  const isLUISMandatory = (dialogs: DialogInfo[], luFiles: LuFile[]) => {
    return dialogs.some((dialog) => {
      const isDefault = isLUISnQnARecognizerType(dialog);
      const luFile = luFiles.find((luFile) => getBaseName(luFile.id) === dialog.id);
      return isDefault && luFile?.content;
    });
  };

  const isQnAKeyMandatory = (dialogs: DialogInfo[], qnaFiles: QnAFile[]) => {
    return dialogs.some((dialog) => {
      const isDefault = isLUISnQnARecognizerType(dialog);
      const qnaFile = qnaFiles.find((qnaFile) => getBaseName(qnaFile.id) === dialog.id);
      return isDefault && qnaFile?.content;
    });
  };

  const ExternalService = useMemo(() => {
    const isLUISKeyNeeded = isLUISMandatory(dialogs, luFiles);
    const isQnAKeyNeeded = isQnAKeyMandatory(dialogs, qnaFiles);
    return (
      <div css={appIdOrPassWordStyle}>
        {isRootBot && (
          <TextField
            aria-labelledby={'LUIS key'}
            errorMessage={isLUISKeyNeeded ? errorElement(errorsMsg[projectId]?.luisKey) : ''}
            label={formatMessage('LUIS key')}
            placeholder={'Enter LUIS key'}
            required={isLUISKeyNeeded}
            styles={customError}
            value={rootLuisKey}
            onChange={async (e, value) => {
              await setSettings(projectId, {
                ...settings,
                luis: { ...settings.luis, authoringKey: value ? value : '' },
              });
              if (value) {
                setErrorsMsg({
                  ...errorsMsg,
                  [projectId]: {
                    ...errorsMsg[projectId],
                    luisKey: '',
                  },
                });
              } else {
                setErrorsMsg({
                  ...errorsMsg,
                  [projectId]: {
                    ...errorsMsg[projectId],
                    luisKey: formatMessage(
                      'LUIS Key is required with the current recognizer setting to start your bot locally, and publish'
                    ),
                  },
                });
              }
            }}
            onRenderLabel={onRenderLabel}
          />
        )}

        {!isRootBot && (
          <ClickOnFocusTextField
            required
            ariaLabelledby={'LUIS key'}
            buttonText={formatMessage('Use custom LUIS key')}
            label={formatMessage('LUIS key')}
            placeholder={'Enter LUIS key'}
            placeholderOnDisable={"<---- Same as root bot's LUIS key ---->"}
            value={skillLuisKey}
            onChange={async (e, value) => {
              await setSettings(projectId, {
                ...settings,
                luis: { ...settings.luis, authoringKey: value ? value : '' },
              });
            }}
          />
        )}
        {isRootBot && (
          <TextField
            aria-labelledby={'LUIS region'}
            label={formatMessage('LUIS region')}
            placeholder={'Enter LUIS region'}
            styles={{ root: { marginTop: 10 } }}
            value={rootLuisRegion}
            onChange={async (e, value) => {
              await setSettings(projectId, {
                ...settings,
                luis: { ...settings.luis, authoringRegion: value ? value : '' },
              });
            }}
            onRenderLabel={onRenderLabel}
          />
        )}
        {!isRootBot && (
          <ClickOnFocusTextField
            required
            ariaLabelledby={'LUIS region'}
            buttonText={formatMessage('Use custom LUIS region')}
            label={formatMessage('LUIS region')}
            placeholder={'Enter LUIS region'}
            placeholderOnDisable={"<---- Same as root bot's LUIS region ---->"}
            value={skillLuisRegion}
            onChange={async (e, value) => {
              await setSettings(projectId, {
                ...settings,
                luis: { ...settings.luis, authoringRegion: value ? value : '' },
              });
            }}
          />
        )}
        {isRootBot && (
          <TextField
            aria-labelledby={'QnA Maker Subscription key'}
            errorMessage={isQnAKeyNeeded ? errorElement(errorsMsg[projectId]?.qnaKey) : ''}
            label={formatMessage('QnA Maker Subscription key')}
            placeholder={'Enter QnA Maker Subscription key'}
            required={isQnAKeyNeeded}
            styles={mergeStyleSets({ root: { marginTop: 10 } }, customError)}
            value={rootqnaKey}
            onChange={async (e, value) => {
              await setSettings(projectId, {
                ...settings,
                qna: { ...settings.qna, subscriptionKey: value ? value : '' },
              });
              if (value) {
                setErrorsMsg({
                  ...errorsMsg,
                  [projectId]: {
                    ...errorsMsg[projectId],
                    qnaKey: '',
                  },
                });
              } else {
                setErrorsMsg({
                  ...errorsMsg,
                  [projectId]: {
                    ...errorsMsg[projectId],
                    qnaKey: formatMessage(
                      'QnA Maker subscription Key is required to start your bot locally, and publish'
                    ),
                  },
                });
              }
            }}
            onRenderLabel={onRenderLabel}
          />
        )}

        {!isRootBot && (
          <ClickOnFocusTextField
            required
            ariaLabelledby={'QnA Maker Subscription key'}
            buttonText={formatMessage('Use custom QnA Maker Subscription key')}
            label={formatMessage('QnA Maker Subscription key')}
            placeholder={'Enter QnA Maker Subscription key'}
            placeholderOnDisable={"<---- Same as root bot's QnA Maker Subscription key ---->"}
            value={skillqnaKey}
            onChange={async (e, value) => {
              await setSettings(projectId, {
                ...settings,
                qna: { ...settings.qna, subscriptionKey: value ? value : '' },
              });
            }}
          />
        )}
      </div>
    );
  }, [
    projectId,
    isRootBot,
    rootLuisKey,
    skillLuisKey,
    rootLuisRegion,
    skillLuisRegion,
    rootqnaKey,
    skillqnaKey,
    dialogs,
    qnaFiles,
    luFiles,
    errorsMsg,
  ]);

  const setDefaultLanguage = (language: string) => {
    setLocale(language, projectId);
    const updatedSetting = { ...cloneDeep(settings), defaultLanguage: language };
    if (updatedSetting?.luis?.defaultLanguage) {
      updatedSetting.luis.defaultLanguage = language;
    }
    setSettings(projectId, updatedSetting);
  };

  const BotLanguage = useMemo(() => {
    const index = languageListOptions.findIndex((l) => l.key === defaultLanguage);
    const dl = languageListOptions.splice(index, 1)[0];
    languageListOptions.unshift(dl);
    return (
      <div css={appIdOrPassWordStyle}>
        <div css={botLanguageDescriptionStyle}>
          {formatMessage(
            'List of languages that bot will be able to understand (User input) and respond to (Bot responses). To make this bot available in other languages, click ‘Manage bot languages’ to create a copy of the default language, and translate the content into the new language.'
          )}
        </div>
        <div css={botLanguageFieldStyle}>
          {languageListOptions.map((l) => (
            <div key={l.key} css={languageRowContainer}>
              {l.key === defaultLanguage && (
                <Fragment>
                  <div css={languageTextStyle}>
                    {l.text}
                    <span css={defaultLanguageTextStyle}> {'DEFAULT LANGUAGE'}</span>
                  </div>
                </Fragment>
              )}
              {l.key !== defaultLanguage && (
                <div css={languageItemContainer}>
                  <div css={languageItem}>{l.text}</div>
                  <div css={languageButtonContainer}>
                    <ActionButton styles={languageButton} onClick={(e) => setDefaultLanguage(l.key)}>
                      {formatMessage('Set it as default language')}
                    </ActionButton>
                    <ActionButton
                      styles={languageButton}
                      onClick={() => deleteLanguages({ languages: [l.key], projectId: projectId })}
                    >
                      {formatMessage('Remove')}
                    </ActionButton>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <ActionButton styles={manageBotLanguage} onClick={() => addLanguageDialogBegin(projectId, () => {})}>
          {formatMessage('Manage bot languages')}
        </ActionButton>
      </div>
    );
  }, [projectId, defaultLanguage, languageListOptions]);

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
