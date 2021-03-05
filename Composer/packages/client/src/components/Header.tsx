// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { IconButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { FocusTrapZone } from 'office-ui-fabric-react/lib/FocusTrapZone';
import { checkForPVASchema } from '@bfc/shared';
import { useCallback, useState, Fragment, useMemo, useEffect } from 'react';
import { NeutralColors, SharedColors, FontSizes, CommunicationColors } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';

import { BASEPATH } from '../constants';
import { schemasState } from '../recoilModel/atoms';
import {
  dispatcherState,
  appUpdateState,
  botDisplayNameState,
  localeState,
  currentProjectIdState,
  settingsState,
  webChatEssentialsSelector,
  isWebChatPanelVisibleState,
} from '../recoilModel';
import composerIcon from '../images/composerIcon.svg';
import { AppUpdaterStatus } from '../constants';
import TelemetryClient from '../telemetry/TelemetryClient';
import { useBotControllerBar } from '../hooks/useControllerBar';

import { WebChatPanel } from './WebChat/WebChatPanel';
import { languageListTemplates } from './MultiLanguage';
import { NotificationButton } from './Notifications/NotificationButton';
import { BotController } from './BotRuntimeController/BotController';
export const actionButton = css`
  font-size: ${FontSizes.size18};
  margin-top: 2px;
`;

// -------------------- Styles -------------------- //
const headerContainer = css`
  position: relative;
  background: ${SharedColors.cyanBlue10};
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const title = css`
  margin-left: 20px;
  font-weight: ${FontWeights.semibold};
  font-size: ${FontSizes.size16};
  color: #fff;
`;

const botName = css`
  margin-left: 20px;
  font-size: 16px;
  color: #fff;
  border-radius: 19px;
  background: ${CommunicationColors.tint10};
  padding-left: 10px;
  padding-right: 10px;
  cursor: pointer;
`;

const divider = css`
  height: 24px;
  border-right: 1px solid #979797;
  margin: 0px 0px 0px 20px;
`;

const headerTextContainer = css`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 50%;
`;

const rightSection = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 50%;
  margin: 0 10px;

  & > div:first-of-type {
    margin-right: 7px;
  }

  & > button:first-of-type {
    margin-right: 20px;
  }
`;

const buttonStyles: IButtonStyles = {
  icon: {
    color: '#fff',
    fontSize: FontSizes.size20,
  },
  root: {
    height: '20px',
    width: '20px',
    marginTop: '4px',
  },
  rootHovered: {
    backgroundColor: 'transparent',
  },
  rootPressed: {
    backgroundColor: 'transparent',
  },
};

const calloutStyle = {
  root: {
    padding: 24,
  },
  calloutMain: {
    width: 330,
    height: 120,
  },
};

const calloutHeader = css`
  color: ${NeutralColors.black};
  font-size: ${FontSizes.size20};
`;

const calloutDescription = css`
  padding-top: 12px;
  color: ${NeutralColors.black};
  font-size: ${FontSizes.size12};
`;

// -------------------- Header -------------------- //

export const Header = () => {
  const { setAppUpdateShowing, setLocale } = useRecoilValue(dispatcherState);
  const projectId = useRecoilValue(currentProjectIdState);
  const projectName = useRecoilValue(botDisplayNameState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const appUpdate = useRecoilValue(appUpdateState);
  const [teachingBubbleVisibility, setTeachingBubbleVisibility] = useState<boolean>();
  const settings = useRecoilValue(settingsState(projectId));
  const schemas = useRecoilValue(schemasState(projectId));
  const isWebChatPanelVisible = useRecoilValue(isWebChatPanelVisibleState);

  const { languages, defaultLanguage } = settings;
  const { showing, status } = appUpdate;
  const webchatEssentials = useRecoilValue(webChatEssentialsSelector);
  const {
    openBotInEmulator,
    appendLogToWebChatInspector,
    clearWebChatLogs,
    setWebChatPanelVisibility,
  } = useRecoilValue(dispatcherState);
  const [hideBotController, hideBotStartController] = useState(true);

  const isShow = useBotControllerBar();

  useEffect(() => {
    if (!isShow) {
      setWebChatPanelVisibility(false);
    }
  }, [isShow]);

  const onUpdateAvailableClick = useCallback(() => {
    setAppUpdateShowing(true);
  }, []);

  useEffect(() => {
    if (isWebChatPanelVisible) {
      hideBotStartController(true);
    }
  }, [isWebChatPanelVisible]);

  const showUpdateAvailableIcon = status === AppUpdaterStatus.UPDATE_AVAILABLE && !showing;

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

  const onLanguageChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, _index?: number) => {
    const selectedLang = option?.key as string;
    if (selectedLang && selectedLang !== locale) {
      setLocale(selectedLang, projectId);
    }
  };

  const handleActiveLanguageButtonOnDismiss = () => {
    setTeachingBubbleVisibility(false);
  };

  const handleActiveLanguageButtonOnKeyDown = (e) => {
    if (e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      setTeachingBubbleVisibility(true);
    }
  };

  return (
    <div css={headerContainer} role="banner">
      <img
        alt={formatMessage('Composer Logo')}
        aria-label={formatMessage('Composer Logo')}
        src={composerIcon}
        style={{ marginLeft: '9px' }}
      />
      <div css={headerTextContainer}>
        <div css={title}>{formatMessage('Bot Framework Composer')}</div>
        {projectName && (
          <Fragment>
            <div css={divider} />
            <span
              css={botName}
              id="targetButton"
              role={'button'}
              tabIndex={0}
              onClick={() => setTeachingBubbleVisibility(true)}
              onKeyDown={handleActiveLanguageButtonOnKeyDown}
            >
              {`${projectName} (${locale})`}
            </span>
          </Fragment>
        )}
      </div>

      <div css={rightSection}>
        {isShow && !checkForPVASchema(schemas.sdk) && (
          <BotController
            isControllerHidden={hideBotController}
            onHideController={(isHidden: boolean) => {
              hideBotStartController(isHidden);
              if (!isHidden) {
                setWebChatPanelVisibility(false);
              }
            }}
          />
        )}
        {showUpdateAvailableIcon && (
          <IconButton
            iconProps={{ iconName: 'History' }}
            styles={buttonStyles}
            title={formatMessage('Update available')}
            onClick={onUpdateAvailableClick}
          />
        )}
        {isShow && (
          <IconButton
            ariaDescription={formatMessage('Open web chat')}
            css={css`
              &::after {
                content: '';
                position: absolute;
                top: 6px;
                bottom: 0;
                right: -5px;
                background: ${NeutralColors.gray40};
                height: 23px;
                margin: 0px auto;
                width: 1px;
              }
            `}
            disabled={!webchatEssentials?.botUrl}
            iconProps={{
              iconName: 'OfficeChat',
            }}
            styles={{
              root: {
                color: NeutralColors.white,
                height: '36px',
                selectors: {
                  ':disabled .ms-Button-icon': {
                    opacity: 0.4,
                    color: `${NeutralColors.white}`,
                  },
                },
              },
              rootDisabled: {
                backgroundColor: `${CommunicationColors.primary}`,
              },
              rootHovered: {
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
              },
            }}
            title={formatMessage('Open Web Chat')}
            onClick={() => {
              const currentWebChatVisibility = !isWebChatPanelVisible;
              setWebChatPanelVisibility(currentWebChatVisibility);
              if (currentWebChatVisibility) {
                TelemetryClient.track('WebChatPaneOpened');
              } else {
                TelemetryClient.track('WebChatPaneClosed');
              }
            }}
          />
        )}
        <NotificationButton buttonStyles={buttonStyles} />
      </div>
      {teachingBubbleVisibility && (
        <Callout
          directionalHint={DirectionalHint.bottomLeftEdge}
          styles={calloutStyle}
          target="#targetButton"
          onDismiss={handleActiveLanguageButtonOnDismiss}
        >
          <div css={calloutHeader}> {formatMessage('Active language')}</div>
          <div css={calloutDescription}>
            {formatMessage(
              'This is the bot language you are currently authoring. Change the active language in the dropdown below.'
            )}
          </div>
          <FocusTrapZone isClickableOutsideFocusTrap>
            <Dropdown
              options={languageListOptions}
              placeholder="Select an option"
              selectedKey={locale}
              styles={{ root: { marginTop: 12 } }}
              onChange={onLanguageChange}
            />
          </FocusTrapZone>
        </Callout>
      )}

      <Panel
        isHiddenOnDismiss
        closeButtonAriaLabel={formatMessage('Close')}
        customWidth={'395px'}
        headerText={projectName}
        isBlocking={false}
        isOpen={isWebChatPanelVisible}
        styles={{
          root: {
            marginTop: '50px',
          },
          scrollableContent: {
            width: '100%',
            height: '100%',
          },
          content: {
            width: '100%',
            height: '100%',
            padding: 0,
            margin: 0,
          },
        }}
        type={PanelType.custom}
        onDismiss={() => {
          setWebChatPanelVisibility(false);
          TelemetryClient.track('WebChatPaneClosed');
        }}
      >
        {webchatEssentials ? (
          <WebChatPanel
            appendLogToWebChatInspector={appendLogToWebChatInspector}
            botData={{ ...webchatEssentials }}
            clearWebchatInspectorLogs={clearWebChatLogs}
            directlineHostUrl={BASEPATH}
            isWebChatPanelVisible={isWebChatPanelVisible}
            openBotInEmulator={openBotInEmulator}
          />
        ) : null}
      </Panel>
    </div>
  );
};
