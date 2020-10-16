// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
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

import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { navigateTo } from '../../utils/navigation';
import {
  settingsState,
  localeState,
  showAddLanguageModalState,
  publishTypesState,
  botDisplayNameState,
} from '../../recoilModel/atoms';
import { dispatcherState } from '../../recoilModel';
import { botProjectSpaceSelector } from '../../recoilModel/selectors/project';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { AddLanguageModal } from '../../components/MultiLanguage';
import { languageListTemplates } from '../../components/MultiLanguage';
import { CreatePublishTarget } from '../publish/createPublishTarget';

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
} from './styles';

// const CodeEditor = React.lazy(() => import('./code-editor'));
interface BotProjectSettingsProps extends RouteComponentProps<{}> {
  projectId?: string;
}

const TableView: React.FC<BotProjectSettingsProps> = (props) => {
  const { projectId = '' } = props;

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

  //好像缺个ID
  const onRenderLabel = (props: ITextFieldProps | undefined) => {
    return (
      <div css={labelContainer}>
        <div css={customerLabel}> {props?.label} </div>
        <TooltipHost content={props?.label}>
          <Icon iconName={'Unknown'} />
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
          label={formatMessage('Microsoft AppId')}
          placeholder={'Enter Microsoft AppId'}
          value={MicrosoftAppId}
          onChange={async (e, value) =>
            await setSettings(projectId, {
              ...settings,
              MicrosoftAppId: value,
            })
          }
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'Microsoft Password'}
          label={formatMessage('Microsoft Password')}
          placeholder={'Enter Microsoft Password'}
          styles={{ root: { marginTop: 15 } }}
          value={MicrosoftAppPassword}
          onChange={async (e, value) =>
            await setSettings(projectId, {
              ...settings,
              MicrosoftAppPassword: value,
            })
          }
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
          label={formatMessage('LUIS key')}
          placeholder={'Enter LUIS key'}
          onChange={async (e, value) =>
            await setSettings(projectId, {
              ...settings,
              luis: { ...settings.luis, authoringKey: value ? value : '' },
            })
          }
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'LUIS region'}
          label={formatMessage('LUIS region')}
          placeholder={'Enter LUIS region'}
          styles={{ root: { marginTop: 15 } }}
          onChange={async (e, value) =>
            await setSettings(projectId, {
              ...settings,
              luis: { ...settings.luis, authoringRegion: value ? value : '' },
            })
          }
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'QnA Maker Subscription key'}
          label={formatMessage('QnA Maker Subscription key')}
          placeholder={'Enter QnA Maker key'}
          styles={{ root: { marginTop: 15 } }}
          onChange={async (e, value) =>
            await setSettings(projectId, {
              ...settings,
              qna: { ...settings.qna, subscriptionKey: value ? value : '' },
            })
          }
          onRenderLabel={onRenderLabel}
        />
      </div>
    );
  }, [projectId]);

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
      <div>
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
        title={formatMessage('Custom runtime')}
        titleStyle={titleStyle}
        containerStyle={customRuntimeStyle}
      >
        <RuntimeSettings projectId={projectId} />
      </CollapsableWrapper>
      <CollapsableWrapper
        title={formatMessage('Publish targets')}
        titleStyle={titleStyle}
        containerStyle={publishTargetsStyle}
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
