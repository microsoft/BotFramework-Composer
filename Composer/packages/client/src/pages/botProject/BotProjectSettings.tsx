// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useMemo, useState, Suspense } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ActionButton, Button } from 'office-ui-fabric-react/lib/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { navigateTo } from '../../utils/navigation';
import { LoadingSpinner } from '../../components/LoadingSpinner';
//import { navigateTo } from '../../utils/navigation';
import { INavTreeItem } from '../../components/NavTree';
import { Page } from '../../components/Page';
import { settingsState, localeState, showAddLanguageModalState } from '../../recoilModel/atoms';
import { dispatcherState } from '../../recoilModel';
import { botProjectSpaceSelector } from '../../recoilModel/selectors/project';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { AddLanguageModal } from '../../components/MultiLanguage';
import { languageListTemplates } from '../../components/MultiLanguage';

import {
  header,
  container,
  titleStyle,
  botNameStyle,
  labelContainer,
  customerLabel,
  runtimeLabel,
  appIdOrPassWordStyle,
  botLanguageDescriptionStyle,
  botLanguageFieldStyle,
  manageBotLanguage,
  languageItem,
  toggleUseCustomRuntimeStyle,
  botLanguageContainerStyle,
  runtimeLabelStyle,
  textOr,
  textRuntimeCode,
  deleteBotText,
  deleteBotButton,
} from './styles';

// const CodeEditor = React.lazy(() => import('./code-editor'));
interface BotProjectSettingsProps extends RouteComponentProps<{}> {
  projectId?: string;
}

const BotProjectSettings: React.FC<BotProjectSettingsProps> = (props) => {
  const { projectId = '' } = props;

  const { addLanguageDialogCancel, addLanguages, addLanguageDialogBegin, deleteBot } = useRecoilValue(dispatcherState);
  const botProjectsMetaData = useRecoilValue(botProjectSpaceSelector);
  const botProject = botProjectsMetaData.find((b) => b.projectId === projectId);
  const isRootBot = botProject?.isRootBot;
  const botName = botProject?.name;
  //const botName = useRecoilValue(botDisplayNameState(projectId));
  const { languages, defaultLanguage } = useRecoilValue(settingsState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const showAddLanguageModal = useRecoilValue(showAddLanguageModalState(projectId));

  const [isUseCustomRuntimeEnabled, toggleUseCustomRuntime] = useState<boolean>(false);

  //const path = props.location?.pathname ?? '';

  //const edit = /\/edit(\/)?$/.test(path);
  //const isRoot = dialogId === 'all';
  const navLinks: INavTreeItem[] = useMemo(() => {
    const newbotProjectLinks: INavTreeItem[] = botProjectsMetaData.map((b) => {
      return {
        id: b.projectId,
        name: b.name,
        ariaLabel: formatMessage('bot'),
        url: `/bot/${b.projectId}/botProjectsSettings/`,
        isRootBot: b.isRootBot,
      };
    });
    const rootBotIndex = botProjectsMetaData.findIndex((link) => link.isRootBot);

    if (rootBotIndex > -1) {
      const rootBotLink = newbotProjectLinks.splice(rootBotIndex, 1)[0];
      newbotProjectLinks.splice(0, 0, rootBotLink);
    }
    return newbotProjectLinks;
  }, [botProjectsMetaData]);

  // const onToggleEditMode = useCallback(
  //     (_e, checked) => {
  //         let url = `/bot/${projectId}/knowledge-base/${dialogId}`;
  //         if (checked) url += `/edit`;
  //         navigateTo(url);
  //     },
  //     [dialogId, projectId]
  // );

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

  const onRenderUseCustomeRuntimeLabel = (props: ITextFieldProps | undefined) => {
    return (
      <div css={labelContainer}>
        <div css={runtimeLabel(isUseCustomRuntimeEnabled)}>{props?.label}</div>
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
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'Microsoft Password'}
          label={formatMessage('Microsoft Password')}
          placeholder={'Enter Microsoft Password'}
          styles={{ root: { marginTop: 15 } }}
          onRenderLabel={onRenderLabel}
        />
      </div>
    );
  }, [projectId]);

  const ExternalService = useMemo(() => {
    return (
      <div css={appIdOrPassWordStyle}>
        <TextField
          aria-labelledby={'LUIS key'}
          label={formatMessage('LUIS key')}
          placeholder={'Enter QnA LUIS key'}
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'QnA Maker Subscription key'}
          label={formatMessage('QnA Maker Subscription key')}
          placeholder={'Enter QnA Maker key'}
          styles={{ root: { marginTop: 15 } }}
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

  const CustomerRuntime = useMemo(() => {
    return (
      <div css={appIdOrPassWordStyle}>
        <div css={botLanguageDescriptionStyle}>
          {formatMessage('Configure Composer to start your bot using runtime code you can customize and control')}
        </div>
        <Toggle
          checked={isUseCustomRuntimeEnabled}
          className={'toggleUseCustomRuntime'}
          defaultChecked={false}
          offText={formatMessage('Use custom runtime')}
          styles={toggleUseCustomRuntimeStyle}
          onChange={() => toggleUseCustomRuntime(!isUseCustomRuntimeEnabled)}
          onText={formatMessage('Use custom runtime')}
        />
        <TextField
          aria-labelledby={'Runtime code location'}
          disabled={!isUseCustomRuntimeEnabled}
          label={formatMessage('Runtime code location')}
          placeholder={'Enter Runtime code location'}
          onRenderLabel={onRenderUseCustomeRuntimeLabel}
        />
        <div css={runtimeLabelStyle}>
          <div css={textOr}>{formatMessage('Or')} </div>
          <div css={textRuntimeCode(isUseCustomRuntimeEnabled)}>{formatMessage('Get a new copy of runtime code')}</div>
        </div>
        <TextField
          aria-labelledby={'Start command'}
          disabled={!isUseCustomRuntimeEnabled}
          label={formatMessage('Start command')}
          placeholder={'Enter Start command'}
          styles={{ root: { marginTop: 15 } }}
          onRenderLabel={onRenderUseCustomeRuntimeLabel}
        />
      </div>
    );
  }, [projectId, languageListOptions, isUseCustomRuntimeEnabled]);

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

  const onRenderHeaderContent = () => {
    return formatMessage(
      'This Page contains detailed information about your bot. For security reasons, they are hidden by default. To test your bot or publish to Azure, you may need to provide these settings'
    );
  };
  return (
    <Page
      data-testid="BotProjectsSetting"
      headerStyle={header}
      mainRegionName={formatMessage('Bot projects settings list View')}
      navLinks={navLinks}
      navRegionName={formatMessage('Bot Projects Settings Navigation Pane')}
      title={formatMessage('Bot management and configurations.')}
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <div css={container}>
          <div css={botNameStyle}> {`${botName} (${isRootBot ? 'Root Bot' : 'Skill'})`} </div>

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
          <CollapsableWrapper title={formatMessage('Custom runtime')} titleStyle={titleStyle}>
            {CustomerRuntime}
          </CollapsableWrapper>
          {/* <CollapsableWrapper title={formatMessage('Publish targets')} titleStyle={titleStyle}>
            {PublishTargets}
          </CollapsableWrapper> */}
          {DeleteBotButton}
          <AddLanguageModal
            defaultLanguage={defaultLanguage}
            isOpen={showAddLanguageModal}
            languages={languages}
            locale={locale}
            onDismiss={() => addLanguageDialogCancel(projectId)}
            onSubmit={onAddLangModalSubmit}
          />
        </div>
      </Suspense>
    </Page>
  );
};

export default BotProjectSettings;
