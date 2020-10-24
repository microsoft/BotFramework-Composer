// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { IconButton, ActionButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { useCallback, useState, Fragment, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { NeutralColors, SharedColors, FontSizes } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

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

import { languageListTemplates } from './MultiLanguage';

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
  font-size: 16px;
  color: #fff;
`;

const botName = css`
  margin-left: 20px;
  font-size: 16px;
  color: #fff;
  border-radius: 19px;
  background: #3991ea;
  padding-left: 10px;
  padding-right: 10px;
  cursor: pointer;
`;

const divider = css`
  height: 24px;
  border-right: 1px solid #979797;
  margin: 0px 0px 0px 20px;
`;

const updateAvailableIcon = {
  icon: {
    color: '#FFF',
    fontSize: '20px',
  },
  root: {
    position: 'absolute',
    height: '20px',
    width: '20px',
    top: 'calc(50% - 10px)',
    right: '20px',
  },
  rootHovered: {
    backgroundColor: 'transparent',
  },
  rootPressed: {
    backgroundColor: 'transparent',
  },
};

const headerTextContainer = css`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const teachingBubbleStyle = {
  root: {
    selectors: {
      '.ms-Callout-beak': {
        background: NeutralColors.white,
      },
    },
  },
  bodyContent: {
    background: NeutralColors.white,
    selectors: {
      '.ms-TeachingBubble-headline': {
        color: NeutralColors.black,
        fontSize: FontSizes.size20,
      },
      '.ms-TeachingBubble-subText': {
        color: NeutralColors.black,
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

  const { languages, defaultLanguage } = settings;
  const { showing, status } = appUpdate;

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
            {/* <ActionButton>
              {`${projectName} (${locale})`}
            </ActionButton> */}
            <span
              css={botName}
              id="targetButton"
              onClick={() => setTeachingBubbleVisibility(true)}
            >{`${projectName} (${locale})`}</span>
          </Fragment>
        )}
      </div>
      {showUpdateAvailableIcon && (
        <IconButton
          iconProps={{ iconName: 'History' }}
          styles={updateAvailableIcon as IButtonStyles}
          title={formatMessage('Update available')}
          onClick={onUpdateAvailableClick}
        />
      )}
      {teachingBubbleVisibility && (
        <TeachingBubble
          isWide
          calloutProps={{ directionalHint: DirectionalHint.bottomLeftEdge }}
          headline={formatMessage('Active language')}
          styles={teachingBubbleStyle}
          target="#targetButton"
          onDismiss={() => setTeachingBubbleVisibility(false)}
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
      )}
    </div>
  );
};
