// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { IconButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { checkForPVASchema } from '@bfc/shared';
import { useCallback, useState, Fragment, useMemo, useEffect } from 'react';
import { FontSizes } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

import { schemasState } from '../recoilModel/atoms';
import {
  dispatcherState,
  appUpdateState,
  botDisplayNameState,
  localeState,
  currentProjectIdState,
  settingsState,
} from '../recoilModel';
import composerIcon from '../images/composerIcon.svg';
import { AppUpdaterStatus } from '../constants';
import { colors } from '../colors';
import { useLocation } from '../utils/hooks';

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
  background: ${colors.main};
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const title = css`
  margin-left: 20px;
  font-weight: ${FontWeights.semibold};
  font-size: ${FontSizes.size16};
  color: ${colors.textOnColor};
`;

const botName = css`
  margin-left: 20px;
  font-size: 16px;
  color: ${colors.textOnColor};
  border-radius: 19px;
  background: ${colors.main};
  padding-left: 10px;
  padding-right: 10px;
  cursor: pointer;
`;

const divider = css`
  height: 24px;
  border-right: 1px solid ${colors.gray(100)};
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
  margin: 15px 10px;
`;

const buttonStyles: IButtonStyles = {
  icon: {
    color: colors.textOnColor,
    fontSize: FontSizes.size20,
  },
  root: {
    height: '20px',
    width: '20px',
    marginLeft: '16px',
    marginTop: '4px',
  },
  rootHovered: {
    backgroundColor: 'transparent',
  },
  rootPressed: {
    backgroundColor: 'transparent',
  },
};

const teachingBubbleStyle = {
  root: {
    selectors: {
      '.ms-Callout-beak': {
        background: colors.bg,
      },
    },
  },
  bodyContent: {
    background: colors.bg,
    selectors: {
      '.ms-TeachingBubble-headline': {
        color: colors.black,
        fontSize: FontSizes.size20,
      },
      '.ms-TeachingBubble-subText': {
        color: colors.black,
        fontSize: FontSizes.size12,
      },
    },
  },
};

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

  const { languages, defaultLanguage } = settings;
  const { showing, status } = appUpdate;
  const [showStartBotsWidget, setStartBotsWidgetVisible] = useState(true);

  const {
    location: { pathname },
  } = useLocation();

  useEffect(() => {
    // hide it on the /home page, but make sure not to hide on /bot/stuff/home in case someone names a dialog "home"
    setStartBotsWidgetVisible(!pathname.endsWith('/home') || pathname.includes('/bot/'));
  }, [pathname]);

  const onUpdateAvailableClick = useCallback(() => {
    setAppUpdateShowing(true);
  }, []);

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
        {showStartBotsWidget && !checkForPVASchema(schemas.sdk) && <BotController />}
        {showUpdateAvailableIcon && (
          <IconButton
            iconProps={{ iconName: 'History' }}
            styles={buttonStyles}
            title={formatMessage('Update available')}
            onClick={onUpdateAvailableClick}
          />
        )}
        <NotificationButton buttonStyles={buttonStyles} />
      </div>
      {teachingBubbleVisibility && (
        <div onBlur={handleActiveLanguageButtonOnDismiss}>
          <TeachingBubble
            isWide
            calloutProps={{ directionalHint: DirectionalHint.bottomLeftEdge }}
            headline={formatMessage('Active language')}
            styles={teachingBubbleStyle}
            target="#targetButton"
            onDismiss={handleActiveLanguageButtonOnDismiss}
          >
            {formatMessage(
              'This is the bot language you are currently authoring. Change the active language in the dropdown below.'
            )}
            <Dropdown
              disabled={languageListOptions.length === 1}
              options={languageListOptions}
              placeholder="Select an option"
              selectedKey={locale}
              styles={{ root: { marginTop: 12 } }}
              onChange={onLanguageChange}
            />
          </TeachingBubble>
        </div>
      )}
    </div>
  );
};
